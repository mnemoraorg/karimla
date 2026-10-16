"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import type * as React from "react"

import { useDecrementMember, useGroup, useIncrementMember } from "@/hooks/api/use-groups"
import { useSession } from "@/hooks/api/auth/use-session"

import { Button } from "@packages/ui-w/shared/button/button"
import { SpinnerFlicker01 } from "@packages/ui-w/shared/spinner-variant/spinner-flicker-01"

import { GroupMemberCountCard } from "@/components/pages/groups/id/_card/group-member-count-card"
import { ShareInviteCodeButton } from "@/components/pages/groups/id/_button/share-invite-code-button"
import { GroupEmailInviteDrawer } from "@/components/pages/groups/id/_drawer/group-email-invite-drawer"
import { SyncStatus } from "@/components/pages/groups/id/_status/sync-status"
import { PageHeader } from "@/components/shared/_header/page-header"

export default function Page(): React.ReactElement {
  const parameters = useParams()
  const id = Array.isArray(parameters.id) ? parameters.id[0] : parameters.id
  const group = useGroup(id)
  const session = useSession()
  const increment = useIncrementMember()
  const decrement = useDecrementMember()
  const isPending = increment.isPending || decrement.isPending
  const mutationError = increment.error ?? decrement.error

  if (group.isPending) {
    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <SpinnerFlicker01 className="size-6" />
      </div>
    )
  }

  if (group.error || !group.data) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-destructive text-center text-sm" role="alert">
          {group.error?.message ?? "Group could not be loaded."}
        </p>
        <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
          Back to groups
        </Link>
      </div>
    )
  }

  const groupData = group.data
  const totalCount = groupData.members.reduce((total, member) => total + member.count, 0)
  const members = [...groupData.members].sort((a, b) => Number(b.you) - Number(a.you))

  function countFor(userId: string): void {
    if (isPending) return
    increment.mutate({ groupId: groupData.group.id, userId })
  }

  function uncountFor(userId: string): void {
    if (isPending) return
    decrement.mutate({ groupId: groupData.group.id, userId })
  }

  return (
    <div className="flex min-h-[calc(100svh-10rem)] w-full flex-col gap-4 pt-8 pb-40">
      <PageHeader
        fixed
        leading={
          <Button aria-label="Back to groups" render={<Link href="/" />} size="icon">
            <IconArrowLeft />
          </Button>
        }
        title={groupData.group.name}
      />

      <div className="flex flex-col items-center gap-1 text-center">
        <p
          aria-label={`Total group count: ${totalCount}`}
          className="text-6xl font-semibold tabular-nums"
        >
          {totalCount}
        </p>
        <p className="text-muted-foreground text-sm">Count every “{groupData.group.phrase}”</p>
        <SyncStatus />
      </div>
      <ul className="mt-8 flex flex-col gap-4">
        {members.map((member) => {
          const name = session.data?.name?.trim()
          const displayName = member.you ? name || "You" : member.display_name
          return (
            <li key={member.user_id}>
              <GroupMemberCountCard
                disabled={isPending}
                displayName={displayName}
                isCurrentUser={member.you}
                member={member}
                onDecrement={() => uncountFor(member.user_id)}
                onIncrement={() => countFor(member.user_id)}
                pending={increment.isPending}
              />
            </li>
          )
        })}
      </ul>

      {mutationError && (
        <p className="text-destructive text-center text-sm" role="alert">
          {mutationError.message}
        </p>
      )}
      <footer className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md flex-col gap-3 border-t px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+--spacing(4))] backdrop-blur">
        <GroupEmailInviteDrawer group={groupData.group} />
        <ShareInviteCodeButton group={groupData.group} />
      </footer>
    </div>
  )
}
