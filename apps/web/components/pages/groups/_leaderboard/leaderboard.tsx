"use client"

import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"

export type LeaderboardEntry = {
  userId: string
  displayName: string
  count: number
  you: boolean
}

type LeaderboardProps = {
  entries: LeaderboardEntry[]
  disabled?: boolean
  onIncrement: (userId: string) => void
  onDecrement: (userId: string) => void
}

export function Leaderboard({
  entries,
  disabled,
  onIncrement,
  onDecrement,
}: LeaderboardProps): React.ReactElement {
  return (
    <section aria-label="Leaderboard" className="border-border bg-card rounded-2xl border p-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Leaderboard</h2>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-center text-sm">
            No members yet — invite them and they&apos;ll show up here.
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {entries.map((entry, rank) => (
              <li key={entry.userId} className="flex items-center gap-2">
                <span className="text-muted-foreground w-6 text-sm tabular-nums">{rank + 1}</span>
                <span className="flex-1 truncate text-sm font-medium">
                  {entry.you ? "You" : entry.displayName}
                </span>
                <span className="w-8 text-right text-sm tabular-nums">{entry.count}</span>
                <Button
                  aria-label={`Count one fewer for ${entry.displayName}`}
                  disabled={disabled}
                  size="sm"
                  onClick={() => onDecrement(entry.userId)}
                  type="button"
                >
                  −
                </Button>
                <Button
                  aria-label={`Count one more for ${entry.displayName}`}
                  disabled={disabled}
                  size="sm"
                  onClick={() => onIncrement(entry.userId)}
                  type="button"
                >
                  +
                </Button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
