import { connectDB } from '../../../../../utils/mongodbConnect';
import { Collection, Document, ObjectId } from 'mongodb';

export async function PUT(req: Request, {
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  try {
    const { serviceId, enabled } = await req.json();
    const { userId } = await params;

    if (!serviceId || typeof enabled !== 'boolean') {
      return new Response(
        JSON.stringify({ message: 'Invalid request data' }), 
        { status: 400 }
      );
    }

    const db = await connectDB('DB', 'test');
    const users: Collection<Document> = db.collection('AdminAccess');

    let updateOperation;

    if (enabled) {
      // Add service to user's allowedService array
      updateOperation = {
        $addToSet: { allowedService: serviceId }
      };
    } else {
      // Remove service from user's allowedService array
      updateOperation = {
        $pull: { allowedService: serviceId }
      };
    }

    // Update specific user
    const result = await users.updateOne(
      { 
        _id: new ObjectId(userId),
        role: { $ne: 'superadmin' } // Safety check
      },
      updateOperation
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ message: 'User not found or is superadmin' }), 
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        message: `Service ${serviceId} ${enabled ? 'enabled' : 'disabled'} for user`,
        userId,
        serviceId,
        enabled
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error updating user permissions:', error);
    return new Response(
      JSON.stringify({ message: 'Server error' }), 
      { status: 500 }
    );
  }
}

// Bulk update permissions for a specific user
export async function PATCH(req: Request, {
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  try {
    const { enabledServices } = await req.json();
    const { userId } = await params;

    if (!Array.isArray(enabledServices)) {
      return new Response(
        JSON.stringify({ message: 'enabledServices must be an array' }), 
        { status: 400 }
      );
    }

    const db = await connectDB('DB', 'test');
    const users: Collection<Document> = db.collection('AdminAccess');

    // Set the allowedService array to exactly match the enabled services
    const result = await users.updateOne(
      { 
        _id: new ObjectId(userId),
        role: { $ne: 'superadmin' } // Safety check
      },
      { $set: { allowedService: enabledServices } }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ message: 'User not found or is superadmin' }), 
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        message: `Bulk updated permissions for user`,
        userId,
        enabledServices
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error bulk updating user permissions:', error);
    return new Response(
      JSON.stringify({ message: 'Server error' }), 
      { status: 500 }
    );
  }
}