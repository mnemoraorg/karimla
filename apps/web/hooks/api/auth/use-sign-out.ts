"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { signOut } from "@/api/auth/sign-out"

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.removeQueries()
      window.location.replace("/login")
    },
  })
}
