"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateUserName } from "@/api/auth/update-user"

export function useUpdateUserName() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: updateUserName,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session"] }),
  })
}
