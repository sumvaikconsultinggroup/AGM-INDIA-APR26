import { RoomForm } from '../room-form';

export default function NewRoomPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">New Room</h1>
        <p className="text-muted-foreground">Add a new room to your accommodation listings.</p>
      </div>

      <RoomForm />
    </div>
  );
}
