import { describe, expect, it, vi } from "vitest"

import type { EmailConfig } from "../../../config/_types"
import { CloudflareEmailSender } from "../../../src/mailing/cloudflare-email-sender"

const config: EmailConfig = {
  accountId: "account-id",
  apiToken: "api-token",
  from: "login@example.com",
}

describe("CloudflareEmailSender", () => {
  it("sends an escaped magic link to the requested address", async () => {
    const send = vi.fn().mockResolvedValue({
      delivered: ["user@example.com"],
      queued: [],
      permanent_bounces: [],
    })
    const client = { emailSending: { send } }
    const sender = new CloudflareEmailSender(config, client)

    await sender.sendMagicLink({
      email: "user@example.com",
      url: "https://auth.example/verify?token=secret&callbackURL=https://app.example/",
    })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "Your sign-in link for Karimla",
        html: expect.stringContaining("token=secret&amp;callbackURL="),
      }),
    )
  })

  it("reports rejected delivery without exposing provider details", async () => {
    const send = vi.fn().mockResolvedValue({
      delivered: [],
      queued: [],
      permanent_bounces: ["user@example.com"],
    })
    const sender = new CloudflareEmailSender(config, { emailSending: { send } })

    await expect(
      sender.sendMagicLink({ email: "user@example.com", url: "https://auth.example/token" }),
    ).rejects.toThrow("Magic-link email delivery failed")
  })
})
