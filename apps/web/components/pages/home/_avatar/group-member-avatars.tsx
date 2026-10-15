"use client"

import type * as React from "react"

import type { GroupListItem } from "@/api/groups"
import { useSession } from "@/hooks/api/auth/use-session"

import { Avatar } from "@packages/ui-w/shared/avatar/avatar"
import { AvatarFallback } from "@packages/ui-w/shared/avatar/avatar-fallback"

type GroupMemberAvatarsProps = {
  members?: GroupListItem["members"]
  memberCount?: number
}

export function GroupMemberAvatars({
  members = [],
  memberCount,
}: GroupMemberAvatarsProps): React.ReactElement {
  const session = useSession()
  const visibleMembers = members.slice(0, 2)
  const totalMembers = memberCount ?? members.length
  const additionalMembers = Math.max(totalMembers - visibleMembers.length, 0)

  return (
    <div aria-label={`${totalMembers} members`} className="flex shrink-0 -space-x-2" role="group">
      {visibleMembers.map((member) => {
        const name = member.you
          ? session.data?.name?.trim() || member.display_name
          : member.display_name
        const initials = name
          .trim()
          .split(/\s+/)
          .map((part) => part[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()

        return (
          <Avatar aria-label={name} className="ring-background ring-2" key={member.user_id}>
            <AvatarFallback>{initials || "?"}</AvatarFallback>
          </Avatar>
        )
      })}
      {additionalMembers > 0 && (
        <Avatar aria-label={`${additionalMembers} more members`} className="ring-background ring-2">
          <AvatarFallback>+{additionalMembers}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
