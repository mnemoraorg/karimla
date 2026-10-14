"use client"

import { useMutation } from "@tanstack/react-query"

import { sendLoginOtp } from "@/api/auth/send-otp"

export function useSendLoginOtp() {
  return useMutation<void, Error, string>({ mutationFn: sendLoginOtp })
}
