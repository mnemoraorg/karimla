import { requireKarimlaSession } from "@/lib/auth/session"
import { Leaderboard } from "@/components/pages/home/_leaderboard/leaderboard"
import { KarimlaCounter } from "@/components/pages/home/karimla-counter"
import { UserSheet } from "@/components/shared/_sheet/user-sheet"

export default async function ProtectedPage() {
  await requireKarimlaSession()

  return (
    <>
      <UserSheet />
      <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-8 px-6 py-20">
        <KarimlaCounter />
        <Leaderboard />
      </main>
    </>
  )
}
