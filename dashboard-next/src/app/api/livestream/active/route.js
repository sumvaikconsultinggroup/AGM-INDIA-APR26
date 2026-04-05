import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveStream from "@/models/LiveStream";

export async function GET() {
  try {
    await connectDB();

    const activeStream = await LiveStream.findOne({
      isLive: true,
      isDeleted: false,
    }).lean();

    const upcomingStreams = await LiveStream.find({
      isUpcoming: true,
      isLive: false,
      isDeleted: false,
      scheduledStart: { $gte: new Date() },
    })
      .sort({ scheduledStart: 1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        active: activeStream || null,
        upcoming: upcomingStreams,
        isLiveNow: !!activeStream,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

