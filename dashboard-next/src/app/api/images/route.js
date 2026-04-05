import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import Face from "@/models/FaceImage"; 
import axios from "axios";


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
    try {
        const result = await cloudinary.search
            .expression('folder:image_library')
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







export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const files = formData.getAll("file"); // multiple files
    console.log(files)
    // if (!files || files.length === 0) {
    //   return NextResponse.json({ error: "No files provided" }, { status: 400 });
    // }

    const uploadedImages = [];

    for (const file of files) {
      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

      // 1️⃣ Upload to Cloudinary
      const uploadRes = await cloudinary.uploader.upload(base64Data, {
        folder: "image_library",
        resource_type: "image",
      });
     
      const imageUrl = uploadRes.secure_url;

      // 2️⃣ Detect face using Face++
      const detectRes = await axios.post(
        "https://api-us.faceplusplus.com/facepp/v3/detect",
        new URLSearchParams({
          api_key: FACE_API_KEY,
          api_secret: FACE_API_SECRET,
          image_url: imageUrl,
        })
      );
      console.log('detectRes',detectRes)

      const faces = detectRes.data.faces;
      let faceToken = null;

      if (faces && faces.length > 0) {
        faceToken = faces[0].face_token;
      }

      // 3️⃣ Save to MongoDB
      const saved = await Face.create({
        public_id: uploadRes.public_id,
        name: file.name,
        url: imageUrl,
        format: uploadRes.format,
        size: uploadRes.bytes,
        face_token: faceToken,
        
      });

      uploadedImages.push(saved);
    }

    return NextResponse.json(
      { message: "Images uploaded successfully", images: uploadedImages },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error uploading images:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}
