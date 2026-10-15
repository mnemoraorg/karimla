"use client"

import { useState } from "react"
import type * as React from "react"

import type { Group } from "@/api/groups"

import { Button } from "@packages/ui-w/shared/button/button"

type GroupInviteActionsProps = {
  group: Group
}

export function GroupInviteActions({ group }: GroupInviteActionsProps): React.ReactElement {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState("")
  const subject = encodeURIComponent(`Join ${group.name} on Yappi`)
  const body = encodeURIComponent(
    `Join my group “${group.name}” and count every “${group.phrase}”. Use invite code ${group.invite_code}.`,
  )

  async function copyInviteCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(group.invite_code)
      setCopied(true)
      setCopyError("")
    } catch {
      setCopied(false)
      setCopyError(`Couldn't copy the invite code. Share this code instead: ${group.invite_code}`)
    }
  }

  return (
    <footer className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md flex-col gap-3 border-t px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+--spacing(4))] backdrop-blur">
      <Button className="w-full" render={<a href={`mailto:?subject=${subject}&body=${body}`} />}>
        Email invite
      </Button>
      <Button className="w-full" onClick={copyInviteCode} variant="outline">
        {copied ? "Invite code copied" : "Copy invite code"}
      </Button>
      {copied && (
        <p aria-live="polite" className="sr-only" role="status">
          Invite code copied.
        </p>
      )}
      {copyError && (
        <p className="text-destructive text-center text-sm" role="alert">
          {copyError}
        </p>
      )}
    </footer>
  )
}
