import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveStream from "@/models/LiveStream";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const query = { isDeleted: false };
    if (status === "live") query.isLive = true;
    if (status === "upcoming") {
      query.isUpcoming = true;
      query.isLive = false;
      query.scheduledStart = { $gte: new Date() };
    }
    if (status === "past") {
      query.isLive = false;
      query.isUpcoming = false;
    }

    const streams = await LiveStream.find(query)
      .sort({ scheduledStart: status === "past" ? -1 : 1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: streams });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const stream = await LiveStream.create(body);
    return NextResponse.json({ success: true, data: stream }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;
    const stream = await LiveStream.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!stream) {
      return NextResponse.json(
        { success: false, message: "Stream not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: stream });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

