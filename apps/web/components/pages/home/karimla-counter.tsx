"use client"

import type * as React from "react"

import { DecrementButton } from "@/components/pages/home/_button/decrement-button"
import { IncrementButton } from "@/components/pages/home/_button/increment-button"
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
        <DecrementButton disabled={isPending} onClick={() => decrement.mutate()} />
        <IncrementButton
          disabled={isPending}
          pending={increment.isPending}
          onClick={() => increment.mutate()}
        />
      </div>
      {(counter.error || increment.error || decrement.error) && (
        <p className="text-destructive text-center text-sm" role="alert">
          {(counter.error ?? increment.error ?? decrement.error)?.message}
        </p>
      )}
    </div>
  )
}
