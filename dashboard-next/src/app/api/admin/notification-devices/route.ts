import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminNotificationDevice from '@/models/AdminNotificationDevice';
import { verifyJwtToken } from '@/utils/verifyJwtToken';

const AdminNotificationDeviceModel = AdminNotificationDevice as any;

function getTokenFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }
  return req.cookies.get('auth_token')?.value || req.cookies.get('token')?.value || '';
}

async function getAdminIdentity(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = await verifyJwtToken(token).catch(() => null);
  if (!payload || typeof payload !== 'object') return null;

  return {
    adminId:
      typeof (payload as any).adminId === 'string'
        ? (payload as any).adminId
        : typeof (payload as any)._id === 'string'
          ? (payload as any)._id
          : '',
    username:
      typeof (payload as any).username === 'string'
        ? (payload as any).username
        : typeof (payload as any).name === 'string'
          ? (payload as any).name
          : 'Admin',
  };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const admin = await getAdminIdentity(req);
    if (!admin?.adminId) {
      return NextResponse.json({ success: false, message: 'Unable to resolve admin identity' }, { status: 401 });
    }

    const body = await req.json();
    const pushToken = String(body.pushToken || '').trim();
    if (!pushToken) {
      return NextResponse.json({ success: false, message: 'Push token is required' }, { status: 400 });
    }

    const device = await AdminNotificationDeviceModel.findOneAndUpdate(
      { pushToken },
      {
        $set: {
          adminId: admin.adminId,
          username: admin.username,
          platform: String(body.platform || '').trim(),
          deviceId: String(body.deviceId || '').trim(),
          deviceName: String(body.deviceName || '').trim(),
          isActive: true,
          lastSeenAt: new Date(),
        },
      },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: 'Admin device registered for notifications',
      data: device,
    });
  } catch (error) {
    console.error('POST admin notification device error:', error);
    return NextResponse.json({ success: false, message: 'Failed to register admin device' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const admin = await getAdminIdentity(req);
    if (!admin?.adminId) {
      return NextResponse.json({ success: false, message: 'Unable to resolve admin identity' }, { status: 401 });
    }

    const url = new URL(req.url);
    const pushToken = url.searchParams.get('pushToken') || '';
    if (!pushToken) {
      return NextResponse.json({ success: false, message: 'Push token is required' }, { status: 400 });
    }

    await AdminNotificationDeviceModel.findOneAndUpdate(
      { pushToken, adminId: admin.adminId },
      { $set: { isActive: false, lastSeenAt: new Date() } },
      { new: true }
    ).lean();

    return NextResponse.json({ success: true, message: 'Admin device deactivated successfully' });
  } catch (error) {
    console.error('DELETE admin notification device error:', error);
    return NextResponse.json({ success: false, message: 'Failed to deactivate admin device' }, { status: 500 });
  }
}
