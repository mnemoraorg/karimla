"use client"

import Link from "next/link"
import type * as React from "react"

import { useGroups } from "@/hooks/api/use-groups"

import { Button } from "@packages/ui-w/shared/button/button"

export function GroupsView(): React.ReactElement {
  const groups = useGroups()

  if (groups.isPending) {
    return <p className="text-muted-foreground text-center text-sm">Loading your groups…</p>
  }

  if (groups.error || !groups.data) {
    return (
      <p className="text-destructive text-center text-sm" role="alert">
        {groups.error?.message ?? "Groups could not be loaded."}
      </p>
    )
  }

  if (groups.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">No groups yet</h1>
          <p className="text-muted-foreground text-sm">
            Start one with a phrase to count, or join your friends with a code.
          </p>
        </div>
        <div className="flex w-full gap-3">
          <Button className="flex-1" render={<Link href="/groups/new" />}>
            New group
          </Button>
          <Button className="flex-1" render={<Link href="/groups/join" />}>
            Join
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your groups</h1>
        <div className="flex gap-3">
          <Button size="sm" variant="link" render={<Link href="/groups/join" />}>
            Join
          </Button>
          <Button size="sm" variant="link" render={<Link href="/groups/new" />}>
            New group
          </Button>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {groups.data.map((group) => (
          <li key={group.id}>
            <Link
              href={`/groups/${group.id}`}
              className="border-border bg-card block rounded-2xl border p-5"
            >
              <p className="font-semibold">{group.name}</p>
              <p className="text-muted-foreground text-sm">Count every “{group.phrase}”</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
