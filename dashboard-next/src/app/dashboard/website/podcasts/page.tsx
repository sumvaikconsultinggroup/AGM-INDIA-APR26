import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { PodcastsTable } from './podcasts-table';

export default function PodcastsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Podcasts</h1>
          <p className="text-muted-foreground">Manage your podcast episodes and series.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/website/podcasts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Podcast
          </Link>
        </Button>
      </div>

      <PodcastsTable />
    </div>
  );
}
