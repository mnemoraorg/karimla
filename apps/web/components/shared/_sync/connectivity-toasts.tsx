"use client"

import { useEffect, useRef } from "react"
import type * as React from "react"

import { Toast } from "@packages/ui-w/providers/toast-provider"

import { useSyncSnapshot } from "@/hooks/use-sync"
import { Toasts } from "@packages/ui-w/shared/toast/toast"

const connectivityManager: ReturnType<typeof Toast.createToastManager> = Toast.createToastManager()

const OFFLINE_TOAST_ID = "connectivity-offline"

/**
 * Top-center connectivity toasts on their own manager, so they never mix
 * with the bottom-left app toasts. Fires on transitions only: a persistent
 * warning while offline, a brief confirmation when back.
 */
export function ConnectivityToasts(): React.ReactElement {
  const snapshot = useSyncSnapshot()
  const previousOnline = useRef<boolean | null>(null)

  useEffect(() => {
    const before = previousOnline.current
    previousOnline.current = snapshot.online

    // Mounted while offline: say so once. Online mounts stay quiet.
    if (before === null) {
      if (!snapshot.online) showOfflineToast()
      return
    }
    if (before === snapshot.online) return

    if (!snapshot.online) {
      showOfflineToast()
      return
    }

    connectivityManager.close(OFFLINE_TOAST_ID)
    connectivityManager.add({
      title: "Back online",
      description: "Syncing your taps…",
      type: "success",
    })
  }, [snapshot.online])

  return (
    <Toast.Provider toastManager={connectivityManager}>
      <Toasts position="top-center" />
    </Toast.Provider>
  )
}

function showOfflineToast(): void {
  connectivityManager.add({
    id: OFFLINE_TOAST_ID,
    title: "You're offline",
    description: "New taps will wait and sync when you reconnect.",
    type: "warning",
    timeout: 0,
  })
}
