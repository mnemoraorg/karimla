"use client"

import { useMutation } from "@tanstack/react-query"

import { signInWithOtp, type SignInWithOtpInput } from "@/api/auth/sign-in"

export function useSignInWithOtp() {
  return useMutation<void, Error, SignInWithOtpInput>({ mutationFn: signInWithOtp })
}
