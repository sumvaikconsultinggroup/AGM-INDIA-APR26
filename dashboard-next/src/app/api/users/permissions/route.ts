import { connectDB } from '../../../../utils/mongodbConnect';
import { Collection, Document } from 'mongodb';

export async function PUT(req: Request) {
  try {
    const { serviceId, enabled } = await req.json();

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
      // Add service to allowedService array for all non-superadmin users
      updateOperation = {
        $addToSet: { allowedService: serviceId }
      };
    } else {
      // Remove service from allowedService array for all non-superadmin users
      updateOperation = {
        $pull: { allowedService: serviceId }
      };
    }

    // Update all users except superadmin
    const result = await users.updateMany(
      { role: { $ne: 'superadmin' } },
      updateOperation
    );

    return new Response(
      JSON.stringify({
        message: `Service ${serviceId} ${enabled ? 'enabled' : 'disabled'} for ${result.modifiedCount} users`,
        modifiedCount: result.modifiedCount
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

// Optional: GET endpoint to fetch current permissions state
export async function GET() {
  try {
    const db = await connectDB('DB', 'test');
    const users: Collection<Document> = db.collection('AdminAccess');

    // Get all non-superadmin users and their allowed services
    const nonSuperAdmins = await users.find(
      { role: { $ne: 'superadmin' } },
      { projection: { username: 1, allowedService: 1, role: 1 } }
    ).toArray();

    return new Response(
      JSON.stringify(nonSuperAdmins),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return new Response(
      JSON.stringify({ message: 'Server error' }), 
      { status: 500 }
    );
  }
}