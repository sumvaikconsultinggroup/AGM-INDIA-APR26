import { VolunteersTable } from './volunteers-table';

export default function VolunteersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Volunteers</h1>
        <p className="text-muted-foreground">Manage volunteer applications and assignments.</p>
      </div>

      <VolunteersTable />
    </div>
  );
}
