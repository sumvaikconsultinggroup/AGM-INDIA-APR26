import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb'; // your MongoDB connection helper
import Book from '@/models/Book'; // your mongoose Book model

// ✅ Get single book (for edit form prefill)
export async function GET(req, { params }) {
  try {
    await connectDB();
    const book = await Book.findById(params.id);

    if (!book) {
      return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: book });
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch book' }, { status: 500 });
  }
}

// ✅ Update book (already in your form with PUT request)
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const formData = await req.formData();

    // Build update object
    const updateData = {
      title: formData.get('title'),
      author: formData.get('author'),
      publishedDate: formData.get('publishedDate'),
      genre: formData.get('genre'),
      language: formData.get('language'),
      ISBN: formData.get('ISBN'),
      description: formData.get('description'),
      purchaseUrl: formData.get('purchaseUrl')?.toString().trim() || undefined,
      pages: Number(formData.get('pages')),
      price: Number(formData.get('price')),
      stock: {
        stockIn: Number(formData.get('stock[stockIn]')),
        soldOut: Number(formData.get('stock[soldOut]')),
        available: Number(formData.get('stock[available]')),
        lastUpdated: new Date(formData.get('stock[lastUpdated]')),
      },
    };

    // If image exists, handle it here (upload logic / save path etc.)
    if (formData.get('coverImage')) {
      updateData.coverImage = formData.get('coverImage');
    }

    const updatedBook = await Book.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ success: false, error: 'Failed to update book' }, { status: 500 });
  }
}

// ✅ Delete book
export async function DELETE(req, { params }) {

  try {
    await connectDB();
    const deletedBook = await Book.findByIdAndDelete(params.id);

    if (!deletedBook) {
      return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete book' }, { status: 500 });
  }
}
