"use client"

import type * as React from "react"

import type { GroupMember } from "@/api/groups"

import { Card } from "@packages/ui-w/shared/card/card"
import { CardFooter } from "@packages/ui-w/shared/card/card-footer"
import { CardHeader } from "@packages/ui-w/shared/card/card-header"
import { CardTitle } from "@packages/ui-w/shared/card/card-title"
import { DecrementButton } from "@/components/pages/groups/id/_button/decrement-button"
import { IncrementButton } from "@/components/pages/groups/id/_button/increment-button"

type GroupMemberCountCardProps = {
  member: GroupMember
  displayName: string
  isCurrentUser: boolean
  disabled: boolean
  pending: boolean
  onDecrement: () => void
  onIncrement: () => void
}

export function GroupMemberCountCard({
  member,
  displayName,
  isCurrentUser,
  disabled,
  pending,
  onDecrement,
  onIncrement,
}: GroupMemberCountCardProps): React.ReactElement {
  const memberName = isCurrentUser
    ? `You${displayName === "You" ? "" : ` (${displayName})`}`
    : displayName

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {isCurrentUser ? (
            <>
              <span className="text-foreground font-semibold">You</span>
              {displayName !== "You" && (
                <span className="text-muted-foreground text-sm font-normal"> ({displayName})</span>
              )}
            </>
          ) : (
            displayName
          )}
        </CardTitle>
        <p aria-label={`${member.count} counts`} className="text-xl font-semibold tabular-nums">
          {member.count}
        </p>
      </CardHeader>
      <CardFooter className="gap-3 pt-0">
        <DecrementButton disabled={disabled} memberName={memberName} onClick={onDecrement} />
        <IncrementButton
          disabled={disabled}
          memberName={memberName}
          pending={pending}
          onClick={onIncrement}
        />
      </CardFooter>
    </Card>
  )
}
