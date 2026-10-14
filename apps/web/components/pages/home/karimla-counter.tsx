"use client"

import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"
import { useCounter, useDecrementCounter, useIncrementCounter } from "@/hooks/api/use-counter"

export function KarimlaCounter(): React.ReactElement {
  const counter = useCounter()
  const increment = useIncrementCounter()
  const decrement = useDecrementCounter()
  const isPending = counter.isPending || increment.isPending || decrement.isPending

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6">
      <p className="text-muted-foreground text-sm">You have said karimla</p>
      <p className="text-6xl font-semibold tabular-nums">{counter.data ?? 0}</p>
      <div className="flex w-full max-w-xs gap-3">
        <Button
          aria-label="Count one fewer karimla"
          className="flex-1"
          size="lg"
          disabled={isPending}
          onClick={() => decrement.mutate()}
        >
          −
        </Button>
        <Button
          aria-label="Count one more karimla"
          className="flex-1"
          size="lg"
          disabled={isPending}
          onClick={() => increment.mutate()}
        >
          {increment.isPending ? "Counting…" : "+"}
        </Button>
      </div>
      {(counter.error || increment.error || decrement.error) && (
        <p className="text-destructive text-center text-sm" role="alert">
          {(counter.error ?? increment.error ?? decrement.error)?.message}
        </p>
      )}
    </div>
  )
}
