import { NextResponse } from 'next/server';
import Article from '@/models/Articles';
import { connectDB } from '@/lib/mongodb';
import getCloudinary from '@/utils/cloudinary'; // Import cloudinary
import { UploadApiResponse } from 'cloudinary';

// API Response type
type ApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
};

// First, add this interface above the POST function:
interface ArticleData {
  title: string;
  description: string;
  category?: string;
  link?: string;
  readTime?: number;
  publishedDate: Date;
  coverImage?: string;
}

// GET all articles (with optional pagination)
export async function GET(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '0', 10), 100);
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';

    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }
    if (category) filter.category = category;

    // Paginated response
    if (page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const [articles, total] = await Promise.all([
        Article.find(filter).sort({ publishedDate: -1 }).skip(skip).limit(limit).select('-__v').lean(),
        Article.countDocuments(filter),
      ]);
      const sanitizedArticles = JSON.parse(JSON.stringify(articles));
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json(
        {
          success: true,
          message: 'Articles fetched successfully',
          data: sanitizedArticles,
          meta: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
        },
        { status: 200, headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=60', 'X-Total-Count': String(total) } }
      );
    }

    // Legacy: return all articles
    const articles = await Article.find(filter)
      .sort({ publishedDate: -1 })
      .select('-__v')
      .lean();

    if (!articles?.length) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'No articles found' },
        { status: 404 }
      );
    }

    const sanitizedArticles = JSON.parse(JSON.stringify(articles));

    return NextResponse.json(
      {
        success: true,
        message: 'Articles fetched successfully',
        data: sanitizedArticles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET Articles Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch articles',
      },
      { status: 500 }
    );
  }
}

// POST create new article
export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const form = await req.formData();

    // Get form data
    const data = {
      title: form.get('title') as string,
      description: form.get('description') as string,
      category: form.get('category') as string,
      link: form.get('link') as string,
      readTime: (Number(form.get('readTime')) as number) || undefined,
      publishedDate: form.get('publishedDate')
        ? new Date(form.get('publishedDate') as string)
        : new Date(),
      file: form.get('coverImage') as File | null,
    };

    // Basic validation
    if (!data.title || !data.description) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Title and description are required',
        },
        { status: 400 }
      );
    }

    // Handle optional fields
    const articleData: ArticleData = {
      title: data.title,
      description: data.description,
      category: data.category || undefined,
      link: data.link || undefined,
      readTime: data.readTime || undefined,
      publishedDate: data.publishedDate,
    };

    // Set default cover image
    let coverImageUrl = '/placeholder-article.jpg';

    // Handle file upload if provided - REPLACE with Cloudinary upload
    if (data.file && data.file instanceof File && data.file.size > 0) {
      // Validate file type (must be an image)
      if (!data.file.type.startsWith('image/')) {
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
        const arrayBuffer = await data.file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary with specific folder and options
        const cloudinary = getCloudinary();
        const cloudinaryResponse = await new Promise<UploadApiResponse>((resolve, reject) => {
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
                else resolve(result as UploadApiResponse);
              }
            )
            .end(buffer);
        });

        // Get the secure URL from Cloudinary response
        coverImageUrl = cloudinaryResponse.secure_url;
        // console.log('Cover image uploaded to Cloudinary:', coverImageUrl);
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to upload cover image',
            error: uploadError instanceof Error ? uploadError.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // Add the Cloudinary image URL to article data
    articleData.coverImage = coverImageUrl;

    // Create article
    const newArticle = await Article.create(articleData);

    return NextResponse.json(
      {
        success: true,
        message: 'Article created successfully',
        data: newArticle,
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, private',
        },
      }
    );
  } catch (error) {
    console.error('POST Article Error:', error);

    // Handle validation errors specifically
    if (error instanceof Error && error.name === 'ValidationError') {
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
        message: 'Failed to create article',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
