import { apiRequest } from "./client"

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

export async function listGroups(): Promise<Group[]> {
  return apiRequest<Group[]>("/groups")
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

export async function incrementMember(groupId: string, userId: string): Promise<number> {
  const response = await apiRequest<{ count: number }>(
    `/groups/${groupId}/members/${userId}/increment`,
    { method: "POST" },
  )
  return response.count
}

export async function decrementMember(groupId: string, userId: string): Promise<number> {
  const response = await apiRequest<{ count: number }>(
    `/groups/${groupId}/members/${userId}/decrement`,
    { method: "POST" },
  )
  return response.count
}
