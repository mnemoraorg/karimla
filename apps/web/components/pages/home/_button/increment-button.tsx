"use client"

import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"

type IncrementButtonProps = {
  disabled?: boolean
  pending?: boolean
  onClick: () => void
}

export function IncrementButton({
  disabled,
  pending,
  onClick,
}: IncrementButtonProps): React.ReactElement {
  return (
    <Button
      aria-label="Count one more karimla"
      className="flex-1"
      size="lg"
      disabled={disabled}
      onClick={onClick}
    >
      {pending ? "Counting…" : "+"}
    </Button>
  )
}
