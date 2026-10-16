import type { QueryClient } from "@tanstack/react-query"

import type { StorageLike } from "./outbox"

/**
 * Last-known group data for stale-and-honest renders. Only group keys are
 * persisted (never session-shaped data); everything else keeps today's
 * behavior. Restored entries keep their original updatedAt so they render
 * instantly but refetch in the background.
 */

export const SNAPSHOTS_STORAGE_KEY = "karimla.query-snapshots"

const SNAPSHOT_VERSION = 1

const SNAPSHOT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

const SNAPSHOT_KEY_PREFIXES = ["group", "groups"]

type SnapshotEntry = {
  key: unknown[]
  data: unknown
  updatedAt: number
}

type SnapshotEnvelope = {
  version: number
  savedAt: number
  queries: SnapshotEntry[]
}

let lastSavedAt: number | null = null

export function getLastSavedAt(): number | null {
  return lastSavedAt
}

export function formatSavedAge(savedAt: number, now: number = Date.now()): string {
  const ageMs = Math.max(0, now - savedAt)
  const minutes = Math.floor(ageMs / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function isSnapshotKey(key: unknown): boolean {
  return Array.isArray(key) && key.length > 0 && SNAPSHOT_KEY_PREFIXES.includes(String(key[0]))
}

function isSnapshotEntry(value: unknown): value is SnapshotEntry {
  if (!value || typeof value !== "object") return false
  const entry = value as Record<string, unknown>
  return isSnapshotKey(entry.key) && typeof entry.updatedAt === "number" && "data" in entry
}

function readEnvelope(storage: StorageLike): SnapshotEnvelope | null {
  let raw: string | null = null
  try {
    raw = storage.getItem(SNAPSHOTS_STORAGE_KEY)
  } catch {
    return null
  }
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    const envelope = parsed as Partial<SnapshotEnvelope>
    if (envelope.version !== SNAPSHOT_VERSION) return null
    if (typeof envelope.savedAt !== "number" || !Array.isArray(envelope.queries)) return null
    return {
      version: SNAPSHOT_VERSION,
      savedAt: envelope.savedAt,
      queries: envelope.queries.filter(isSnapshotEntry),
    }
  } catch {
    return null
  }
}

/**
 * Writes the current group queries. Returns nothing; storage trouble only
 * drops the persisted copy, never the live cache.
 */
export function saveSnapshots(
  queryClient: QueryClient,
  storage: StorageLike | undefined,
  now: number = Date.now(),
): void {
  if (!storage) return

  const queries: SnapshotEntry[] = []
  for (const query of queryClient.getQueryCache().getAll()) {
    if (!isSnapshotKey(query.queryKey) || query.state.data === undefined) continue
    queries.push({
      key: [...query.queryKey],
      data: query.state.data,
      updatedAt: query.state.dataUpdatedAt,
    })
  }

  lastSavedAt = now
  try {
    if (queries.length === 0) {
      storage.removeItem(SNAPSHOTS_STORAGE_KEY)
    } else {
      const envelope: SnapshotEnvelope = { version: SNAPSHOT_VERSION, savedAt: now, queries }
      storage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(envelope))
    }
  } catch {
    // Quota or access failure: the live cache stays authoritative.
  }
}

/**
 * Restores group queries saved earlier. Returns the envelope age for honest
 * staleness copy, or null when there is nothing usable.
 */
export function restoreSnapshots(
  queryClient: QueryClient,
  storage: StorageLike | undefined,
  now: number = Date.now(),
): number | null {
  lastSavedAt = null
  if (!storage) return null

  const envelope = readEnvelope(storage)
  if (!envelope || now - envelope.savedAt > SNAPSHOT_MAX_AGE_MS) return null

  for (const entry of envelope.queries) {
    queryClient.setQueryData(entry.key, entry.data, { updatedAt: entry.updatedAt })
  }
  lastSavedAt = envelope.savedAt
  return envelope.savedAt
}
