"use client"

import { useEffect, useRef, useState } from "react"
import type * as React from "react"

import type { Group } from "@/api/groups"

import { Button } from "@packages/ui-w/shared/button/button"

export function ShareInviteCodeButton({ group }: { group: Group }): React.ReactElement {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState("")
  const resetTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (resetTimer.current !== undefined) window.clearTimeout(resetTimer.current)
    }
  }, [])

  async function copyInviteCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(group.invite_code)
      setCopied(true)
      setCopyError("")
      if (resetTimer.current !== undefined) window.clearTimeout(resetTimer.current)
      resetTimer.current = window.setTimeout(() => {
        setCopied(false)
        resetTimer.current = undefined
      }, 2000)
    } catch {
      if (resetTimer.current !== undefined) window.clearTimeout(resetTimer.current)
      resetTimer.current = undefined
      setCopied(false)
      setCopyError(`Couldn't copy the invite code. Share this code instead: ${group.invite_code}`)
    }
  }

  return (
    <>
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
    </>
  )
}
