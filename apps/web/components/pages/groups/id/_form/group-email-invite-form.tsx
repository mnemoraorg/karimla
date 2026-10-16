"use client"

import { useRef, useState } from "react"
import type * as React from "react"
import type { Group } from "@/api/groups"
import { useSendGroupInvitations } from "@/hooks/api/use-groups"
import { SendGroupInvitationsButton } from "@/components/pages/groups/id/_button/send-group-invitations-button"
import { GroupInviteEmailField } from "@/components/pages/groups/id/_field/group-invite-email-field"
import { GroupInviteRecipientList } from "@/components/pages/groups/id/_field/group-invite-recipient-list"

import { toastManager } from "@packages/ui-w/providers/toast-provider"
import { DrawerFooter } from "@packages/ui-w/shared/drawer/drawer-footer"

type GroupEmailInviteFormProps = {
  group: Group
  onSent: () => void
}

export function GroupEmailInviteForm({
  group,
  onSent,
}: GroupEmailInviteFormProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)
  const sendInvitations = useSendGroupInvitations()
  const [email, setEmail] = useState("")
  const [recipients, setRecipients] = useState<string[]>([])
  const [error, setError] = useState("")

  function addRecipient(): void {
    const candidate = email.trim()
    if (!candidate) return
    if (!inputRef.current?.checkValidity()) {
      setError("Enter a valid email address.")
      return
    }
    if (recipients.some((recipient) => recipient.toLowerCase() === candidate.toLowerCase())) {
      setError("That email address is already on the list.")
      return
    }
    if (recipients.length >= 10) {
      setError("You can invite up to 10 people at a time.")
      return
    }

    setRecipients([...recipients, candidate])
    setEmail("")
    setError("")
  }

  function handleEmailKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault()
      addRecipient()
    }
  }

  function removeRecipient(recipient: string): void {
    setRecipients(recipients.filter((emailAddress) => emailAddress !== recipient))
    setError("")
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const pendingEmail = email.trim()
    const nextRecipients = [...recipients]

    if (pendingEmail) {
      if (!inputRef.current?.checkValidity()) {
        setError("Enter a valid email address.")
        return
      }
      if (
        nextRecipients.some((recipient) => recipient.toLowerCase() === pendingEmail.toLowerCase())
      ) {
        setError("That email address is already on the list.")
        return
      }
      if (nextRecipients.length >= 10) {
        setError("You can invite up to 10 people at a time.")
        return
      }
      nextRecipients.push(pendingEmail)
    }
    if (nextRecipients.length === 0) {
      setError("Add at least one email address.")
      return
    }

    setError("")
    sendInvitations.mutate(
      { groupId: group.id, emails: nextRecipients },
      {
        onSuccess: (sentCount) => {
          toastManager.add({
            title: "Invitations sent",
            description: `Sent ${sentCount} invitation${sentCount === 1 ? "" : "s"}.`,
            type: "success",
          })
          setEmail("")
          setRecipients([])
          onSent()
        },
        onError: (requestError) => setError(requestError.message),
      },
    )
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
      <GroupInviteEmailField
        disabled={sendInvitations.isPending || recipients.length >= 10}
        email={email}
        hasRecipients={recipients.length > 0}
        inputRef={inputRef}
        onChange={(event) => {
          setEmail(event.target.value)
          setError("")
        }}
        onKeyDown={handleEmailKeyDown}
      />
      <GroupInviteRecipientList
        disabled={sendInvitations.isPending}
        onRemove={removeRecipient}
        recipients={recipients}
      />
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
      <DrawerFooter className="px-0" variant="bare">
        <SendGroupInvitationsButton
          disabled={recipients.length === 0 && !email.trim()}
          pending={sendInvitations.isPending}
        />
      </DrawerFooter>
    </form>
  )
}
