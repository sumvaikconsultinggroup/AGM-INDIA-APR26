import { connectDB } from '@/lib/mongodb';
import EventDaily from '../../../models/DailyEvents';

// -------------------- CREATE EVENT --------------------
export async function POST(req) {
  await connectDB();

  try {
    const {
      title,
      description,
      date,
      time,
      location,
      organiserName,
      organiserEmail,
      organiserPhone,
      category,
    } = await req.json();

    if (!title || !date) {
      return new Response(
        JSON.stringify({ error: 'title, date, and time are required' }),
        { status: 400 }
      );
    }

    // Normalize date
    let normalizedDate = date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        normalizedDate = parsedDate.toISOString().split('T')[0];
      }
    }

    // Normalize time
    let normalizedTime = time;
    if (time) { // Only process if time is not null, undefined, or empty
      if (!/^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time)) {
        try {
          normalizedTime = new Date(`1970-01-01T${time}`).toISOString().slice(11, 16);
        } catch {
          normalizedTime = null; // Set to null if parsing fails
        }
      }
    }

    const ev = await EventDaily.create({
      title,
      description,
      date: normalizedDate,
      time: normalizedTime,
      location,
      organiserName,
      organiserEmail,
      organiserPhone,
      category,
    });

    return new Response(JSON.stringify(ev), { status: 201 });
  } catch (err) {
    console.error('❌ Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// -------------------- GET EVENTS BY DATE --------------------
export async function GET(req) {
  await connectDB();

  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let query = {};
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Response(JSON.stringify({ error: 'Valid "date" query param is required (YYYY-MM-DD)' }), { status: 400 });
      }
      query = { date };
    } else if (startDate && endDate) {
      query = { date: { $gte: startDate, $lte: endDate } };
    }

    const events = await EventDaily.find(query).sort({ time: 1 });
    return new Response(JSON.stringify({ events }), { status: 200 });
  } catch (err) {
    console.error('❌ Error fetching events:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
