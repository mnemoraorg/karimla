"use client"

import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"

type DecrementButtonProps = {
  disabled?: boolean
  onClick: () => void
}

export function DecrementButton({ disabled, onClick }: DecrementButtonProps): React.ReactElement {
  return (
    <Button
      aria-label="Count one fewer karimla"
      className="flex-1"
      size="lg"
      disabled={disabled}
      onClick={onClick}
    >
      −
    </Button>
  )
}
