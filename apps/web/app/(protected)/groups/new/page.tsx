import { CreateGroupForm } from "@/components/pages/groups/_form/create-group-form"

export default function Page() {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold">Start a group</h1>
        <p className="text-muted-foreground text-sm">
          Name it and pick the phrase everyone will count.
        </p>
      </div>
      <CreateGroupForm />
    </div>
  )
}
