/**
 * User Permissions Management API
 * Granular RBAC permission management for admin users.
 * 
 * GET  /api/users/all-permissions/[userId] — Get user's permissions
 * PUT  /api/users/all-permissions/[userId] — Update user's permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Collection, Document, ObjectId } from 'mongodb';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

// GET user permissions
export async function GET(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { userId } = await context.params;
    if (!userId || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
    }

    // Try AdminAccess collection first, then Users
    const { connectDB: connectMongo } = await import('@/utils/mongodbConnect');
    const db = await connectMongo('DB', 'test');
    const adminCollection: Collection<Document> = db.collection('AdminAccess');

    let admin = await adminCollection.findOne({ _id: new ObjectId(userId) });

    if (!admin) {
      // Try the User model
      await connectDB();
      const mongoose = await import('mongoose');
      const UserModel = mongoose.models.User;
      if (UserModel) {
        const user = await UserModel.findById(userId).lean();
        if (user) {
          return NextResponse.json({
            success: true,
            role: (user as Record<string, unknown>).role || 'user',
            permissions: (user as Record<string, unknown>).permissions || {},
          });
        }
      }
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      role: admin.role || 'admin',
      permissions: admin.permissions || {},
      allowedService: admin.allowedService || [],
    });
  } catch (error) {
    console.error('GET permissions error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PUT update user permissions
export async function PUT(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { userId } = await context.params;
    if (!userId || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
    }

    const body = await req.json();
    const { role, permissions } = body;

    const { connectDB: connectMongo } = await import('@/utils/mongodbConnect');
    const db = await connectMongo('DB', 'test');
    const adminCollection: Collection<Document> = db.collection('AdminAccess');

    const updateData: Record<string, unknown> = {};
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;

    const result = await adminCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const { password: _, ...safeUser } = result as Record<string, unknown>;

    return NextResponse.json({
      success: true,
      message: 'Permissions updated successfully',
      data: safeUser,
    });
  } catch (error) {
    console.error('PUT permissions error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
