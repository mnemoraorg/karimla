import type * as React from "react"

import { cn } from "@packages/ui-w/lib/utils"

export type PageHeaderProps = {
  title: string
  leading?: React.ReactNode
  actions?: React.ReactNode
  fixed?: boolean
}

export function PageHeader({
  title,
  leading,
  actions,
  fixed = false,
}: PageHeaderProps): React.ReactElement {
  return (
    <header
      className={cn(
        "flex w-full items-center justify-between gap-2",
        fixed &&
          "bg-background/95 fixed inset-x-0 top-0 z-40 mx-auto max-w-md px-6 py-4 text-start backdrop-blur",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {leading}
        <h1 className="min-w-0 truncate text-xl font-semibold">{title}</h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </header>
  )
}
