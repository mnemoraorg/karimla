import { requireYappiSession } from "@/lib/auth/session"
import { ProfileOnboardingDialog } from "@/components/shared/_dialog/profile-onboarding-dialog"
import { UserSheet } from "@/components/shared/_sheet/user-sheet"

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireYappiSession()

  return (
    <>
      <UserSheet />
      <ProfileOnboardingDialog />
      <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-8 px-6 py-20">
        {children}
      </main>
    </>
  )
}
