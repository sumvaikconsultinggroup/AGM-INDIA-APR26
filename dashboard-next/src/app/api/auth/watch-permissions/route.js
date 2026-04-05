import { connectDB } from '../../../../utils/mongodbConnect';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : undefined;
    const cookieStore = await cookies();
    const token = bearerToken || cookieStore.get('auth_token')?.value || cookieStore.get('token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized: no token provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id || decoded.userId || decoded.id || decoded.adminId;
    if (!userId) {
      return new Response(
        JSON.stringify({ message: 'Invalid token: missing user ID' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Connect to MongoDB and fetch user
    const db = await connectDB('DB', 'test'); // replace 'DB' and 'test' with your DB/collection names
    const users = db.collection('AdminAccess');
    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send allowedService
    return new Response(
      JSON.stringify({ allowedService: user.allowedService || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error fetching allowedService:', err);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch allowedService', error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
