/**
 * The offline waiting list for count taps. Each tap becomes one operation
 * with a stable id that doubles as its Idempotency-Key, so every retry of
 * the same tap replays instead of counting again.
 *
 * The store persists through an injected storage interface (localStorage in
 * the app, a fake in tests), so queued taps survive reloads and the login
 * redirect. Corrupt or unwritable storage falls back to memory: the
 * in-memory truth is never sacrificed for the persisted copy.
 */

export const OUTBOX_STORAGE_KEY = "karimla.count-outbox"

export type CountOp = {
  /** Stable per tap. Sent as Idempotency-Key on every attempt. */
  id: string
  delta: 1 | -1
  groupId: string
  userId: string
  /** Session email that created the tap. Null when unknown. */
  ownerEmail: string | null
  createdAt: number
}

export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type OutboxSnapshot = {
  ops: CountOp[]
}

export type Outbox = {
  list(): CountOp[]
  enqueue(op: CountOp): void
  remove(id: string): void
  clear(): void
  subscribe(listener: () => void): () => void
  getSnapshot(): OutboxSnapshot
}

export function createCountOp(input: {
  delta: 1 | -1
  groupId: string
  userId: string
  ownerEmail: string | null
}): CountOp {
  return {
    id: crypto.randomUUID(),
    delta: input.delta,
    groupId: input.groupId,
    userId: input.userId,
    ownerEmail: input.ownerEmail,
    createdAt: Date.now(),
  }
}

function readStoredOps(storage: StorageLike): CountOp[] {
  let raw: string | null = null
  try {
    raw = storage.getItem(OUTBOX_STORAGE_KEY)
  } catch {
    return []
  }
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCountOp)
  } catch {
    return []
  }
}

function isCountOp(value: unknown): value is CountOp {
  if (!value || typeof value !== "object") return false
  const op = value as Record<string, unknown>
  return (
    typeof op.id === "string" &&
    (op.delta === 1 || op.delta === -1) &&
    typeof op.groupId === "string" &&
    typeof op.userId === "string" &&
    (op.ownerEmail === null || typeof op.ownerEmail === "string") &&
    typeof op.createdAt === "number"
  )
}

export function createOutbox(storage?: StorageLike): Outbox {
  let ops: CountOp[] = storage ? readStoredOps(storage) : []
  const listeners = new Set<() => void>()

  function persist(): void {
    if (!storage) return
    try {
      if (ops.length === 0) {
        storage.removeItem(OUTBOX_STORAGE_KEY)
      } else {
        storage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(ops))
      }
    } catch {
      // Quota or access failure: the in-memory list stays authoritative.
    }
  }

  function notify(): void {
    for (const listener of listeners) listener()
  }

  return {
    list: () => [...ops],

    enqueue(op: CountOp): void {
      if (ops.some((pending) => pending.id === op.id)) return
      ops = [...ops, op]
      persist()
      notify()
    },

    remove(id: string): void {
      if (!ops.some((pending) => pending.id === id)) return
      ops = ops.filter((pending) => pending.id !== id)
      persist()
      notify()
    },

    clear(): void {
      if (ops.length === 0) return
      ops = []
      persist()
      notify()
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    getSnapshot: (): OutboxSnapshot => ({ ops: [...ops] }),
  }
}
