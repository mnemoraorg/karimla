import Link from "next/link"
import type * as React from "react"

import type { GroupListItem } from "@/api/groups"
import { GroupMemberAvatars } from "@/components/pages/home/_avatar/group-member-avatars"
import { Card } from "@packages/ui-w/shared/card/card"
import { CardDescription } from "@packages/ui-w/shared/card/card-description"
import { CardHeader } from "@packages/ui-w/shared/card/card-header"
import { CardTitle } from "@packages/ui-w/shared/card/card-title"

export function GroupCard({ group }: { group: GroupListItem }): React.ReactElement {
  return (
    <Link href={`/groups/${group.id}`} className="block rounded-xl">
      <Card className="hover:bg-accent/50 gap-0 transition-colors">
        <CardHeader className="flex flex-row items-end justify-between gap-4 p-5">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
            <CardDescription>Count every “{group.phrase}”</CardDescription>
          </div>
          <GroupMemberAvatars members={group.members} memberCount={group.member_count} />
        </CardHeader>
      </Card>
    </Link>
  )
}
