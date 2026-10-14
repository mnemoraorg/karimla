import { redirect } from "next/navigation"

import { getKarimlaSession } from "@/lib/auth/session"
import { LoginForm } from "@/components/pages/login/_form/login-form"

export default async function Page() {
  if (await getKarimlaSession()) redirect("/")

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-center py-6">
        <p className="text-sm font-medium">Karimla by Mnemora</p>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-xs flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-xl font-semibold">Did someone just say karimla?</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email and we&apos;ll send you a 6-digit code to count with your friends
            </p>
          </div>

          <LoginForm />

          <p className="text-muted-foreground text-center text-sm">
            First chill? You&apos;re a new counter. Second chill? We already know you.
          </p>
        </div>
      </div>

      <footer className="text-muted-foreground flex items-center justify-center gap-6 py-6 text-sm">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Cookies</a>
      </footer>
    </div>
  )
}
