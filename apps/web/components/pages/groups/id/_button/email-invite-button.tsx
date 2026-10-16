import type * as React from "react"

import { cn } from "@packages/ui-w/lib/utils"
import { Button, type ButtonProps } from "@packages/ui-w/shared/button/button"

export function EmailInviteButton({
  children = "Email invite",
  className,
  key: _key,
  ...props
}: ButtonProps): React.ReactElement {
  return (
    <Button className={cn("w-full", className)} {...props}>
      {children}
    </Button>
  )
}
