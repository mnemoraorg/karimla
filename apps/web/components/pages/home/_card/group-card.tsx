"use client"

import Link from "next/link"
import type * as React from "react"

import type { GroupListItem } from "@/api/groups"
import { useSession } from "@/hooks/api/auth/use-session"

import { Avatar } from "@packages/ui-w/shared/avatar/avatar"
import { AvatarFallback } from "@packages/ui-w/shared/avatar/avatar-fallback"
import { Card } from "@packages/ui-w/shared/card/card"
import { CardDescription } from "@packages/ui-w/shared/card/card-description"
import { CardHeader } from "@packages/ui-w/shared/card/card-header"
import { CardTitle } from "@packages/ui-w/shared/card/card-title"

export function GroupCard({ group }: { group: GroupListItem }): React.ReactElement {
  const session = useSession()
  const visibleMembers = group.members ?? []
  const memberCount = group.member_count ?? visibleMembers.length
  const additionalMembers = Math.max(memberCount - visibleMembers.length, 0)

  return (
    <Link href={`/groups/${group.id}`} className="block rounded-xl">
      <Card className="hover:bg-accent/50 gap-0 transition-colors">
        <CardHeader className="flex flex-row items-end justify-between gap-4 p-5">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
            <CardDescription>Count every “{group.phrase}”</CardDescription>
          </div>
          <div
            aria-label={`${memberCount} members`}
            className="flex shrink-0 -space-x-2"
            role="group"
          >
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
              <Avatar
                aria-label={`${additionalMembers} more members`}
                className="ring-background ring-2"
              >
                <AvatarFallback>+{additionalMembers}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
