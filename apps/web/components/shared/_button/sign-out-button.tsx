"use client"

import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"

type SignOutButtonProps = {
  disabled?: boolean
  pending?: boolean
  onClick: () => void
}

export function SignOutButton({
  disabled,
  pending,
  onClick,
}: SignOutButtonProps): React.ReactElement {
  return (
    <Button className="w-full" disabled={disabled} onClick={onClick} type="button">
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  )
}
