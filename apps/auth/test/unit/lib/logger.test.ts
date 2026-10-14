import { describe, expect, it, vi } from "vitest"

import { describeError, logger, maskEmail } from "../../../lib/logger"

describe("logger", () => {
  it("masks email addresses keeping only the first letter and domain", () => {
    expect(maskEmail(" Person@Example.com ")).toBe("p***@example.com")
    expect(maskEmail("invalid")).toBe("***")
    expect(maskEmail("  ")).toBe("***")
  })

  it("describes errors without leaking internals", () => {
    expect(describeError(new Error("boom"))).toBe("boom")
    expect(describeError("boom")).toBe("Unknown error")
  })

  it("writes one JSON line per event", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    const error = vi.spyOn(console, "error").mockImplementation(() => {})

    try {
      logger.info("auth.test.event", { ok: true })
      logger.error("auth.test.failure")

      expect(info).toHaveBeenCalledOnce()
      expect(error).toHaveBeenCalledOnce()
      const line = JSON.parse(info.mock.calls[0]![0] as string)
      expect(line.event).toBe("auth.test.event")
      expect(line.level).toBe("info")
      expect(line.ok).toBe(true)
      expect(typeof line.timestamp).toBe("string")
    } finally {
      info.mockRestore()
      error.mockRestore()
    }
  })
})
