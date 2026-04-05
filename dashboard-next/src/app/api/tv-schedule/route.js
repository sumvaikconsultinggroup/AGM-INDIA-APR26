import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TVSchedule from "@/models/TVSchedule";

export async function GET() {
  try {
    await connectDB();
    const schedules = await TVSchedule.find({
      isActive: true,
      isDeleted: false,
    })
      .sort({ channel: 1, dayOfWeek: 1 })
      .lean();

    return NextResponse.json({ success: true, data: schedules });
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
    const schedule = await TVSchedule.create(body);
    return NextResponse.json({ success: true, data: schedule }, { status: 201 });
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
    const schedule = await TVSchedule.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!schedule) {
      return NextResponse.json(
        { success: false, message: "Schedule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await TVSchedule.findByIdAndUpdate(id, { isDeleted: true });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

