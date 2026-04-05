/**
 * Team Management API
 * Superadmins can manage team roles and permissions from the admin app.
 * 
 * GET  /api/admin/team          — List all admin team members
 * POST /api/admin/team          — Add new team member
 * PUT  /api/admin/team/[id]     — Update team member role/permissions
 * DELETE /api/admin/team/[id]   — Deactivate team member
 */

import { NextRequest, NextResponse } from 'next/server';
import { Collection, Document, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

async function getAdminCollection(): Promise<Collection<Document>> {
  const { connectDB } = await import('@/utils/mongodbConnect');
  const db = await connectDB('DB', 'test');
  return db.collection('AdminAccess');
}

// GET — List all team members (excluding passwords)
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const collection = await getAdminCollection();

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || '';

    const filter: Record<string, unknown> = {};
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { username: regex }, { email: regex }];
    }
    if (role) filter.role = role;

    const admins = await collection
      .find(filter)
      .project({ password: 0, otp: 0, otpExpiry: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: admins,
      total: admins.length,
    });
  } catch (error) {
    console.error('GET team error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch team' }, { status: 500 });
  }
}

// POST — Create new team member
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { name, username, email, password, role, permissions, allowedService } = body;

    if (!name || !username || !password) {
      return NextResponse.json({ success: false, message: 'Name, username, and password are required' }, { status: 400 });
    }

    const validRoles = ['superadmin', 'admin', 'editor', 'moderator', 'viewer'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid role. Must be one of: ' + validRoles.join(', ') }, { status: 400 });
    }

    const collection = await getAdminCollection();

    // Check duplicate username
    const existing = await collection.findOne({ username });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Username already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = {
      name,
      username,
      email: email || null,
      password: hashedPassword,
      role: role || 'editor',
      permissions: permissions || {},
      allowedService: allowedService || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newAdmin);

    const { password: _, ...safeAdmin } = newAdmin;

    return NextResponse.json({
      success: true,
      message: 'Team member created successfully',
      data: { ...safeAdmin, _id: result.insertedId },
    }, { status: 201 });
  } catch (error) {
    console.error('POST team error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create team member' }, { status: 500 });
  }
}

// PUT — Update team member (role, permissions, allowedService)
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { id, role, permissions, allowedService, name, email, isActive } = body;

    if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ success: false, message: 'Valid team member ID is required' }, { status: 400 });
    }

    const collection = await getAdminCollection();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (role) updateData.role = role;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (allowedService !== undefined) updateData.allowedService = allowedService;
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0, otp: 0, otpExpiry: 0 } }
    );

    if (!result) {
      return NextResponse.json({ success: false, message: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Team member updated successfully',
      data: result,
    });
  } catch (error) {
    console.error('PUT team error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update team member' }, { status: 500 });
  }
}

// DELETE — Deactivate team member (soft delete)
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ success: false, message: 'Valid team member ID is required' }, { status: 400 });
    }

    const collection = await getAdminCollection();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    if (!result) {
      return NextResponse.json({ success: false, message: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Team member deactivated successfully',
    });
  } catch (error) {
    console.error('DELETE team error:', error);
    return NextResponse.json({ success: false, message: 'Failed to deactivate team member' }, { status: 500 });
  }
}
