"use client"

import { useQuery } from "@tanstack/react-query"

import { getSession } from "@/api/auth/session"

import type { YappiSession } from "@/lib/auth/session-user"

export function useSession() {
  return useQuery<YappiSession | null, Error>({ queryKey: ["session"], queryFn: getSession })
}
