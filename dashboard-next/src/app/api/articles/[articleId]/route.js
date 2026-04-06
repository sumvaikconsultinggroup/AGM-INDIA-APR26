import { NextResponse } from 'next/server';
import Article from '@/models/Articles';
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

// Function to extract Cloudinary public ID from URL
function getCloudinaryPublicId(url) {
  // Check if it's a Cloudinary URL
  if (!url || !url.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    // Extract the public ID from the URL pattern
    const match = url.match(/\/articles\/([^/]+)/);
    return match ? `articles/${match[1].split('.')[0]}` : null;
  } catch (error) {
    console.error('Error extracting Cloudinary public ID:', error);
    return null;
  }
}

// Delete old image from Cloudinary
async function deleteOldImage(imageUrl) {
  try {
    // Skip if the path is a default image or invalid
    if (!imageUrl || imageUrl.includes('placeholder')) {
      return false;
    }

    // Extract the Cloudinary public ID
    const publicId = getCloudinaryPublicId(imageUrl);

    if (!publicId) {
      // console.log("Not a Cloudinary image or couldn't extract ID:", imageUrl);
      return false;
    }

    // Delete the image from Cloudinary
    const cloudinary = getCloudinary();
    const result = await cloudinary.uploader.destroy(publicId);
    // console.log(`Cloudinary delete result for ${publicId}:`, result);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { articleId } = params;

    if (!articleId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Article ID is required',
        },
        { status: 400 }
      );
    }

    // First fetch the existing article so we know what image to delete
    const existingArticle = await Article.findById(articleId);
    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          message: 'Article not found',
        },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const title = formData.get('title');
    const description = formData.get('description');
    const link = formData.get('link');
    const category = formData.get('category');
    const titleTranslations = parseLocalizedJson(formData.get('titleTranslations'));
    const descriptionTranslations = parseLocalizedJson(formData.get('descriptionTranslations'));
    const categoryTranslations = parseLocalizedJson(formData.get('categoryTranslations'));
    const readTime = formData.get('readTime') ? Number(formData.get('readTime')) : undefined;
    const publishedDateStr = formData.get('publishedDate');
    const coverImageFile = formData.get('coverImage');

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: 'Title and description are required',
        },
        { status: 400 }
      );
    }

    const publishedDate = publishedDateStr ? new Date(publishedDateStr) : undefined;
    if (publishedDateStr && isNaN(new Date(publishedDateStr).getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid date format',
        },
        { status: 400 }
      );
    }

    const updateData = {
      title: getPrimaryLocalizedValue(titleTranslations, title),
      description: getPrimaryLocalizedValue(descriptionTranslations, description),
      titleTranslations,
      descriptionTranslations,
      categoryTranslations,
      link,
      category: getPrimaryLocalizedValue(categoryTranslations, category) || undefined,
      readTime,
      publishedDate,
    };

    // Handle new image upload to Cloudinary
    if (coverImageFile && coverImageFile instanceof File && coverImageFile.size > 0) {
      // Validate file type
      if (!coverImageFile.type.startsWith('image/')) {
        return NextResponse.json(
          {
            success: false,
            message: 'Cover image must be an image file',
          },
          { status: 400 }
        );
      }

      try {
        // Convert file to buffer for Cloudinary
        const arrayBuffer = await coverImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary with specific folder and options
        const cloudinary = getCloudinary();
        const cloudinaryResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: 'articles',
                resource_type: 'image',
                transformation: [
                  { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
                  { quality: 'auto:good' },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        });

        // Get the secure URL from Cloudinary response
        updateData.coverImage = cloudinaryResponse.secure_url;
        // console.log(`Cover image uploaded to Cloudinary: ${updateData.coverImage}`);

        // Delete the old image from Cloudinary if it exists
        if (existingArticle.coverImage) {
          await deleteOldImage(existingArticle.coverImage);
        }
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        // Continue with the update even if image processing fails
      }
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedArticle = await Article.findByIdAndUpdate(articleId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedArticle) {
      return NextResponse.json(
        {
          success: false,
          message: 'Article not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Article updated successfully',
        data: JSON.parse(JSON.stringify(updatedArticle)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('UPDATE Article Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update article',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { articleId } = params;

    if (!articleId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Article ID is required',
        },
        { status: 400 }
      );
    }

    // Get article to check for image to delete
    const article = await Article.findById(articleId);
    if (!article) {
      return NextResponse.json(
        {
          success: false,
          message: 'Article not found',
        },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if exists
    if (article.coverImage) {
      await deleteOldImage(article.coverImage);
    }

    // Perform soft delete
    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      { isDeleted: true },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Article deleted successfully',
        data: JSON.parse(JSON.stringify(updatedArticle)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE Article Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete article',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { articleId } = params;

    if (!articleId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Article ID is required',
        },
        { status: 400 }
      );
    }

    const article = await Article.findById(articleId).where({ isDeleted: false });

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          message: 'Article not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Article retrieved successfully',
        data: JSON.parse(JSON.stringify(article)),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('GET Article Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve article',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
