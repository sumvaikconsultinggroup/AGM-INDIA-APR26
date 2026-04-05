import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { RoomsTable } from './rooms-table';

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Rooms</h1>
          <p className="text-muted-foreground">Manage room bookings and availability.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/rooms/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Room
          </Link>
        </Button>
      </div>

      <RoomsTable />
    </div>
  );
}
