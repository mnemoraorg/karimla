"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createGroup,
  decrementMember,
  getGroup,
  incrementMember,
  joinGroup,
  listGroups,
  type CreateGroupInput,
} from "@/api/groups"

export function useGroups() {
  return useQuery({ queryKey: ["groups"], queryFn: listGroups })
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

export type MemberCountInput = {
  groupId: string
  userId: string
}

export function useIncrementMember() {
  const queryClient = useQueryClient()
  return useMutation<number, Error, MemberCountInput>({
    mutationFn: ({ groupId, userId }) => incrementMember(groupId, userId),
    onSuccess: (_count, variables) =>
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] }),
  })
}

export function useDecrementMember() {
  const queryClient = useQueryClient()
  return useMutation<number, Error, MemberCountInput>({
    mutationFn: ({ groupId, userId }) => decrementMember(groupId, userId),
    onSuccess: (_count, variables) =>
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] }),
  })
}
