import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { EventsTable } from "./events-table-improved"

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Events</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage upcoming and past events.</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/events/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      <EventsTable />
    </div>
  )
}
