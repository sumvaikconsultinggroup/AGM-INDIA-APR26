import admin from 'firebase-admin';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin;
}

export async function POST(request) {
  const firebaseAdmin = getFirebaseAdmin();
  await connectDB();
  const body = await request.json();
  const { idToken } = body;

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Find existing user or create new one
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with OAuth method
      user = await User.create({
        uid,
        email,
        name,
        username: name,
        picture: picture || '/placeholder.svg',
        authMethod: 'oauth',
        isOTPVerified: true, // OAuth users are automatically verified
        status: 'active'
      });
    } else if (user.authMethod !== 'oauth') {
      // If user exists but with different auth method, return error
      return new Response(JSON.stringify({ 
        error: 'Email already registered with different authentication method' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Update existing OAuth user's info if needed
      user = await User.findOneAndUpdate(
        { email },
        {
          uid,
          name,
          username: name,
          picture: picture || user.picture,
          status: 'active'
        },
        { new: true }
      );
    }

    return new Response(JSON.stringify({ 
      uid: user.uid,
      email: user.email,
      name: user.name,
      username: user.username,
      picture: user.picture,
      role: user.role
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Token verification failed', error);
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
