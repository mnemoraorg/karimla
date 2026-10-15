"use client"

import type * as React from "react"

import { Field } from "@packages/ui-w/shared/field/field"
import { Input } from "@packages/ui-w/shared/input/input"

export function GroupPhraseField(): React.ReactElement {
  return (
    <Field className="w-full">
      <Input
        aria-label="Phrase to count"
        autoComplete="off"
        className="w-full"
        id="phrase"
        maxLength={60}
        name="phrase"
        nativeInput
        placeholder="karimla"
        required
        size="lg"
        spellCheck={false}
        type="text"
      />
    </Field>
  )
}
