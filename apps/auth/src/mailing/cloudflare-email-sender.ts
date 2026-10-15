import { readFile } from "node:fs/promises"

import Cloudflare from "cloudflare"

import type { EmailConfig } from "../../config/_types"
import { describeError, logger, maskEmail } from "../../lib/logger"

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

    const context = {
      email: maskEmail(email),
      from: maskEmail(this.config.from),
      subject: "Your Yappi verification code",
    }

    logger.info("auth.email.send.started", context)

    try {
      const response = await this.client.emailSending.send({
        account_id: this.config.accountId,
        from: { address: this.config.from, name: "Yappi" },
        html,
        subject: context.subject,
        text: `Your Yappi verification code is ${otp}. It expires in 10 minutes.`,
        to: email,
      })
      const delivery = {
        deliveredCount: response.delivered.length,
        permanentBounceCount: response.permanent_bounces.length,
        queuedCount: response.queued.length,
      }

      if (
        response.permanent_bounces.includes(email) ||
        (![...response.delivered, ...response.queued].includes(email) &&
          response.permanent_bounces.length === 0)
      ) {
        logger.error("auth.email.send.rejected", { ...context, ...delivery })
        throw new Error("Email delivery failed")
      }

      logger.info("auth.email.send.completed", { ...context, ...delivery })
    } catch (error) {
      if (!(error instanceof Error && error.message === "Email delivery failed")) {
        logger.error("auth.email.send.failed", { ...context, error: describeError(error) })
      }
      throw new Error("Verification email delivery failed")
    }
  }
}
