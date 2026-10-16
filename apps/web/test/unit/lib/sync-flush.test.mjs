import { afterEach, describe, expect, it } from "bun:test"

import { setTestEnv } from "../env-test-setup.mjs"

const restoreEnv = setTestEnv()
const originalFetch = globalThis.fetch

const { ApiError, ApiUnavailableError } = await import("../../../api/client.ts")
const { createOutbox } = await import("../../../lib/sync/outbox.ts")
const { classifyFlushError, flushOutbox } = await import("../../../lib/sync/flush.ts")

afterEach(() => {
  globalThis.fetch = originalFetch
  restoreEnv()
})

function op(id, overrides = {}) {
  return {
    id,
    delta: 1,
    groupId: "g1",
    userId: "u1",
    ownerEmail: "person@example.com",
    createdAt: 1_000,
    ...overrides,
  }
}

describe("classifyFlushError", () => {
  it("queues transport trouble, drops judged taps, parks signed-out ones", () => {
    expect(classifyFlushError(new ApiUnavailableError())).toBe("keep")
    expect(classifyFlushError(new ApiError(503, "trouble"))).toBe("keep")
    expect(classifyFlushError(new ApiError(429, "slow down"))).toBe("keep")
    expect(classifyFlushError(new ApiError(401, "nope"))).toBe("park")
    expect(classifyFlushError(new ApiError(400, "bad tap"))).toBe("drop")
    expect(classifyFlushError(new Error("anything else"))).toBe("drop")
  })
})

describe("flushOutbox", () => {
  it("sends in order and acknowledges each tap", async () => {
    const outbox = createOutbox()
    outbox.enqueue(op("a"))
    outbox.enqueue(op("b"))
    const sent = []
    const send = async (pending) => {
      sent.push(pending.id)
    }

    const report = await flushOutbox(outbox, send, "person@example.com")

    expect(sent).toEqual(["a", "b"])
    expect(report).toEqual({ sent: ["a", "b"], rejected: [], parked: false })
    expect(outbox.list()).toEqual([])
  })

  it("stops at the first transient failure and leaves the rest queued", async () => {
    const outbox = createOutbox()
    outbox.enqueue(op("a"))
    outbox.enqueue(op("b"))
    const send = async (pending) => {
      if (pending.id === "a") throw new ApiUnavailableError()
    }

    const report = await flushOutbox(outbox, send, "person@example.com")

    expect(report).toEqual({ sent: [], rejected: [], parked: false })
    expect(outbox.list().map((pending) => pending.id)).toEqual(["a", "b"])
  })

  it("drops judged taps with their error and keeps going", async () => {
    const outbox = createOutbox()
    outbox.enqueue(op("a"))
    outbox.enqueue(op("b"))
    const send = async (pending) => {
      if (pending.id === "a") throw new ApiError(403, "Not a member")
    }

    const report = await flushOutbox(outbox, send, "person@example.com")

    expect(report.sent).toEqual(["b"])
    expect(report.rejected).toHaveLength(1)
    expect(report.rejected[0].op.id).toBe("a")
    expect(report.rejected[0].error.message).toBe("Not a member")
    expect(outbox.list()).toEqual([])
  })

  it("parks on 401 and leaves everything queued", async () => {
    const outbox = createOutbox()
    outbox.enqueue(op("a"))
    outbox.enqueue(op("b"))
    const send = async () => {
      throw new ApiError(401, "Unauthorized")
    }

    const report = await flushOutbox(outbox, send, "person@example.com")

    expect(report.parked).toBe(true)
    expect(report.sent).toEqual([])
    expect(outbox.list().map((pending) => pending.id)).toEqual(["a", "b"])
  })

  it("skips taps owned by a different signed-in email", async () => {
    const outbox = createOutbox()
    outbox.enqueue(op("a", { ownerEmail: "other@example.com" }))
    outbox.enqueue(op("b", { ownerEmail: "person@example.com" }))
    const sent = []
    const send = async (pending) => {
      sent.push(pending.id)
    }

    const report = await flushOutbox(outbox, send, "person@example.com")

    expect(sent).toEqual(["b"])
    expect(report.sent).toEqual(["b"])
    expect(outbox.list().map((pending) => pending.id)).toEqual(["a"])
  })

  it("sends nothing when there is nothing queued", async () => {
    const outbox = createOutbox()
    let calls = 0
    const send = async () => {
      calls += 1
    }

    const report = await flushOutbox(outbox, send, "person@example.com")

    expect(calls).toBe(0)
    expect(report).toEqual({ sent: [], rejected: [], parked: false })
  })
})
