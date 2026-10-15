import { JoinGroupForm } from "@/components/pages/groups/_form/join-group-form"

export default function Page() {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold">Join a group</h1>
        <p className="text-muted-foreground text-sm">Enter the invite code your friend shared.</p>
      </div>
      <JoinGroupForm />
    </div>
  )
}
