"use client"

import { Toast } from "@base-ui/react/toast"

import { Toasts } from "@packages/ui-w/shared/toast/toast"

export const toastManager: ReturnType<typeof Toast.createToastManager> = Toast.createToastManager()

/** Re-exported so apps can create their own toast managers (and providers)
 *  from the same module instance the shared Toasts viewport renders. */
export { Toast } from "@base-ui/react/toast"

export type ToastPosition =
  "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"

export interface ToastProviderProps extends Toast.Provider.Props {
  position?: ToastPosition
  portalProps?: React.ComponentProps<typeof Toast.Portal>
}

export function ToastProvider({
  children,
  position = "top-right",
  portalProps,
  ...props
}: ToastProviderProps): React.ReactElement {
  return (
    <Toast.Provider toastManager={toastManager} {...props}>
      {children}
      <Toasts portalProps={portalProps} position={position} />
    </Toast.Provider>
  )
}
