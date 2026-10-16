import { decrementMember, incrementMember } from "@/api/groups"

import { flushOutbox, type FlushReport } from "./flush"
import { createOutbox, type CountOp, type Outbox, type StorageLike } from "./outbox"

/**
 * The offline engine for count taps. One shared instance serves the app: taps
 * enqueue through it, and it flushes on demand, on reconnect, on focus, and
 * on an interval while work is pending. State is observable for the status
 * UI; all network and timer behavior stays inside start/stop/flushNow.
 */

export type SyncSnapshot = {
  online: boolean
  syncing: boolean
  parked: boolean
  pending: number
  rejected: { opId: string; message: string }[]
}

export type SyncEngine = {
  readonly outbox: Outbox
  onFlushed: (() => void) | null
  subscribe(listener: () => void): () => void
  getSnapshot(): SyncSnapshot
  submit(op: CountOp): Promise<{ synced: boolean; rejectedError: Error | null }>
  flushNow(): Promise<FlushReport>
  setSessionEmail(email: string | null): void
  clearRejected(): void
  start(): void
  stop(): void
}

const RETRY_INTERVAL_MS = 15_000
const MAX_REJECTED_KEPT = 5

async function sendCountOp(op: CountOp): Promise<void> {
  if (op.delta === 1) {
    await incrementMember(op.groupId, op.userId, { idempotencyKey: op.id })
  } else {
    await decrementMember(op.groupId, op.userId, { idempotencyKey: op.id })
  }
}

export function createSyncEngine(): SyncEngine {
  const browserStorage: StorageLike | undefined =
    typeof window === "undefined" ? undefined : window.localStorage
  const outbox = createOutbox(browserStorage)

  const listeners = new Set<() => void>()
  let online = typeof navigator === "undefined" ? true : navigator.onLine
  let syncing = false
  let parked = false
  let sessionEmail: string | null = null
  let rejected: { opId: string; message: string }[] = []
  let flushing: Promise<FlushReport> | null = null
  let interval: number | null = null
  let started = false

  const engine: SyncEngine = {
    outbox,
    onFlushed: null,

    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    getSnapshot(): SyncSnapshot {
      return {
        online,
        syncing,
        parked,
        pending: outbox.list().length,
        rejected: [...rejected],
      }
    },

    async submit(op: CountOp): Promise<{ synced: boolean; rejectedError: Error | null }> {
      outbox.enqueue(op)
      const report = await engine.flushNow()
      const failure = report.rejected.find((entry) => entry.op.id === op.id) ?? null
      return { synced: report.sent.includes(op.id), rejectedError: failure?.error ?? null }
    },

    async flushNow(): Promise<FlushReport> {
      if (flushing) return flushing
      // Passive triggers call unconditionally; skip the round trip (and the
      // syncing flash) when there is nothing to send.
      if (outbox.list().length === 0) return { sent: [], rejected: [], parked }
      flushing = runFlush()
      try {
        return await flushing
      } finally {
        flushing = null
      }
    },

    setSessionEmail(email: string | null): void {
      const arrived = sessionEmail === null && email !== null
      const changed = sessionEmail !== email
      sessionEmail = email
      if (!changed) return
      notify()
      if (arrived) {
        parked = false
        void engine.flushNow()
      }
    },

    clearRejected(): void {
      if (rejected.length === 0) return
      rejected = []
      notify()
    },

    start(): void {
      if (started || typeof window === "undefined") return
      started = true
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
      window.addEventListener("focus", handleFocus)
      interval = window.setInterval(() => {
        void engine.flushNow()
      }, RETRY_INTERVAL_MS)
    },

    stop(): void {
      if (!started || typeof window === "undefined") return
      started = false
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("focus", handleFocus)
      if (interval !== null) {
        window.clearInterval(interval)
        interval = null
      }
    },
  }

  function notify(): void {
    for (const listener of listeners) listener()
  }

  outbox.subscribe(notify)

  async function runFlush(): Promise<FlushReport> {
    syncing = true
    notify()
    try {
      const report = await flushOutbox(outbox, sendCountOp, sessionEmail)
      parked = report.parked
      if (report.sent.length > 0) {
        rejected = []
        engine.onFlushed?.()
      }
      for (const failure of report.rejected) {
        rejected = [{ opId: failure.op.id, message: failure.error.message }, ...rejected].slice(
          0,
          MAX_REJECTED_KEPT,
        )
      }
      return report
    } finally {
      syncing = false
      notify()
    }
  }

  function handleOnline(): void {
    if (online) return
    online = true
    notify()
    void engine.flushNow()
  }

  function handleOffline(): void {
    if (!online) return
    online = false
    notify()
  }

  function handleFocus(): void {
    if (outbox.list().length > 0) void engine.flushNow()
  }

  return engine
}

/** The app-wide instance. Tests build their own with createSyncEngine. */
export const countSync = createSyncEngine()
