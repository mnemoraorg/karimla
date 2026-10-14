import { requireKarimlaSession } from "@/lib/auth/session"
import { KarimlaCounter } from "@/components/pages/home/karimla-counter"

export default async function ProtectedPage() {
  await requireKarimlaSession()

  return <KarimlaCounter />
}
