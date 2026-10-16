"use client"

import { useEffect } from "react"
import type * as React from "react"

import { useQueryClient } from "@tanstack/react-query"

import { useSession } from "@/hooks/api/auth/use-session"
import { countSync } from "@/lib/sync/engine"

/**
 * Runs the count sync engine app-wide. Renders nothing: it starts the
 * online/focus/interval triggers, feeds the session email for op ownership,
 * and invalidates group queries after background syncs land.
 */
export function CountSyncEngine(): React.ReactElement | null {
  const queryClient = useQueryClient()
  const session = useSession()

  useEffect(() => {
    countSync.onFlushed = () => {
      queryClient.invalidateQueries({ queryKey: ["group"] })
    }
    countSync.start()
    return () => {
      countSync.stop()
      countSync.onFlushed = null
    }
  }, [queryClient])

  useEffect(() => {
    countSync.setSessionEmail(session.data?.email ?? null)
  }, [session.data?.email])

  return null
}
