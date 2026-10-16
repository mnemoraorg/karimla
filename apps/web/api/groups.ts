import { ApiError, apiRequest, ApiUnavailableError } from "./client"

export type Group = {
  id: string
  name: string
  phrase: string
  invite_code: string
}

export type GroupMember = {
  user_id: string
  display_name: string
  count: number
  you: boolean
}

export type GroupDetail = {
  group: Group
  members: GroupMember[]
}

export type GroupListItem = Group & {
  member_count: number
  members: Pick<GroupMember, "user_id" | "display_name" | "you">[]
}

export async function listGroups(): Promise<GroupListItem[]> {
  return apiRequest<GroupListItem[]>("/groups")
}

export type CreateGroupInput = {
  name: string
  phrase: string
}

export async function createGroup(input: CreateGroupInput): Promise<Group> {
  const name = input.name.trim()
  const phrase = input.phrase.trim()

  if (!name || !phrase) throw new Error("Give your group a name and a phrase to count.")

  return apiRequest<Group>("/groups", {
    method: "POST",
    body: JSON.stringify({ name, phrase }),
  })
}

export async function joinGroup(code: string): Promise<Group> {
  const normalizedCode = code.trim().toUpperCase()

  if (!normalizedCode) throw new Error("Enter your invite code.")

  return apiRequest<Group>("/groups/join", {
    method: "POST",
    body: JSON.stringify({ code: normalizedCode }),
  })
}

export async function getGroup(id: string): Promise<GroupDetail> {
  return apiRequest<GroupDetail>(`/groups/${id}`)
}

export async function sendGroupInvitations(groupId: string, emails: string[]): Promise<number> {
  const recipients = emails.map((email) => email.trim()).filter(Boolean)
  if (!groupId || recipients.length === 0 || recipients.length > 10) {
    throw new Error("Enter up to 10 email addresses to invite.")
  }

  const response = await apiRequest<{ sent_count: number }>(
    `/groups/${encodeURIComponent(groupId)}/invitations`,
    {
      method: "POST",
      body: JSON.stringify({ emails: recipients }),
      signal: AbortSignal.timeout(15_000),
    },
  )
  return response.sent_count
}

export type CountRequestOptions = {
  /**
   * One key per tap so a retried request replays instead of counting again.
   * Defaults to a fresh UUID; the sync engine passes the queued op id so its
   * retries share one key.
   */
  idempotencyKey?: string
}

export async function incrementMember(
  groupId: string,
  userId: string,
  options: CountRequestOptions = {},
): Promise<number> {
  try {
    const response = await apiRequest<{ count: number }>(
      `/groups/${groupId}/members/${userId}/increment`,
      {
        headers: { "Idempotency-Key": options.idempotencyKey ?? randomOperationKey() },
        method: "POST",
      },
    )
    return response.count
  } catch (error) {
    throw new Error(countErrorMessage(error))
  }
}

export async function decrementMember(
  groupId: string,
  userId: string,
  options: CountRequestOptions = {},
): Promise<number> {
  try {
    const response = await apiRequest<{ count: number }>(
      `/groups/${groupId}/members/${userId}/decrement`,
      {
        headers: { "Idempotency-Key": options.idempotencyKey ?? randomOperationKey() },
        method: "POST",
      },
    )
    return response.count
  } catch (error) {
    throw new Error(countErrorMessage(error))
  }
}

/**
 * One UUID per tap. The service replays a repeated key instead of counting
 * again, so a retried request is safe. Needs a secure context (https or
 * localhost), which is every context this app runs in.
 */
function randomOperationKey(): string {
  return crypto.randomUUID()
}

/**
 * Says what a failed tap means. Anything the service judged (validation and
 * other 4xx answers) keeps its own message; only transport failures get
 * rewritten into something the counter can act on.
 */
function countErrorMessage(error: unknown): string {
  if (error instanceof ApiUnavailableError) {
    return "Couldn't reach the counter. Check your connection and try again."
  }
  if (error instanceof ApiError && error.status >= 500) {
    return "The counter service is having trouble. Try again in a moment."
  }
  if (error instanceof Error) return error.message
  return "The count could not be saved."
}
