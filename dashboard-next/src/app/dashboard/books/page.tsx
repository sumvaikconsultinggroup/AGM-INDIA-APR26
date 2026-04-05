import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { BooksTable } from "./books-table"

export default function BooksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Books</h1>
          <p className="text-muted-foreground">Manage your published books and writings.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/books/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Book
          </Link>
        </Button>
      </div>

      <BooksTable />
    </div>
  )
}
