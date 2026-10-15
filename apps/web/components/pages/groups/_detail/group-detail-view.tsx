"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import type * as React from "react"

import { useDecrementMember, useGroup, useIncrementMember } from "@/hooks/api/use-groups"

import { DecrementButton } from "@/components/shared/_button/decrement-button"
import { IncrementButton } from "@/components/shared/_button/increment-button"
import { Leaderboard } from "@/components/pages/groups/_leaderboard/leaderboard"

export function GroupDetailView(): React.ReactElement {
  const parameters = useParams()
  const id = Array.isArray(parameters.id) ? parameters.id[0] : parameters.id
  const group = useGroup(id)
  const increment = useIncrementMember()
  const decrement = useDecrementMember()
  const isPending = increment.isPending || decrement.isPending
  const mutationError = increment.error ?? decrement.error

  if (group.isPending) {
    return <p className="text-muted-foreground text-center text-sm">Loading this group…</p>
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

  const me = group.data.members.find((member) => member.you)

  function countFor(userId: string | undefined): void {
    if (!userId || isPending) return
    increment.mutate({ groupId: group.data?.group.id ?? "", userId })
  }

  function uncountFor(userId: string | undefined): void {
    if (!userId || isPending) return
    decrement.mutate({ groupId: group.data?.group.id ?? "", userId })
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold">{group.data.group.name}</h1>
        <p className="text-muted-foreground text-sm">Count every “{group.data.group.phrase}”</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-6xl font-semibold tabular-nums">{me?.count ?? 0}</p>
        <div className="flex w-full max-w-xs gap-3">
          <DecrementButton disabled={isPending || !me} onClick={() => uncountFor(me?.user_id)} />
          <IncrementButton
            disabled={isPending || !me}
            pending={increment.isPending}
            onClick={() => countFor(me?.user_id)}
          />
        </div>
      </div>

      {mutationError && (
        <p className="text-destructive text-center text-sm" role="alert">
          {mutationError.message}
        </p>
      )}
      <Leaderboard
        entries={group.data.members.map((member) => ({
          userId: member.user_id,
          displayName: member.display_name,
          count: member.count,
          you: member.you,
        }))}
        onDecrement={(userId) => uncountFor(userId)}
        onIncrement={(userId) => countFor(userId)}
        disabled={isPending}
      />
    </div>
  )
}
