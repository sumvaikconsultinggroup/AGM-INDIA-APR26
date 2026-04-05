import { connectDB } from '../../../../utils/mongodbConnect';
import { Collection, Document } from 'mongodb';

export async function GET() {
  try {
    const db = await connectDB('DB', 'test');
    const users: Collection<Document> = db.collection('AdminAccess');

    // Get all non-superadmin users
    const nonSuperAdmins = await users.find(
      { role: { $ne: 'superadmin' } },
      { 
        projection: { 
          _id: 1,
          username: 1, 
          name: 1,
          email: 1,
          role: 1,
          allowedService: 1 
        } 
      }
    ).toArray();

    return new Response(
      JSON.stringify(nonSuperAdmins),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(
      JSON.stringify({ message: 'Server error' }), 
      { status: 500 }
    );
  }
}