"use client"

import { useState } from "react"
import type * as React from "react"

import { useSession } from "@/hooks/api/auth/use-session"
import { useUpdateUserName } from "@/hooks/api/auth/use-update-user"

import { Drawer } from "@packages/ui-w/shared/drawer/drawer"
import { DrawerDescription } from "@packages/ui-w/shared/drawer/drawer-description"
import { DrawerFooter } from "@packages/ui-w/shared/drawer/drawer-footer"
import { DrawerHeader } from "@packages/ui-w/shared/drawer/drawer-header"
import { DrawerPanel } from "@packages/ui-w/shared/drawer/drawer-panel"
import { DrawerPopup } from "@packages/ui-w/shared/drawer/drawer-popup"
import { DrawerTitle } from "@packages/ui-w/shared/drawer/drawer-title"
import { Button } from "@packages/ui-w/shared/button/button"
import { Field } from "@packages/ui-w/shared/field/field"
import { FieldLabel } from "@packages/ui-w/shared/field/field-label"
import { Input } from "@packages/ui-w/shared/input/input"

export function ProfileOnboardingDialog(): React.ReactElement {
  const session = useSession()
  const updateName = useUpdateUserName()
  const [name, setName] = useState("")
  const needsOnboarding = Boolean(
    session.data && (!session.data.name?.trim() || session.data.name === session.data.email),
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    updateName.mutate(name)
  }

  return (
    <Drawer
      disablePointerDismissal
      onOpenChange={(open, details) => {
        if (!open && details.reason === "swipe") details.cancel()
      }}
      open={needsOnboarding}
    >
      <DrawerPopup disableSwipe>
        <DrawerHeader>
          <DrawerTitle>What should we call you?</DrawerTitle>
          <DrawerDescription>
            Enter your full name to finish setting up your profile.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerPanel>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field>
              <FieldLabel htmlFor="full-name">Full name</FieldLabel>
              <Input
                autoComplete="name"
                autoFocus
                id="full-name"
                maxLength={120}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </Field>
            {updateName.error && (
              <p className="text-destructive text-sm" role="alert">
                {updateName.error.message}
              </p>
            )}
            <DrawerFooter variant="bare" className="px-0">
              <Button className="w-full" disabled={updateName.isPending} type="submit">
                {updateName.isPending ? "Saving…" : "Continue"}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  )
}
