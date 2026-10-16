"use client"

import { useState } from "react"
import type * as React from "react"
import { useRouter } from "next/navigation"

import { useCreateGroup } from "@/hooks/api/use-groups"

import { Button } from "@packages/ui-w/shared/button/button"
import { GroupNameField } from "@/components/pages/home/_field/group-name-field"
import { GroupPhraseField } from "@/components/pages/home/_field/group-phrase-field"

export function CreateGroupForm(): React.ReactElement {
  const router = useRouter()
  const createGroup = useCreateGroup()
  const [error, setError] = useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setError("")

    const form = new FormData(event.currentTarget)
    const name = form.get("name")
    const phrase = form.get("phrase")
    if (typeof name !== "string" || typeof phrase !== "string") {
      setError("Give your group a name and a phrase to count.")
      return
    }

    createGroup.mutate(
      { name, phrase },
      {
        onSuccess: (group) => router.push(`/groups/${group.id}`),
        onError: (requestError) => setError(requestError.message),
      },
    )
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <GroupNameField />
      <GroupPhraseField />
      <Button className="w-full" disabled={createGroup.isPending} type="submit">
        {createGroup.isPending ? "Creating…" : "Create group"}
      </Button>
      {error && (
        <p className="text-destructive text-center text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
