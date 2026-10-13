"use client"

import * as React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"

import { cn } from "@packages/ui-w/lib/utils"

export function FieldError({
  forceMount = false,
  className,
  children,
  ...props
}: FieldPrimitive.Error.Props & {
  forceMount?: boolean
}): React.ReactElement {
  if (forceMount) {
    return (
      <div className={cn("text-destructive-text text-xs", className)} data-slot="field-error">
        {children}
      </div>
    )
  }

  return (
    <FieldPrimitive.Error
      className={cn("text-destructive-text text-xs", className)}
      data-slot="field-error"
      {...(children ? { children } : {})}
      {...props}
    />
  )
}
