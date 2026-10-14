"use client"

import type * as React from "react"

import { Field } from "@packages/ui-w/shared/field/field"
import { Input } from "@packages/ui-w/shared/input/input"

export function LoginField(): React.ReactElement {
  return (
    <Field className="w-full">
      <Input
        aria-label="Email"
        autoComplete="email"
        className="w-full"
        id="email"
        name="email"
        nativeInput
        placeholder="Enter your email"
        required
        size="lg"
        spellCheck={false}
        type="email"
      />
    </Field>
  )
}
