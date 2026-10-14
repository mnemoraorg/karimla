"use client"

import { useMutation } from "@tanstack/react-query"

import { signOut } from "@/api/auth/sign-out"

export function useSignOut() {
  return useMutation<void, Error, void>({
    mutationFn: signOut,
    onSuccess: () => {
      window.location.replace("/login")
    },
  })
}
