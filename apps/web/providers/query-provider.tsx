"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { restoreSnapshots, saveSnapshots } from "@/lib/sync/snapshots"
import type { StorageLike } from "@/lib/sync/outbox"

const SAVE_DEBOUNCE_MS = 500

function browserSnapshots(): StorageLike | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage
}

export function QueryProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: false,
        },
      },
    })
    // Last-known group data paints instantly on boot and refetches in the
    // background because restore keeps the original updatedAt.
    restoreSnapshots(client, browserSnapshots())
    return client
  })

  useEffect(() => {
    const storage = browserSnapshots()
    let timer: ReturnType<typeof setTimeout> | null = null
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      if (timer !== null) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        saveSnapshots(queryClient, storage)
      }, SAVE_DEBOUNCE_MS)
    })
    return () => {
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      saveSnapshots(queryClient, storage)
      unsubscribe()
    }
  }, [queryClient])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
