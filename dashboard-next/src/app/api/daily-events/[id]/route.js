import { connectDB } from '@/lib/mongodb';
import EventDaily from '../../../../models/DailyEvents';

export async function PUT(req, { params }) {
  await connectDB();
  try {
    const id = await params.id;
    const data = await req.json();

    // Optional: normalize date/time
    if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      const parsedDate = new Date(data.date);
      if (!isNaN(parsedDate.getTime())) data.date = parsedDate.toISOString().split('T')[0];
    }
    if (data.time && !/^([0-1]\d|2[0-3]):([0-5]\d)$/.test(data.time)) {
      try {
        data.time = new Date(`1970-01-01T${data.time}`).toISOString().slice(11, 16);
      } catch {
        data.time = '';
      }
    }

    const updated = await EventDaily.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const id = await params.id;
    const deleted = await EventDaily.findByIdAndDelete(id);
    if (!deleted) return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });

    return new Response(JSON.stringify({ message: 'Event deleted successfully' }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
