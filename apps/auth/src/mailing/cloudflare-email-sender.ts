import { readFile } from "node:fs/promises"

import Cloudflare from "cloudflare"

import type { EmailConfig } from "../../config/_types"

export interface MagicLinkMessage {
  email: string
  url: string
}

type CloudflareEmailClient = {
  emailSending: Pick<Cloudflare["emailSending"], "send">
}

const magicLinkTemplate = new URL("../../templates/magic-link.html", import.meta.url)

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

  async sendMagicLink({ email, url }: MagicLinkMessage): Promise<void> {
    const html = (await readFile(magicLinkTemplate, "utf8")).replaceAll(
      "{{magic_link}}",
      escapeHtml(url),
    )

    try {
      const response = await this.client.emailSending.send({
        account_id: this.config.accountId,
        from: { address: this.config.from, name: "Karimla" },
        html,
        subject: "Your sign-in link for Karimla",
        text: `Sign in to Karimla with this link: ${url}\n\nThis link expires in 10 minutes.`,
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
      throw new Error("Magic-link email delivery failed")
    }
  }
}
