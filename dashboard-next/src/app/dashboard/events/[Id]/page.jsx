import { EventForm } from "../event-form";

export default function EditEventPage({ params }) {
  // In a real implementation, you would fetch the event data from the API
  const event = {
    id: params.Id,
    title: "Morning Meditation",
    date: "2024-05-05",
    time: "06:00",
    location: "Main Temple",
    description: "A peaceful morning meditation session to start the day with positive energy.",
    attendees: 120,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit Event</h1>
        <p className="text-muted-foreground">Update the details of this event.</p>
      </div>

      <EventForm initialData={event} />
    </div>
  );
}
