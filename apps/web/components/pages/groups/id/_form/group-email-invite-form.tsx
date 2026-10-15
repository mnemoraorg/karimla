"use client"

import { useRef, useState } from "react"
import type * as React from "react"
import { IconX } from "@tabler/icons-react"

import type { Group } from "@/api/groups"
import { useSendGroupInvitations } from "@/hooks/api/use-groups"

import { toastManager } from "@packages/ui-w/providers/toast-provider"
import { Avatar } from "@packages/ui-w/shared/avatar/avatar"
import { AvatarFallback } from "@packages/ui-w/shared/avatar/avatar-fallback"
import { Button } from "@packages/ui-w/shared/button/button"
import { DrawerFooter } from "@packages/ui-w/shared/drawer/drawer-footer"
import { Field } from "@packages/ui-w/shared/field/field"
import { FieldLabel } from "@packages/ui-w/shared/field/field-label"
import { Input } from "@packages/ui-w/shared/input/input"

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
      <Field>
        <FieldLabel htmlFor="group-invite-email">Add an email address</FieldLabel>
        <Input
          aria-describedby="group-invite-email-help"
          autoComplete="off"
          disabled={sendInvitations.isPending || recipients.length >= 10}
          id="group-invite-email"
          maxLength={254}
          onChange={(event) => {
            setEmail(event.target.value)
            setError("")
          }}
          onKeyDown={handleEmailKeyDown}
          placeholder={recipients.length === 0 ? "name@example.com" : "Add another email address"}
          ref={inputRef}
          type="email"
          value={email}
        />
        <p className="text-muted-foreground text-sm" id="group-invite-email-help">
          Press Enter to add each address. Invite up to 10 people.
        </p>
      </Field>
      {recipients.length > 0 && (
        <ul
          aria-label="Invitation recipients"
          className="divide-border divide-y overflow-hidden rounded-xl border"
        >
          {recipients.map((recipient) => (
            <li className="flex min-w-0 items-center gap-3 px-3 py-2" key={recipient}>
              <Avatar aria-hidden className="size-8">
                <AvatarFallback>{recipient.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm">{recipient}</span>
              <Button
                aria-label={`Remove ${recipient}`}
                disabled={sendInvitations.isPending}
                onClick={() => {
                  setRecipients(recipients.filter((emailAddress) => emailAddress !== recipient))
                  setError("")
                }}
                size="icon-xs"
                variant="ghost"
              >
                <IconX aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
      <DrawerFooter className="px-0" variant="bare">
        <Button
          className="w-full"
          disabled={sendInvitations.isPending || (recipients.length === 0 && !email.trim())}
          type="submit"
        >
          {sendInvitations.isPending ? "Sending invitations…" : "Send invitations"}
        </Button>
      </DrawerFooter>
    </form>
  )
}
