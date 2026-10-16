import { ApiError, ApiUnavailableError } from "@/api/client"

import type { CountOp, Outbox } from "./outbox"

/**
 * What a failed send means for a queued tap. Unreachable service and 5xx are
 * transient: the tap stays queued for the next flush. Anything the service
 * judged (validation and other 4xx answers) is dropped so the caller can roll
 * back and say so. A 401 parks the whole outbox until the session returns.
 */
export type FlushDirective = "keep" | "drop" | "park"

export function classifyFlushError(error: unknown): FlushDirective {
  if (error instanceof ApiUnavailableError) return "keep"
  if (error instanceof ApiError) {
    if (error.status === 401) return "park"
    if (error.status === 429 || error.status >= 500) return "keep"
    return "drop"
  }
  return "drop"
}

export type SendCountOp = (op: CountOp) => Promise<void>

export type RejectedOp = {
  op: CountOp
  error: Error
}

export type FlushReport = {
  sent: string[]
  rejected: RejectedOp[]
  parked: boolean
}

/**
 * Sends queued taps head-of-line in enqueue order. Deltas commute, so no
 * per-key queues are needed: every interleaving converges to the same total.
 * Stops at the first transient failure or 401, leaving the rest queued.
 * Taps owned by a different signed-in email are skipped, never adopted.
 */
export async function flushOutbox(
  outbox: Outbox,
  send: SendCountOp,
  currentEmail: string | null,
): Promise<FlushReport> {
  const report: FlushReport = { sent: [], rejected: [], parked: false }

  for (const op of outbox.list()) {
    if (op.ownerEmail && currentEmail && op.ownerEmail !== currentEmail) continue

    try {
      await send(op)
      outbox.remove(op.id)
      report.sent.push(op.id)
    } catch (error) {
      const directive = classifyFlushError(error)
      if (directive === "park") {
        report.parked = true
        return report
      }
      if (directive === "keep") return report
      outbox.remove(op.id)
      report.rejected.push({
        op,
        error: error instanceof Error ? error : new Error("The count could not be saved."),
      })
    }
  }

  return report
}
