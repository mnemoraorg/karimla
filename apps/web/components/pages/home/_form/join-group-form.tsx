"use client"

import { useState } from "react"
import type * as React from "react"
import { useRouter } from "next/navigation"

import { useJoinGroup } from "@/hooks/api/use-groups"

import { Button } from "@packages/ui-w/shared/button/button"
import { InviteCodeField } from "@/components/pages/home/_field/invite-code-field"

export function JoinGroupForm(): React.ReactElement {
  const router = useRouter()
  const joinGroup = useJoinGroup()
  const [error, setError] = useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setError("")

    const code = new FormData(event.currentTarget).get("code")
    if (typeof code !== "string") {
      setError("Enter your invite code.")
      return
    }

    joinGroup.mutate(code, {
      onSuccess: (group) => router.push(`/groups/${group.id}`),
      onError: (requestError) => setError(requestError.message),
    })
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <InviteCodeField />
      <Button className="w-full" disabled={joinGroup.isPending} type="submit">
        {joinGroup.isPending ? "Joining…" : "Join group"}
      </Button>
      {error && (
        <p className="text-destructive text-center text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
