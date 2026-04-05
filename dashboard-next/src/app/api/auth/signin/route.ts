import { connectDB } from '../../../../utils/mongodbConnect';
import { Collection, Document } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const db = await connectDB('DB', 'test');
    const users: Collection<Document> = db.collection('AdminAccess');

    const admin = await users.findOne({ username });

    if (!admin) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        name: admin.name,
        role: admin.role || 'admin',
        allowedService: admin.allowedService || [],
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Exclude password before sending to client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeAdmin } = admin;

    const response = NextResponse.json(
      {
        success: true,
        message: 'signin successful',
        data: {
          user: safeAdmin,
          token,
        },
        user: safeAdmin,
        token,
      },
      { status: 200 }
    );

    const cookieOptions = {
      httpOnly: true as const,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    };
    response.cookies.set({ name: 'auth_token', value: token, ...cookieOptions });
    // Keep legacy cookie for compatibility during migration.
    response.cookies.set({ name: 'token', value: token, ...cookieOptions });
    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: 'Method not allowed' }, { status: 405 });
}
