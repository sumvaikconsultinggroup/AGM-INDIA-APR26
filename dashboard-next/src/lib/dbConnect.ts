// This file intentionally left as a re-export.
// All database connections should use @/lib/mongodb (Mongoose).
// The native MongoClient connector at @/utils/mongodbConnect is used ONLY for the AdminAccess collection.

export { connectDB } from './mongodb';
