"use client"

import { useRef, useState } from "react"
import type * as React from "react"
import { IconX } from "@tabler/icons-react"

import type { Group } from "@/api/groups"
import { useSendGroupInvitations } from "@/hooks/api/use-groups"

import { toastManager } from "@packages/ui-w/providers/toast-provider"
import { Badge } from "@packages/ui-w/shared/badge/badge"
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
        <FieldLabel htmlFor="group-invite-email">Email addresses</FieldLabel>
        <div className="bg-muted border-input focus-within:border-ring focus-within:ring-ring/24 flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-xl border p-1.5 focus-within:ring-[3px]">
          {recipients.map((recipient) => (
            <Badge className="max-w-full gap-1" key={recipient} size="lg" variant="secondary">
              <span className="max-w-52 truncate">{recipient}</span>
              <button
                aria-label={`Remove ${recipient}`}
                className="text-muted-foreground hover:text-foreground focus-visible:outline-ring inline-flex size-5 shrink-0 items-center justify-center rounded-full focus-visible:outline-2"
                disabled={sendInvitations.isPending}
                onClick={() => {
                  setRecipients(recipients.filter((emailAddress) => emailAddress !== recipient))
                  setError("")
                }}
                type="button"
              >
                <IconX aria-hidden size={12} />
              </button>
            </Badge>
          ))}
          <Input
            aria-describedby="group-invite-email-help"
            autoComplete="off"
            className="min-w-36 flex-1"
            disabled={sendInvitations.isPending || recipients.length >= 10}
            id="group-invite-email"
            maxLength={254}
            onChange={(event) => {
              setEmail(event.target.value)
              setError("")
            }}
            onKeyDown={handleEmailKeyDown}
            placeholder={recipients.length === 0 ? "name@example.com" : undefined}
            ref={inputRef}
            type="email"
            unstyled
            value={email}
          />
        </div>
        <p className="text-muted-foreground text-sm" id="group-invite-email-help">
          Press Enter after each address. Invite up to 10 people.
        </p>
      </Field>
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
