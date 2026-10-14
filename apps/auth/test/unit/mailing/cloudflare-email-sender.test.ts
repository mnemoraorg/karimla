import { describe, expect, it, vi } from "vitest"

import type { EmailConfig } from "../../../config/_types"
import { CloudflareEmailSender } from "../../../src/mailing/cloudflare-email-sender"

const config: EmailConfig = {
  accountId: "account-id",
  apiToken: "api-token",
  from: "login@example.com",
}

describe("CloudflareEmailSender", () => {
  it("sends the verification code to the requested address", async () => {
    const send = vi.fn().mockResolvedValue({
      delivered: ["user@example.com"],
      queued: [],
      permanent_bounces: [],
    })
    const client = { emailSending: { send } }
    const sender = new CloudflareEmailSender(config, client)

    await sender.sendVerificationOtp({ email: "user@example.com", otp: "123456", type: "sign-in" })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "Your Karimla verification code",
        html: expect.stringContaining("123456"),
      }),
    )
    const email = send.mock.calls[0]![0] as { html: string }
    expect(email.html).not.toContain("{{otp}}")
  })

  it("reports rejected delivery without exposing provider details", async () => {
    const send = vi.fn().mockResolvedValue({
      delivered: [],
      queued: [],
      permanent_bounces: ["user@example.com"],
    })
    const sender = new CloudflareEmailSender(config, { emailSending: { send } })

    await expect(
      sender.sendVerificationOtp({ email: "user@example.com", otp: "123456", type: "sign-in" }),
    ).rejects.toThrow("Verification email delivery failed")
  })
})
