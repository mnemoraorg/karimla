import type * as React from "react"

import { SpinnerFlicker01 } from "@packages/ui-w/shared/spinner-variant/spinner-flicker-01"

export default function Loading(): React.ReactElement {
  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <SpinnerFlicker01 className="size-6" />
    </div>
  )
}
