"use client"

import type * as React from "react"

import { useGroups } from "@/hooks/api/use-groups"

import { GroupCard } from "@/components/pages/home/_card/group-card"
import { SpinnerFlicker01 } from "@packages/ui-w/shared/spinner-variant/spinner-flicker-01"
import { CreateAGroupDialog } from "@/components/pages/home/_dialog/create-a-group-dialog"
import { JoinAGroupDialog } from "@/components/pages/home/_dialog/join-a-group-dialog"
import { SyncStatus } from "@/components/shared/_sync/sync-status"
import { PageHeader } from "@/components/shared/_header/page-header"

export function GroupsView(): React.ReactElement {
  const groups = useGroups()

  if (groups.isPending) {
    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <SpinnerFlicker01 className="size-6" />
      </div>
    )
  }

  if (!groups.data) {
    return (
      <p className="text-destructive text-center text-sm" role="alert">
        {groups.error?.message ?? "Groups could not be loaded."}
      </p>
    )
  }

  const groupActions = (
    <footer className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md flex-col gap-3 border-t px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+--spacing(4))] backdrop-blur">
      <CreateAGroupDialog />
      <JoinAGroupDialog />
    </footer>
  )

  if (groups.data.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">No groups yet</h1>
            <p className="text-muted-foreground text-sm">
              Start one with a phrase to count, or join your friends with a code.
            </p>
          </div>
        </div>
        {groupActions}
      </>
    )
  }

  return (
    <div className="flex min-h-[calc(100svh-10rem)] w-full flex-col gap-4 pt-20 pb-32">
      <PageHeader fixed title="Your groups" />
      <SyncStatus stale={groups.error !== null} />
      <ul className="flex flex-col gap-3">
        {groups.data.map((group) => (
          <li key={group.id}>
            <GroupCard group={group} />
          </li>
        ))}
      </ul>
      {groupActions}
    </div>
  )
}
