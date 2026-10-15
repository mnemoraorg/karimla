"use client"

import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"

type DecrementButtonProps = {
  disabled?: boolean
  memberName: string
  onClick: () => void
}

export function DecrementButton({
  disabled,
  memberName,
  onClick,
}: DecrementButtonProps): React.ReactElement {
  return (
    <Button
      aria-label={`Count one fewer for ${memberName}`}
      className="flex-1"
      size="lg"
      disabled={disabled}
      onClick={onClick}
    >
      −
    </Button>
  )
}
