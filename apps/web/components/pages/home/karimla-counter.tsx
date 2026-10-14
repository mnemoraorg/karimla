"use client"

import type * as React from "react"
import { useEffect, useState } from "react"

import { Button } from "@packages/ui-w/shared/button/button"

// shortcut: per-browser count until authentication gives each user their own count
const STORAGE_KEY = "karimla.count"

export function KarimlaCounter(): React.ReactElement {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(Number(window.localStorage.getItem(STORAGE_KEY)) || 0)
  }, [])

  function handleClick(): void {
    const next = count + 1
    setCount(next)
    window.localStorage.setItem(STORAGE_KEY, String(next))
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6">
      <p className="text-muted-foreground text-sm">You have said karimla</p>
      <p className="text-6xl font-semibold tabular-nums">{count}</p>
      <Button size="lg" onClick={handleClick}>
        karimla
      </Button>
    </div>
  )
}
