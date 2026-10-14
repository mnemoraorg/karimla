import { readFile } from "node:fs/promises"

import Cloudflare from "cloudflare"

import type { EmailConfig } from "../../config/_types"

export interface VerificationOtpMessage {
  email: string
  otp: string
  type: "sign-in" | "email-verification" | "forget-password" | "change-email"
}

type CloudflareEmailClient = {
  emailSending: Pick<Cloudflare["emailSending"], "send">
}

const verificationOtpTemplate = new URL("../../templates/verification-otp.html", import.meta.url)

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
      "<": "&lt;",
      ">": "&gt;",
    }
    return entities[character]!
  })
}

export class CloudflareEmailSender {
  constructor(
    private readonly config: EmailConfig,
    private readonly client: CloudflareEmailClient = new Cloudflare({
      apiToken: config.apiToken,
    }),
  ) {}

  async sendVerificationOtp({ email, otp }: VerificationOtpMessage): Promise<void> {
    const html = (await readFile(verificationOtpTemplate, "utf8")).replaceAll(
      "{{otp}}",
      escapeHtml(otp),
    )

    try {
      const response = await this.client.emailSending.send({
        account_id: this.config.accountId,
        from: { address: this.config.from, name: "Karimla" },
        html,
        subject: "Your Karimla verification code",
        text: `Your Karimla verification code is ${otp}. It expires in 10 minutes.`,
        to: email,
      })

      if (
        response.permanent_bounces.includes(email) ||
        (![...response.delivered, ...response.queued].includes(email) &&
          response.permanent_bounces.length === 0)
      ) {
        throw new Error("Email delivery failed")
      }
    } catch {
      throw new Error("Verification email delivery failed")
    }
  }
}
