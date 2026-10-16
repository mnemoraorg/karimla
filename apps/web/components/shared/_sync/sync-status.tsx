"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type * as React from "react"

import { useSyncSnapshot } from "@/hooks/use-sync"
import { countSync } from "@/lib/sync/engine"
import { formatSavedAge, getLastSavedAt } from "@/lib/sync/snapshots"

import { Button } from "@packages/ui-w/shared/button/button"

/**
 * Honest sync state under the group total. Quiet when everything is synced
 * and online; every other state names itself and offers the next action.
 * The last-saved age appears only after mount so the server render and the
 * first client render agree.
 */
export function SyncStatus({ stale = false }: { stale?: boolean }): React.ReactElement | null {
  const snapshot = useSyncSnapshot()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function retryNow(): void {
    countSync.clearRejected()
    void countSync.flushNow()
  }

  const savedAt = mounted ? getLastSavedAt() : null
  const age = savedAt === null ? null : formatSavedAge(savedAt)

  if (snapshot.parked) {
    const waiting =
      snapshot.pending === 1 ? "1 tap is waiting." : `${snapshot.pending} taps are waiting.`
    return (
      <p className="text-muted-foreground text-center text-sm" role="status">
        You&apos;ve been signed out. {waiting}{" "}
        <Button render={<Link href="/login" />} size="sm" variant="link">
          Sign in to finish syncing
        </Button>
      </p>
    )
  }

  if (snapshot.rejected.length > 0) {
    const first = snapshot.rejected[0]
    const more =
      snapshot.rejected.length === 1
        ? "A tap couldn't sync."
        : `${snapshot.rejected.length} taps couldn't sync.`
    return (
      <p className="text-center text-sm" role="status">
        <span className="text-muted-foreground">
          {more} {first?.message}{" "}
        </span>
        <Button size="sm" variant="link" onClick={retryNow} type="button">
          Try again
        </Button>
      </p>
    )
  }

  if (!snapshot.online) {
    if (snapshot.pending === 0 && !stale) return null
    const waiting = snapshot.pending === 1 ? "1 tap waiting." : `${snapshot.pending} taps waiting.`
    return (
      <p className="text-muted-foreground text-center text-sm" role="status">
        You&apos;re offline.{" "}
        {snapshot.pending > 0 ? `${waiting} They'll sync when you reconnect. ` : ""}
        {age ? `Last saved ${age}.` : ""}
      </p>
    )
  }

  if (stale) {
    return (
      <p className="text-muted-foreground text-center text-sm" role="status">
        Couldn&apos;t refresh. Showing last saved{age ? ` from ${age}` : ""}.
      </p>
    )
  }

  if (snapshot.syncing) {
    return (
      <p className="text-muted-foreground text-center text-sm" role="status">
        Syncing…
      </p>
    )
  }

  if (snapshot.pending > 0) {
    const waiting =
      snapshot.pending === 1
        ? "1 tap waiting to sync."
        : `${snapshot.pending} taps waiting to sync.`
    return (
      <p className="text-center text-sm" role="status">
        <span className="text-muted-foreground">{waiting} </span>
        <Button size="sm" variant="link" onClick={retryNow} type="button">
          Try now
        </Button>
      </p>
    )
  }

  return null
}
