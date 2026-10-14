"use client"

import type * as React from "react"

import { useCounter } from "@/hooks/api/use-counter"

export function Leaderboard(): React.ReactElement {
  const counter = useCounter()

  return (
    <section aria-label="Leaderboard" className="border-border bg-card rounded-2xl border p-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Leaderboard</h2>
        {counter.data != null && (
          <ol>
            <li className="border-border flex items-center gap-3 border-t pt-4">
              <span className="text-muted-foreground w-6 text-sm tabular-nums">1</span>
              <span className="flex-1 text-sm font-medium">You</span>
              <span className="text-sm tabular-nums">{counter.data}</span>
            </li>
          </ol>
        )}
        <p className="text-muted-foreground text-center text-sm">
          No friends yet — invite them and they&apos;ll show up here.
        </p>
      </div>
    </section>
  )
}
