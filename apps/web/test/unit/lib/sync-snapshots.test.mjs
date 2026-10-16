import { describe, expect, it } from "bun:test"

import { QueryClient } from "@tanstack/react-query"

const { formatSavedAge, getLastSavedAt, restoreSnapshots, saveSnapshots, SNAPSHOTS_STORAGE_KEY } =
  await import("../../../lib/sync/snapshots.ts")

function memoryStorage(initial = {}) {
  const values = { ...initial }
  return {
    getItem: (key) => (key in values ? values[key] : null),
    setItem: (key, value) => {
      values[key] = String(value)
    },
    removeItem: (key) => {
      delete values[key]
    },
    values,
  }
}

function seed(client) {
  client.setQueryData(["group", "g1"], { group: { id: "g1" } })
  client.setQueryData(["groups", "with-member-previews"], [{ id: "g1" }])
  client.setQueryData(["session"], { email: "person@example.com" })
}

describe("snapshots", () => {
  it("round-trips group queries with their freshness and skips the rest", () => {
    const storage = memoryStorage()
    const before = new QueryClient()
    seed(before)
    saveSnapshots(before, storage, 7_000)

    const envelope = JSON.parse(storage.values[SNAPSHOTS_STORAGE_KEY])
    expect(envelope.version).toBe(1)
    expect(envelope.savedAt).toBe(7_000)
    expect(envelope.queries.map((entry) => entry.key)).toEqual([
      ["group", "g1"],
      ["groups", "with-member-previews"],
    ])
    expect(getLastSavedAt()).toBe(7_000)

    const after = new QueryClient()
    const savedAt = restoreSnapshots(after, storage, 8_000)

    expect(savedAt).toBe(7_000)
    expect(after.getQueryData(["group", "g1"])).toEqual({ group: { id: "g1" } })
    expect(after.getQueryData(["groups", "with-member-previews"])).toEqual([{ id: "g1" }])
    expect(after.getQueryData(["session"])).toBeUndefined()
  })

  it("drops missing, stale, corrupt, or versioned envelopes", () => {
    const fresh = new QueryClient()

    expect(restoreSnapshots(fresh, undefined, 1_000)).toBeNull()
    expect(restoreSnapshots(fresh, memoryStorage(), 1_000)).toBeNull()
    expect(getLastSavedAt()).toBeNull()

    const old = memoryStorage()
    const oldClient = new QueryClient()
    seed(oldClient)
    saveSnapshots(oldClient, old, 1_000)
    expect(restoreSnapshots(new QueryClient(), old, 1_000 + 8 * 24 * 60 * 60 * 1000)).toBeNull()

    const corrupt = memoryStorage({ [SNAPSHOTS_STORAGE_KEY]: "nope{{{" })
    expect(restoreSnapshots(new QueryClient(), corrupt, 1_000)).toBeNull()

    const future = memoryStorage()
    const writer = new QueryClient()
    seed(writer)
    saveSnapshots(writer, future, 1_000)
    const envelope = JSON.parse(future.values[SNAPSHOTS_STORAGE_KEY])
    envelope.version = 999
    future.values[SNAPSHOTS_STORAGE_KEY] = JSON.stringify(envelope)
    expect(restoreSnapshots(new QueryClient(), future, 2_000)).toBeNull()
  })

  it("keeps the live cache when storage is unwritable", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota exceeded")
      },
      removeItem: () => {
        throw new Error("quota exceeded")
      },
    }
    const client = new QueryClient()
    seed(client)

    saveSnapshots(client, storage, 1_000)

    expect(client.getQueryData(["group", "g1"])).toEqual({ group: { id: "g1" } })
    expect(getLastSavedAt()).toBe(1_000)
  })
})

describe("formatSavedAge", () => {
  it("names the age in plain words", () => {
    expect(formatSavedAge(0, 30_000)).toBe("just now")
    expect(formatSavedAge(0, 5 * 60_000)).toBe("5m ago")
    expect(formatSavedAge(0, 3 * 60 * 60_000)).toBe("3h ago")
    expect(formatSavedAge(0, 2 * 24 * 60 * 60_000)).toBe("2d ago")
  })
})
