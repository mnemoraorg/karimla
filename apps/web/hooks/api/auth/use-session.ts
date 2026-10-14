"use client"

import { useQuery } from "@tanstack/react-query"

import { getSession } from "@/api/auth/session"

import type { KarimlaSession } from "@/lib/auth/session-user"

export function useSession() {
  return useQuery<KarimlaSession | null, Error>({ queryKey: ["session"], queryFn: getSession })
}
