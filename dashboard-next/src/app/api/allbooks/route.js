import { NextResponse } from 'next/server';
import Book from '@/models/Book';
import { connectDB } from '@/lib/mongodb';
// import path from 'path';
// import fs from 'fs';
import getCloudinary from '@/utils/cloudinary'; // Import the cloudinary config
// Ensure this type is defined in your types directory

// Helpers
const errorResponse = (message, error = '', status = 500) =>
  NextResponse.json({ success: false, message, error }, { status });

const successResponse = (data, message, status = 200) =>
  NextResponse.json(
    { success: true, message, data },
    {
      status,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
      },
    }
  );

// Directory setup
// const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/books');
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// GET: Fetch books
export async function GET() {
  try {
    await connectDB();

    const articles = await Book.find({ isDeleted: { $ne: true } })
      .sort({ publishedDate: -1 }) // Most recent articles first
      .select('-__v')
      .lean();

    if (!articles?.length) {
      return NextResponse.json(
        {
          success: true,
          message: 'No books found',
          data: [],
        },
        { status: 200 }
      );
    }

    // Safely stringify and parse to handle any problematic values
    const sanitizedArticles = JSON.parse(JSON.stringify(articles));

    return NextResponse.json(
      {
        success: true,
        message: 'Books fetched successfully',
        data: sanitizedArticles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET Articles Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch books',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: Create book - updated to use Cloudinary
export async function POST(req) {
  try {
    await connectDB();
    const formData = await req.formData();

    const title = formData.get('title')?.toString() || '';
    const author = formData.get('author')?.toString() || '';
    const publishedDateStr = formData.get('publishedDate')?.toString() || '';
    const genre = formData.get('genre')?.toString() || '';
    const language = formData.get('language')?.toString() || '';
    const ISBN = formData.get('ISBN')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const purchaseUrl = formData.get('purchaseUrl')?.toString().trim() || '';
    const pages = Number(formData.get('pages'));
    const price = Number(formData.get('price'));
    const coverImageFile = formData.get('coverImage');

    const stockIn = Number(formData.get('stock[stockIn]'));
    const soldOut = Number(formData.get('stock[soldOut]') ?? 0);
    const available = Number(formData.get('stock[available]') ?? stockIn - soldOut);

    // Validate required fields
    const requiredFields = [
      { name: 'title', value: title },
      { name: 'author', value: author },
      { name: 'publishedDate', value: publishedDateStr },
      { name: 'genre', value: genre },
      { name: 'language', value: language },
      { name: 'ISBN', value: ISBN },
      { name: 'description', value: description },
      { name: 'pages', value: pages },
      { name: 'price', value: price },
    ];

    const missing = requiredFields.filter(field => !field.value).map(field => field.name);
    if (missing.length)
      return errorResponse(`Missing required fields: ${missing.join(', ')}`, undefined, 400);

    // Keep all your existing validations
    if (isNaN(pages) || pages <= 0)
      return errorResponse('Pages must be a positive number', undefined, 400);
    if (isNaN(price) || price < 0) return errorResponse('Price cannot be negative', undefined, 400);
    if (isNaN(stockIn) || stockIn < 0)
      return errorResponse('Initial stock must be a positive number', undefined, 400);
    if (!/^[0-9]{13}$/.test(ISBN))
      return errorResponse('Invalid ISBN format. Must be 13 digits', undefined, 400);

    const publishedDate = new Date(publishedDateStr);
    if (isNaN(publishedDate.getTime()))
      return errorResponse('Invalid published date', undefined, 400);

    const existingBook = await Book.findOne({ ISBN, isDeleted: { $ne: true } });
    if (existingBook) return errorResponse('Book with this ISBN already exists', undefined, 409);

    // Upload cover image to Cloudinary instead of local storage
    let coverImage = '/placeholder-book.jpg'; // Default image

    if (coverImageFile && coverImageFile.size > 0) {
      // Validate file type
      if (!coverImageFile.type.startsWith('image/'))
        return errorResponse('Invalid file type. Only images allowed.', undefined, 400);

      // Validate file size
      if (coverImageFile.size > 5 * 1024 * 1024)
        return errorResponse('Image too large. Max 5MB.', undefined, 400);

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
                folder: 'books/covers',
                resource_type: 'image',
                transformation: [{ width: 600, crop: 'limit' }, { quality: 'auto:good' }],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        });

        // Get the secure URL from Cloudinary response
        coverImage = cloudinaryResponse.secure_url;
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return errorResponse(
          'Failed to upload cover image',
          typeof uploadError === 'object' && uploadError !== null && 'message' in uploadError
            ? uploadError.message
            : String(uploadError),
          500
        );
      }
    }

    // Create the book record with the Cloudinary URL
    const book = new Book({
      title: title.trim(),
      author: author.trim(),
      publishedDate,
      genre: genre.trim(),
      language: language.trim(),
      ISBN,
      description: description.trim(),
      purchaseUrl: purchaseUrl || undefined,
      pages,
      price,
      coverImage, // This will now be a Cloudinary URL
      isDeleted: false,
      stock: {
        stockIn,
        soldOut,
        available,
        lastUpdated: new Date(),
      },
    });

    const validationError = book.validateSync();
    if (validationError) {
      return errorResponse(
        'Validation failed',
        Object.values(validationError.errors)
          .map(err => err.message)
          .join(', '),
        400
      );
    }

    await book.save();
    return successResponse(book, 'Book created successfully', 201);
  } catch (error) {
    console.error('POST Book Error:', error);
    return errorResponse(
      'Failed to create book',
      (error instanceof Error ? error.message : String(error)) || 'Unknown error'
    );
  }
}
