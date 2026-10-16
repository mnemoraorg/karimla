import type * as React from "react"
import { IconX } from "@tabler/icons-react"

import { Button } from "@packages/ui-w/shared/button/button"

export function RemoveInviteRecipientButton({
  disabled,
  email,
  onRemove,
}: {
  disabled: boolean
  email: string
  onRemove: () => void
}): React.ReactElement {
  return (
    <Button
      aria-label={`Remove ${email}`}
      disabled={disabled}
      onClick={onRemove}
      size="icon-xs"
      variant="ghost"
    >
      <IconX aria-hidden />
    </Button>
  )
}
