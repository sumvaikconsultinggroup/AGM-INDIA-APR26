import { connectDB } from '../../../../../utils/mongodbConnect';
import { Collection, Document } from 'mongodb';
export async function PUT(req: Request) {
  try {
    const { enabledServices } = await req.json();

    if (!Array.isArray(enabledServices)) {
      return new Response(
        JSON.stringify({ message: 'enabledServices must be an array' }), 
        { status: 400 }
      );
    }

    const db = await connectDB('DB', 'test');
    const users: Collection<Document> = db.collection('AdminAccess');

    // Set the allowedService array to exactly match the enabled services
    const result = await users.updateMany(
      { role: { $ne: 'superadmin' } },
      { $set: { allowedService: enabledServices } }
    );

    return new Response(
      JSON.stringify({
        message: `Bulk updated permissions for ${result.modifiedCount} users`,
        modifiedCount: result.modifiedCount,
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