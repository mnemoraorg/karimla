import type * as React from "react"

import { Field } from "@packages/ui-w/shared/field/field"
import { FieldLabel } from "@packages/ui-w/shared/field/field-label"
import { Input } from "@packages/ui-w/shared/input/input"

type GroupInviteEmailFieldProps = {
  disabled: boolean
  email: string
  hasRecipients: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: React.ChangeEventHandler<HTMLInputElement>
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>
}

export function GroupInviteEmailField({
  disabled,
  email,
  hasRecipients,
  inputRef,
  onChange,
  onKeyDown,
}: GroupInviteEmailFieldProps): React.ReactElement {
  return (
    <Field>
      <FieldLabel htmlFor="group-invite-email">Add an email address</FieldLabel>
      <Input
        aria-describedby="group-invite-email-help"
        autoComplete="off"
        disabled={disabled}
        id="group-invite-email"
        maxLength={254}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={hasRecipients ? "Add another email address" : "name@example.com"}
        ref={inputRef}
        type="email"
        value={email}
      />
      <p className="text-muted-foreground text-sm" id="group-invite-email-help">
        Press Enter to add each address. Invite up to 10 people.
      </p>
    </Field>
  )
}
