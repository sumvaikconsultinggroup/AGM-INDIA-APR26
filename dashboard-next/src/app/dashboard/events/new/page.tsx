import { EventForm } from '../event-form';

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">New Event</h1>
        <p className="text-muted-foreground">Create a new event to add to your schedule.</p>
      </div>

      <EventForm />
    </div>
  );
}
