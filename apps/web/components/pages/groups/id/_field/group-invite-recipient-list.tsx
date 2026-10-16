import type * as React from "react"

import { RemoveInviteRecipientButton } from "@/components/pages/groups/id/_button/remove-invite-recipient-button"

import { Avatar } from "@packages/ui-w/shared/avatar/avatar"
import { AvatarFallback } from "@packages/ui-w/shared/avatar/avatar-fallback"

type GroupInviteRecipientListProps = {
  disabled: boolean
  onRemove: (email: string) => void
  recipients: string[]
}

export function GroupInviteRecipientList({
  disabled,
  onRemove,
  recipients,
}: GroupInviteRecipientListProps): React.ReactElement | null {
  if (recipients.length === 0) return null

  return (
    <ul
      aria-label="Invitation recipients"
      className="divide-border border-border divide-y overflow-hidden rounded-xl border"
    >
      {recipients.map((email) => (
        <li className="flex min-w-0 items-center gap-3 px-3 py-2" key={email}>
          <Avatar aria-hidden className="size-8">
            <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-sm">{email}</span>
          <RemoveInviteRecipientButton
            disabled={disabled}
            email={email}
            onRemove={() => onRemove(email)}
          />
        </li>
      ))}
    </ul>
  )
}
