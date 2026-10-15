"use client"

import type * as React from "react"

import { Field } from "@packages/ui-w/shared/field/field"
import { Input } from "@packages/ui-w/shared/input/input"

type OtpFieldProps = {
  disabled?: boolean
  onChange: (value: string) => void
  value: string
}

export function OtpField({ disabled, onChange, value }: OtpFieldProps): React.ReactElement {
  return (
    <Field className="w-full">
      <Input
        aria-label="Verification code"
        autoComplete="one-time-code"
        className="w-full text-center tracking-widest"
        disabled={disabled}
        id="otp"
        inputMode="numeric"
        name="otp"
        nativeInput
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="123456"
        required
        size="lg"
        spellCheck={false}
        type="text"
        value={value}
      />
    </Field>
  )
}
