import { requireKarimlaSession } from "@/lib/auth/session"
import { KarimlaCounter } from "@/components/pages/home/karimla-counter"

export default async function Page() {
  await requireKarimlaSession()

  return <KarimlaCounter />
}
