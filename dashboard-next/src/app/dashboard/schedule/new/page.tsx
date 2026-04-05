import { ScheduleForm } from '../schedule-form';

export default function NewSchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">New Schedule Item</h1>
        <p className="text-muted-foreground">Create a new item to add to your schedule.</p>
      </div>

      <ScheduleForm />
    </div>
  );
}
