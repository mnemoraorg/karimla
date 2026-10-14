"use client"

import { useMutation } from "@tanstack/react-query"

import { sendMagicLink, type SendMagicLinkInput } from "@/api/auth/send-magic-link"

export function useSendMagicLink() {
  return useMutation<void, Error, SendMagicLinkInput>({ mutationFn: sendMagicLink })
}
