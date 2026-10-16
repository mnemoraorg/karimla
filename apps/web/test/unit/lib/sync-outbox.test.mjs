import { describe, expect, it } from "bun:test"

const { createCountOp, createOutbox, OUTBOX_STORAGE_KEY } =
  await import("../../../lib/sync/outbox.ts")

function op(overrides = {}) {
  return {
    id: `op-${Math.random().toString(36).slice(2)}`,
    delta: 1,
    groupId: "g1",
    userId: "u1",
    ownerEmail: "person@example.com",
    createdAt: 1_000,
    ...overrides,
  }
}

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

describe("createCountOp", () => {
  it("mints a unique key per tap", () => {
    const first = createCountOp({ delta: 1, groupId: "g1", userId: "u1", ownerEmail: null })
    const second = createCountOp({ delta: 1, groupId: "g1", userId: "u1", ownerEmail: null })

    expect(first.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(second.id).not.toBe(first.id)
  })
})

describe("outbox", () => {
  it("keeps taps in enqueue order and ignores duplicates", () => {
    const outbox = createOutbox()
    const first = op({ id: "a" })
    const second = op({ id: "b" })

    outbox.enqueue(first)
    outbox.enqueue(second)
    outbox.enqueue(first)

    expect(outbox.list()).toEqual([first, second])

    outbox.remove("a")
    expect(outbox.list()).toEqual([second])

    outbox.clear()
    expect(outbox.list()).toEqual([])
  })

  it("notifies subscribers on real changes and stays silent on no-ops", () => {
    const outbox = createOutbox()
    let calls = 0
    const unsubscribe = outbox.subscribe(() => {
      calls += 1
    })

    const pending = op({ id: "a" })
    outbox.enqueue(pending)
    outbox.remove("missing")
    outbox.remove("a")
    outbox.clear()
    unsubscribe()
    outbox.enqueue(op({ id: "b" }))

    expect(calls).toBe(2)
  })

  it("persists queued taps and rehydrates them", () => {
    const storage = memoryStorage()
    const outbox = createOutbox(storage)
    const pending = op({ id: "a" })

    outbox.enqueue(pending)
    expect(JSON.parse(storage.values[OUTBOX_STORAGE_KEY])).toEqual([pending])

    const revived = createOutbox(storage)
    expect(revived.list()).toEqual([pending])

    revived.remove("a")
    expect(OUTBOX_STORAGE_KEY in storage.values).toBe(false)
  })

  it("recovers from corrupt storage instead of crashing", () => {
    const storage = memoryStorage({ [OUTBOX_STORAGE_KEY]: "not-json{{{" })
    const outbox = createOutbox(storage)

    expect(outbox.list()).toEqual([])

    outbox.enqueue(op({ id: "a" }))
    expect(outbox.list()).toHaveLength(1)
  })

  it("keeps the in-memory truth when storage is unwritable", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota exceeded")
      },
      removeItem: () => {
        throw new Error("quota exceeded")
      },
    }
    const outbox = createOutbox(storage)
    const pending = op({ id: "a" })

    outbox.enqueue(pending)

    expect(outbox.list()).toEqual([pending])
  })
})
