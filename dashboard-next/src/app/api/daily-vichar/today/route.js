import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DailyVichar from "@/models/DailyVichar";

export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let vichar = await DailyVichar.findOne({
      date: { $gte: today, $lt: tomorrow },
      isPublished: true,
      isDeleted: false,
    }).lean();

    if (!vichar) {
      vichar = await DailyVichar.findOne({
        isPublished: true,
        isDeleted: false,
        date: { $lt: today },
      })
        .sort({ date: -1 })
        .lean();
    }

    if (!vichar) {
      return NextResponse.json(
        { success: false, message: "No vichar available" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: vichar });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

