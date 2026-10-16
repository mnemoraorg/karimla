import type * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"

export function SendGroupInvitationsButton({
  disabled,
  pending,
}: {
  disabled: boolean
  pending: boolean
}): React.ReactElement {
  return (
    <Button className="w-full" disabled={disabled || pending} type="submit">
      {pending ? "Sending invitations…" : "Send invitations"}
    </Button>
  )
}
