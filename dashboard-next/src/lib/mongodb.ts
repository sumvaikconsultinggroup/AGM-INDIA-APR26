import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}



// Database connection options
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Cache the database connection
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

cached = global.mongoose as unknown as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Connect to MongoDB
export async function connectDB() {
  // Get MongoDB URI from environment variables (at runtime, not build time)
  const MONGODB_URI: string = process.env.MONGODB_URI || process.env.MONGO_URI || '';

  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  try {
    // Create new connection if none exists
    if (!cached.promise) {
      mongoose.set('strictQuery', true);
      cached.promise = mongoose.connect(MONGODB_URI, options);
    }

    // Wait for connection
    cached.conn = await cached.promise;
    console.log('✅ Connected to MongoDB');
    return cached.conn;

  } catch (error) {
    // Reset promise on error
    cached.promise = null;
    console.error('❌ MongoDB Error:', error);
    throw error;
  }
}
