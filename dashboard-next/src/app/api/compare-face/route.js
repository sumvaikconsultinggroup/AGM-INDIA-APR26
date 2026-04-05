import { NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/mongodb";
import FaceImage from "@/models/FaceImage";
import { v2 as cloudinary } from "cloudinary";

const FACE_API_KEY = process.env.FACE_API_KEY;
const FACE_API_SECRET = process.env.FACE_API_SECRET;

// Allowed file types and max size for uploads
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file"); // single file
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file is a File instance
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file: expected a File object" },
        { status: 400 }
      );
    }

    // Validate content type
    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_CONTENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed: 5MB` },
        { status: 400 }
      );
    }

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    // 1️⃣ Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(base64Data, {
      folder: "ueser_image_library",
      resource_type: "image",
    });
    const imageUrl = uploadRes.secure_url;

    // 2️⃣ Detect face using Face++ API
    const detectRes = await axios.post(
      "https://api-us.faceplusplus.com/facepp/v3/detect",
      new URLSearchParams({
        api_key: FACE_API_KEY,
        api_secret: FACE_API_SECRET,
        image_url: imageUrl,
      })
    );

    const faces = detectRes.data.faces;
    let faceToken = null;

    if (faces && faces.length > 0) {
      faceToken = faces[0].face_token;
    }

    // 3️⃣ Save to MongoDB
    const saved = await FaceImage.create({
      public_id: uploadRes.public_id,
      name: file.name,
      url: imageUrl,
      format: uploadRes.format,
      size: uploadRes.bytes,
      face_token: faceToken,
    });

    // 4️⃣ Compare with all existing face tokens in DB
    const matches = [];

    if (faceToken) {
      const existingFaces = await FaceImage.find({
        _id: { $ne: saved._id },
        face_token: { $ne: null },
      });

      // Run comparisons sequentially to avoid Face++ concurrency limits
      for (const existing of existingFaces) {
        try {
          const compareRes = await axios.post(
            "https://api-us.faceplusplus.com/facepp/v3/compare",
            new URLSearchParams({
              api_key: FACE_API_KEY,
              api_secret: FACE_API_SECRET,
              face_token1: faceToken,
              face_token2: existing.face_token,
            })
          );

          const confidence = compareRes.data.confidence;
          if (confidence > 80) {
            matches.push({
              matchedWith: existing._id,
              name: existing.name,
              confidence,
              url: existing.url,
            });
          }
        } catch (compareErr) {
          console.warn("Face++ compare failed for:", existing._id, compareErr.message);
        }
      }
    }

    return NextResponse.json(
      { message: "Image processed successfully", image: saved, matches },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Error uploading image:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to process image", details: error.message },
      { status: 500 }
    );
  }
}
