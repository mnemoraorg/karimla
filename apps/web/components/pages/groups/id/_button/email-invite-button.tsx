"use client"

import { useState } from "react"
import type * as React from "react"

import type { Group } from "@/api/groups"
import { GroupEmailInviteForm } from "@/components/pages/groups/id/_form/group-email-invite-form"

import { Button } from "@packages/ui-w/shared/button/button"
import { Drawer } from "@packages/ui-w/shared/drawer/drawer"
import { DrawerDescription } from "@packages/ui-w/shared/drawer/drawer-description"
import { DrawerHeader } from "@packages/ui-w/shared/drawer/drawer-header"
import { DrawerPanel } from "@packages/ui-w/shared/drawer/drawer-panel"
import { DrawerPopup } from "@packages/ui-w/shared/drawer/drawer-popup"
import { DrawerTitle } from "@packages/ui-w/shared/drawer/drawer-title"
import { DrawerTrigger } from "@packages/ui-w/shared/drawer/drawer-trigger"

export function EmailInviteButton({ group }: { group: Group }): React.ReactElement {
  const [open, setOpen] = useState(false)

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger render={<Button className="w-full" />}>Email invite</DrawerTrigger>
      <DrawerPopup showCloseButton>
        <DrawerHeader>
          <DrawerTitle>Invite by email</DrawerTitle>
          <DrawerDescription>
            Add the email addresses of the people you want to invite.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerPanel>
          <GroupEmailInviteForm group={group} onSent={() => setOpen(false)} />
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  )
}
