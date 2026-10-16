import "@packages/ui-w/styles/globals.css"
import "@packages/ui-w/styles/fonts.css"
import "@packages/ui-w/styles/variants/background.css"

import type { Metadata } from "next"

import { QueryProvider } from "@/providers/query-provider"

import { CountSyncEngine } from "@/components/shared/_sync/count-sync-engine"
import { ConnectivityToasts } from "@/components/shared/_sync/connectivity-toasts"
import { createMetadata } from "@packages/metadata"
import { ThemeProvider } from "@packages/ui-w/providers/theme-provider"
import { ToastProvider } from "@packages/ui-w/providers/toast-provider"
import { TooltipProvider } from "@packages/ui-w/providers/tooltip-provider"

export const metadata: Metadata = createMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="overflow-x-hidden font-sans tracking-tight antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ToastProvider position="bottom-left">
            <TooltipProvider delay={0}>
              <QueryProvider>
                <CountSyncEngine />
                <ConnectivityToasts />
                <main className="relative min-h-svh w-full overflow-x-hidden">{children}</main>
              </QueryProvider>
            </TooltipProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
