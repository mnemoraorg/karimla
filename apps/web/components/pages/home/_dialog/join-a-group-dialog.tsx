"use client"

import * as React from "react"

import { Button } from "@packages/ui-w/shared/button/button"
import { Dialog } from "@packages/ui-w/shared/dialog/dialog"
import { DialogHeader } from "@packages/ui-w/shared/dialog/dialog-header"
import { DialogPanel } from "@packages/ui-w/shared/dialog/dialog-panel"
import { DialogPopup } from "@packages/ui-w/shared/dialog/dialog-popup"
import { DialogTitle } from "@packages/ui-w/shared/dialog/dialog-title"
import { DialogTrigger } from "@packages/ui-w/shared/dialog/dialog-trigger"
import { JoinGroupForm } from "@/components/pages/home/_form/join-group-form"

export function JoinAGroupDialog({ className }: { className?: string }): React.ReactElement {
  return (
    <Dialog>
      <DialogTrigger render={<Button className={className ?? "w-full"} variant="outline" />}>
        Join
      </DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Join a group</DialogTitle>
        </DialogHeader>
        <DialogPanel>
          <JoinGroupForm />
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  )
}
