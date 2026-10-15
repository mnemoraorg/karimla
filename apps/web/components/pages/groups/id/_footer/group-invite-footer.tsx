import type * as React from "react"

import type { Group } from "@/api/groups"
import { EmailInviteButton } from "@/components/pages/groups/id/_button/email-invite-button"
import { ShareInviteCodeButton } from "@/components/pages/groups/id/_button/share-invite-code-button"

export function GroupInviteFooter({ group }: { group: Group }): React.ReactElement {
  return (
    <footer className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md flex-col gap-3 border-t px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+--spacing(4))] backdrop-blur">
      <EmailInviteButton group={group} />
      <ShareInviteCodeButton group={group} />
    </footer>
  )
}
