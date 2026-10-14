"use client"

import { useState } from "react"
import type * as React from "react"

import { useSession } from "@/hooks/api/auth/use-session"
import { useSignOut } from "@/hooks/api/auth/use-sign-out"

import { Button } from "@packages/ui-w/shared/button/button"
import { Sheet } from "@packages/ui-w/shared/sheet/sheet"
import { SheetDescription } from "@packages/ui-w/shared/sheet/sheet-description"
import { SheetFooter } from "@packages/ui-w/shared/sheet/sheet-footer"
import { SheetHeader } from "@packages/ui-w/shared/sheet/sheet-header"
import { SheetPopup } from "@packages/ui-w/shared/sheet/sheet-popup"
import { SheetTitle } from "@packages/ui-w/shared/sheet/sheet-title"
import { SheetTrigger } from "@packages/ui-w/shared/sheet/sheet-trigger"
import { SignOutButton } from "@/components/shared/_button/sign-out-button"

export function UserSheet(): React.ReactElement | null {
  const session = useSession()
  const signOut = useSignOut()
  const [error, setError] = useState("")

  if (!session.data) return null

  const { email, name } = session.data
  const title = name && name !== email ? name : "Account"

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button aria-label="Open account menu" className="fixed top-4 right-4" size="icon">
            {email?.[0]?.toUpperCase() ?? "?"}
          </Button>
        }
      />
      <SheetPopup side="right">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{email}</SheetDescription>
        </SheetHeader>
        <SheetFooter variant="bare" className="mt-auto flex-col gap-2">
          {error && (
            <p className="text-destructive text-center text-sm" role="alert">
              {error}
            </p>
          )}
          <SignOutButton
            disabled={signOut.isPending}
            pending={signOut.isPending}
            onClick={() =>
              signOut.mutate(undefined, {
                onError: (requestError) => setError(requestError.message),
              })
            }
          />
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  )
}
