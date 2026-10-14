import { requireKarimlaSession } from "@/lib/auth/session"
import { KarimlaCounter } from "@/components/pages/home/karimla-counter"
import { UserSheet } from "@/components/shared/_sheet/user-sheet"

export default async function ProtectedPage() {
  await requireKarimlaSession()

  return (
    <>
      <UserSheet />
      <KarimlaCounter />
    </>
  )
}
