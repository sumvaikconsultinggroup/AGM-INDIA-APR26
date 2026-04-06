import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config({ path: '.env.local' });
dotenv.config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'agm_india';

if (!mongoUri) {
  console.error('Missing MONGODB_URI or MONGO_URI.');
  process.exit(1);
}

const LANGUAGE_KEYS = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as'];
const devanagariRegex = /[\u0900-\u097F]/;

function cleanValue(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function isHindiLike(value) {
  return devanagariRegex.test(cleanValue(value));
}

function normalizeLocalized(existing, fallbackValue) {
  const localized = {};

  for (const key of LANGUAGE_KEYS) {
    const value = cleanValue(existing?.[key]);
    if (value) localized[key] = value;
  }

  const fallback = cleanValue(fallbackValue);
  if (!fallback) return Object.keys(localized).length ? localized : undefined;

  if (isHindiLike(fallback)) {
    localized.hi = localized.hi || fallback;
  } else {
    localized.en = localized.en || fallback;
  }

  return Object.keys(localized).length ? localized : undefined;
}

async function backfillCollection(collection, cursor, mapDocument) {
  let updated = 0;

  for await (const doc of cursor) {
    const update = mapDocument(doc);
    if (!update || !Object.keys(update.$set || {}).length) continue;

    await collection.updateOne({ _id: new ObjectId(doc._id) }, update);
    updated += 1;
  }

  return updated;
}

async function run() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);

    const articles = db.collection('articles');
    const articleCount = await backfillCollection(
      articles,
      articles.find({ isDeleted: { $ne: true } }),
      (doc) => {
        const titleTranslations = normalizeLocalized(doc.titleTranslations, doc.title);
        const descriptionTranslations = normalizeLocalized(doc.descriptionTranslations, doc.description);
        const categoryTranslations = normalizeLocalized(doc.categoryTranslations, doc.category);

        return {
          $set: {
            ...(titleTranslations ? { titleTranslations } : {}),
            ...(descriptionTranslations ? { descriptionTranslations } : {}),
            ...(categoryTranslations ? { categoryTranslations } : {}),
          },
        };
      }
    );

    const campaigns = db.collection('donates');
    const campaignCount = await backfillCollection(
      campaigns,
      campaigns.find({ isDeleted: { $ne: true } }),
      (doc) => {
        const titleTranslations = normalizeLocalized(doc.titleTranslations, doc.title);
        const descriptionTranslations = normalizeLocalized(doc.descriptionTranslations, doc.description);
        const additionalTextTranslations = normalizeLocalized(
          doc.additionalTextTranslations,
          doc.additionalText
        );

        return {
          $set: {
            ...(titleTranslations ? { titleTranslations } : {}),
            ...(descriptionTranslations ? { descriptionTranslations } : {}),
            ...(additionalTextTranslations ? { additionalTextTranslations } : {}),
          },
        };
      }
    );

    const schedules = db.collection('schedules');
    const scheduleCount = await backfillCollection(
      schedules,
      schedules.find({ isDeleted: { $ne: true } }),
      (doc) => {
        const publicTitle = normalizeLocalized(doc.publicTitle, doc.locations);
        const publicLocation = normalizeLocalized(doc.publicLocation, doc.locations);
        const publicNotes = normalizeLocalized(doc.publicNotes, doc.changeNote || doc.internalNotes);

        return {
          $set: {
            ...(publicTitle ? { publicTitle } : {}),
            ...(publicLocation ? { publicLocation } : {}),
            ...(publicNotes ? { publicNotes } : {}),
          },
        };
      }
    );

    console.log(
      JSON.stringify(
        {
          success: true,
          articlesUpdated: articleCount,
          campaignsUpdated: campaignCount,
          schedulesUpdated: scheduleCount,
        },
        null,
        2
      )
    );
  } finally {
    await client.close();
  }
}

run().catch((error) => {
  console.error('Failed to backfill localized content:', error);
  process.exit(1);
});
