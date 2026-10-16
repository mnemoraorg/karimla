"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createGroup,
  getGroup,
  joinGroup,
  listGroups,
  sendGroupInvitations,
  type CreateGroupInput,
  type GroupDetail,
} from "@/api/groups"
import type { YappiSession } from "@/lib/auth/session-user"
import { withMemberCountAdjusted } from "@/lib/group-counts"
import { createCountOp } from "@/lib/sync/outbox"
import { countSync } from "@/lib/sync/engine"

export function useGroups() {
  return useQuery({ queryKey: ["groups", "with-member-previews"], queryFn: listGroups })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: joinGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  })
}

export function useGroup(id: string | undefined) {
  return useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroup(id ?? ""),
    enabled: Boolean(id),
  })
}

export type GroupInvitationsInput = {
  groupId: string
  emails: string[]
}

export function useSendGroupInvitations() {
  return useMutation<number, Error, GroupInvitationsInput>({
    mutationFn: ({ groupId, emails }) => sendGroupInvitations(groupId, emails),
  })
}

export type MemberCountInput = {
  groupId: string
  userId: string
}

export function useIncrementMember() {
  return useMemberCount(1)
}

export function useDecrementMember() {
  return useMemberCount(-1)
}

type MemberCountRollback = {
  previous: GroupDetail | undefined
}

type MemberCountResult = {
  synced: boolean
}

function useMemberCount(delta: 1 | -1) {
  const queryClient = useQueryClient()
  return useMutation<MemberCountResult, Error, MemberCountInput, MemberCountRollback>({
    mutationFn: async (variables) => {
      const session = queryClient.getQueryData<YappiSession | null>(["session"])
      const op = createCountOp({
        delta,
        groupId: variables.groupId,
        userId: variables.userId,
        ownerEmail: session?.email ?? null,
      })
      const outcome = await countSync.submit(op)
      if (outcome.rejectedError) throw outcome.rejectedError
      return { synced: outcome.synced }
    },
    onMutate: async (variables) => {
      const queryKey = ["group", variables.groupId]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<GroupDetail>(queryKey)
      queryClient.setQueryData<GroupDetail>(queryKey, (old) =>
        withMemberCountAdjusted(old, variables.userId, delta),
      )
      return { previous }
    },
    onError: (_error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["group", variables.groupId], context.previous)
      }
    },
    onSuccess: (result, variables) => {
      // A merely queued tap must not invalidate: the refetch would fail
      // offline and replace the page with the group error screen.
      if (result.synced) {
        queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] })
      }
    },
  })
}
