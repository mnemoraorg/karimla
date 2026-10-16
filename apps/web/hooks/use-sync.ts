"use client"

import { useSyncExternalStore } from "react"

import { countSync, type SyncSnapshot } from "@/lib/sync/engine"

/** Live view of the count sync engine for status UI. */
export function useSyncSnapshot(): SyncSnapshot {
  return useSyncExternalStore(countSync.subscribe, countSync.getSnapshot)
}
