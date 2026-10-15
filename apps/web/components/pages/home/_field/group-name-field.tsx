"use client"

import type * as React from "react"

import { Field } from "@packages/ui-w/shared/field/field"
import { FieldLabel } from "@packages/ui-w/shared/field/field-label"
import { Input } from "@packages/ui-w/shared/input/input"

export function GroupNameField(): React.ReactElement {
  return (
    <Field className="w-full">
      <FieldLabel htmlFor="name">Group name</FieldLabel>
      <Input
        aria-label="Group name"
        autoComplete="off"
        className="w-full"
        id="name"
        maxLength={60}
        name="name"
        nativeInput
        placeholder="Friday crew"
        required
        size="lg"
        spellCheck={false}
        type="text"
      />
    </Field>
  )
}
