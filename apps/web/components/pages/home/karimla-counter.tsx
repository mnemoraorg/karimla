"use client"

import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"
import { useCounter, useIncrementCounter } from "@/hooks/api/use-counter"

export function KarimlaCounter(): React.ReactElement {
  const counter = useCounter()
  const increment = useIncrementCounter()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6">
      <p className="text-muted-foreground text-sm">You have said karimla</p>
      <p className="text-6xl font-semibold tabular-nums">{counter.data ?? 0}</p>
      <Button
        size="lg"
        disabled={counter.isPending || increment.isPending}
        onClick={() => increment.mutate()}
      >
        {increment.isPending ? "Counting…" : "karimla"}
      </Button>
      {(counter.error || increment.error) && (
        <p className="text-destructive text-center text-sm" role="alert">
          {(counter.error ?? increment.error)?.message}
        </p>
      )}
    </div>
  )
}
