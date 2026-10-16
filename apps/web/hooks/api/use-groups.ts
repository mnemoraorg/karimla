"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createGroup,
  decrementMember,
  getGroup,
  incrementMember,
  joinGroup,
  listGroups,
  sendGroupInvitations,
  type CreateGroupInput,
  type GroupDetail,
} from "@/api/groups"
import { withMemberCountAdjusted } from "@/lib/group-counts"

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

function useMemberCount(delta: 1 | -1) {
  const queryClient = useQueryClient()
  const request = delta === 1 ? incrementMember : decrementMember
  return useMutation<number, Error, MemberCountInput, MemberCountRollback>({
    mutationFn: ({ groupId, userId }) => request(groupId, userId),
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
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] })
    },
  })
}
