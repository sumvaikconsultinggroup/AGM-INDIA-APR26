/**
 * Database Index Definitions
 * Run this script to ensure all indexes exist: `npx tsx src/lib/indexes.ts`
 * In production, indexes should be managed via MongoDB Atlas.
 */

import mongoose from 'mongoose';
import { connectDB } from './mongodb';

export async function ensureIndexes(): Promise<void> {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error('No database connection');

  console.log('[indexes] Ensuring database indexes...');

  // ─── Users ──────────────────────────────────
  await safeCreateIndex(db, 'users', { email: 1 }, { unique: true, sparse: true });
  await safeCreateIndex(db, 'users', { phone: 1 }, { sparse: true });
  await safeCreateIndex(db, 'users', { role: 1 });
  await safeCreateIndex(db, 'users', { createdAt: -1 });
  await safeCreateIndex(db, 'users', { isDeleted: 1 });
  await safeCreateIndex(db, 'users', { authMethod: 1 });

  // ─── Events ─────────────────────────────────
  await safeCreateIndex(db, 'events', { eventDate: -1 });
  await safeCreateIndex(db, 'events', { isDeleted: 1 });
  await safeCreateIndex(db, 'events', { eventName: 'text', description: 'text' });

  // ─── Articles ───────────────────────────────
  await safeCreateIndex(db, 'articles', { publishedDate: -1 });
  await safeCreateIndex(db, 'articles', { category: 1 });
  await safeCreateIndex(db, 'articles', { isDeleted: 1 });
  await safeCreateIndex(db, 'articles', { title: 'text', description: 'text' });

  // ─── Books ──────────────────────────────────
  await safeCreateIndex(db, 'books', { createdAt: -1 });
  await safeCreateIndex(db, 'books', { genre: 1 });
  await safeCreateIndex(db, 'books', { language: 1 });
  await safeCreateIndex(db, 'books', { isDeleted: 1 });

  // ─── Podcasts ───────────────────────────────
  await safeCreateIndex(db, 'podcasts', { createdAt: -1 });
  await safeCreateIndex(db, 'podcasts', { category: 1 });
  await safeCreateIndex(db, 'podcasts', { isDeleted: 1 });
  await safeCreateIndex(db, 'podcasts', { featured: 1 });

  // ─── Video Series ──────────────────────────
  await safeCreateIndex(db, 'videoseries', { createdAt: -1 });
  await safeCreateIndex(db, 'videoseries', { isDeleted: 1 });

  // ─── Schedules ─────────────────────────────
  await safeCreateIndex(db, 'schedules', { month: 1 });
  await safeCreateIndex(db, 'schedules', { isDeleted: 1 });
  await safeCreateIndex(db, 'schedules', { 'timeSlots.startDate': 1 });

  // ─── Donations ─────────────────────────────
  await safeCreateIndex(db, 'donates', { isActive: 1 });
  await safeCreateIndex(db, 'donates', { isDeleted: 1 });

  // ─── Volunteers ────────────────────────────
  await safeCreateIndex(db, 'volunteers', { email: 1 });
  await safeCreateIndex(db, 'volunteers', { isDeleted: 1 });
  await safeCreateIndex(db, 'volunteers', { isApproved: 1 });
  await safeCreateIndex(db, 'volunteers', { createdAt: -1 });

  // ─── Connect Messages ─────────────────────
  await safeCreateIndex(db, 'connects', { createdAt: -1 });
  await safeCreateIndex(db, 'connects', { isDeleted: 1 });

  // ─── Room Bookings ────────────────────────
  await safeCreateIndex(db, 'roomsbookings', { available: 1 });
  await safeCreateIndex(db, 'roomsbookings', { isDeleted: 1 });

  // ─── Admin Access ─────────────────────────
  await safeCreateIndex(db, 'adminaccesses', { username: 1 }, { unique: true });
  await safeCreateIndex(db, 'adminaccesses', { role: 1 });

  // ─── Print Media ──────────────────────────
  await safeCreateIndex(db, 'printmedias', { createdAt: -1 });
  await safeCreateIndex(db, 'printmedias', { isDeleted: 1 });

  // ─── Talks ────────────────────────────────
  await safeCreateIndex(db, 'talks', { date: -1 });
  await safeCreateIndex(db, 'talks', { isDeleted: 1 });

  console.log('[indexes] All indexes ensured.');
}

async function safeCreateIndex(
  db: mongoose.mongo.Db,
  collectionName: string,
  keys: Record<string, 1 | -1 | 'text'>,
  options?: Record<string, unknown>
): Promise<void> {
  try {
    const collection = db.collection(collectionName);
    await collection.createIndex(keys, { background: true, ...options });
  } catch (err: unknown) {
    // Index might already exist with different options — log and continue
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('already exists')) {
      console.warn(`[indexes] Warning on ${collectionName}:`, msg);
    }
  }
}
