import { requireKarimlaSession } from "@/lib/auth/session"
import { UserMenu } from "@/components/pages/home/_menu/user-menu"
import { KarimlaCounter } from "@/components/pages/home/karimla-counter"

export default async function ProtectedPage() {
  await requireKarimlaSession()

  return (
    <>
      <UserMenu />
      <KarimlaCounter />
    </>
  )
}
