import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

function ensureFirebaseAdmin() {
  if (admin.apps.length) return;

  const raw = process.env.FIREBASE_ADMIN_SDK_JSON;
  if (!raw) {
    throw new Error("FIREBASE_ADMIN_SDK_JSON is not configured");
  }

  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(req: NextRequest) {
  try {
    ensureFirebaseAdmin();
    const { title, body, topic, imageUrl, data } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { success: false, message: "Title and body are required" },
        { status: 400 }
      );
    }

    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl }),
      },
      ...(data && { data }),
      topic: topic || "all",
    };

    const response = await admin.messaging().send(message);

    return NextResponse.json({
      success: true,
      data: { messageId: response },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
