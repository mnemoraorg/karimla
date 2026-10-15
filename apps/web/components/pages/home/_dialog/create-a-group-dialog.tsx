"use client"

import * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"
import { Dialog } from "@packages/ui-w/shared/dialog/dialog"
import { DialogHeader } from "@packages/ui-w/shared/dialog/dialog-header"
import { DialogPanel } from "@packages/ui-w/shared/dialog/dialog-panel"
import { DialogPopup } from "@packages/ui-w/shared/dialog/dialog-popup"
import { DialogTitle } from "@packages/ui-w/shared/dialog/dialog-title"
import { DialogTrigger } from "@packages/ui-w/shared/dialog/dialog-trigger"
import { CreateGroupForm } from "@/components/pages/home/_form/create-group-form"

export function CreateAGroupDialog({ className }: { className?: string }): React.ReactElement {
  return (
    <Dialog>
      <DialogTrigger render={<Button className={className ?? "w-full"} />}>New group</DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Create a group</DialogTitle>
        </DialogHeader>
        <DialogPanel>
          <CreateGroupForm />
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  )
}
