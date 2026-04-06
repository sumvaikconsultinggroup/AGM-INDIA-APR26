import Donate from '@/models/Donate';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import getCloudinary from '@/utils/cloudinary';

const CONTENT_LANGUAGES = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as'];

function normalizeLocalizedText(input) {
  if (!input || typeof input !== 'object') return undefined;

  const normalized = {};
  for (const language of CONTENT_LANGUAGES) {
    const value = input[language];
    if (typeof value === 'string' && value.trim()) {
      normalized[language] = value.trim();
    }
  }

  return Object.keys(normalized).length ? normalized : undefined;
}

function parseLocalizedJson(value) {
  if (!value || typeof value !== 'string') return undefined;
  try {
    return normalizeLocalizedText(JSON.parse(value));
  } catch {
    return undefined;
  }
}

function getPrimaryLocalizedValue(localized, fallback) {
  return (
    localized?.en ||
    localized?.hi ||
    localized?.bn ||
    localized?.ta ||
    localized?.te ||
    localized?.mr ||
    localized?.gu ||
    localized?.kn ||
    localized?.ml ||
    localized?.pa ||
    localized?.or ||
    localized?.as ||
    fallback ||
    ''
  );
}

export async function GET() {
  try {
    await connectDB();

    const donations = await Donate.find({ isActive: true, isDeleted: false });

    if (!donations || donations.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No active donations found',
          data: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Donations fetched successfully',
        data: donations,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch donations',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const title = formData.get('title');
    const description = formData.get('description');
    const additionalText = formData.get('additionalText');
    const titleTranslations = parseLocalizedJson(formData.get('titleTranslations'));
    const descriptionTranslations = parseLocalizedJson(formData.get('descriptionTranslations'));
    const additionalTextTranslations = parseLocalizedJson(formData.get('additionalTextTranslations'));
    const goal = Number(formData.get('goal'));
    const achieved = Number(formData.get('achieved') || 0);
    const donors = Number(formData.get('donors') || 0);
    const totalDays = Number(formData.get('totalDays') || 30);
    const isActive = formData.get('isActive') === 'true';

    const backgroundImageFile = formData.get('backgroundImage');

    if (!title || !description || !goal || !backgroundImageFile) {
      return NextResponse.json(
        {
          success: false,
          message: 'Title, description, goal, and backgroundImage are required',
        },
        { status: 400 }
      );
    }

    let backgroundImageUrl = '/placeholder.svg';

    if (backgroundImageFile && backgroundImageFile.size > 0) {
      const arrayBuffer = await backgroundImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const cloudinary = getCloudinary();
      const cloudinaryResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'donations',
              resource_type: 'image',
              transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto:good' }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      backgroundImageUrl = cloudinaryResponse.secure_url;
    }

    const newDonation = new Donate({
      title: getPrimaryLocalizedValue(titleTranslations, title),
      description: getPrimaryLocalizedValue(descriptionTranslations, description),
      goal,
      titleTranslations,
      descriptionTranslations,
      additionalText: getPrimaryLocalizedValue(additionalTextTranslations, additionalText) || undefined,
      additionalTextTranslations,
      achieved,
      donors,
      totalDays,
      backgroundImage: backgroundImageUrl,
      isActive,
    });

    await newDonation.validate();
    await newDonation.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Donation created successfully',
        data: newDonation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating donation campaign:', error);

    if (error?.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create donation campaign',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
