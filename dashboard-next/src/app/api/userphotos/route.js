import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - Fetch all images
export async function GET() {
    try {
        const result = await cloudinary.search
            .expression('folder:user_photos')
            .sort_by('created_at', 'desc')
            .max_results(100)
            .execute();




        const images = result.resources.map((resource) => ({
            id: resource.public_id,
            name: resource.filename || resource.public_id,
            size: resource.bytes,
            type: resource.format,
            url: resource.secure_url,
            createdAt: resource.created_at,
        }));

        return NextResponse.json({ images, total: result.total_count });
    } catch (error) {
        console.error('Error fetching images:', error);
        return NextResponse.json(
            { error: 'Failed to fetch images' },
            { status: 500 }
        );
    }
}

// POST - Upload image
export async function POST(request) {
    try {
        const formData = await request.formData();
        console.log(formData)
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64Data, {
            folder: 'user_photos', // Optional: organize in folders
            resource_type: 'image',
        });

        const imageData = {
            id: result.public_id,
            name: file.name,
            size: result.bytes,
            type: result.format,
            url: result.secure_url,
            createdAt: result.created_at,
        };

        return NextResponse.json({ image: imageData }, { status: 201 });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}