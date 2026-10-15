import type * as React from "react"

import type { Group } from "@/api/groups"

import { Button } from "@packages/ui-w/shared/button/button"

export function EmailInviteButton({ group }: { group: Group }): React.ReactElement {
  const subject = encodeURIComponent(`Join ${group.name} on Yappi`)
  const body = encodeURIComponent(
    `Join my group “${group.name}” and count every “${group.phrase}”. Use invite code ${group.invite_code}.`,
  )

  return (
    <Button className="w-full" render={<a href={`mailto:?subject=${subject}&body=${body}`} />}>
      Email invite
    </Button>
  )
}
