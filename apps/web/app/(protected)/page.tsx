import { requireYappiSession } from "@/lib/auth/session"
import { Leaderboard } from "@/components/pages/home/_leaderboard/leaderboard"
import { YappiCounter } from "@/components/pages/home/yappi-counter"
import { UserSheet } from "@/components/shared/_sheet/user-sheet"

export default async function ProtectedPage() {
  await requireYappiSession()

  return (
    <>
      <UserSheet />
      <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-8 px-6 py-20">
        <YappiCounter />
        <Leaderboard />
      </main>
    </>
  )
}
