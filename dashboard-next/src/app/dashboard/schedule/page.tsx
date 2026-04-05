import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ScheduleTable } from './schedule-table';

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Schedule</h1>
          <p className="text-muted-foreground">Manage your daily and weekly schedule.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/schedule/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Schedule Item
          </Link>
        </Button>
      </div>

      <ScheduleTable />
    </div>
  );
}
