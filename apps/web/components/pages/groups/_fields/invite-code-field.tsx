"use client"

import type * as React from "react"

import { Field } from "@packages/ui-w/shared/field/field"
import { Input } from "@packages/ui-w/shared/input/input"

export function InviteCodeField(): React.ReactElement {
  return (
    <Field className="w-full">
      <Input
        aria-label="Invite code"
        autoCapitalize="characters"
        autoComplete="off"
        className="w-full text-center tracking-widest"
        id="code"
        maxLength={8}
        name="code"
        nativeInput
        placeholder="ABCDEFGH"
        required
        size="lg"
        spellCheck={false}
        type="text"
      />
    </Field>
  )
}
