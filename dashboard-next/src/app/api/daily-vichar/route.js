import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DailyVichar from "@/models/DailyVichar";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const skip = (page - 1) * limit;

    const vichars = await DailyVichar.find({ isDeleted: false })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await DailyVichar.countDocuments({ isDeleted: false });

    return NextResponse.json({
      success: true,
      data: vichars,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
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

    const existing = await DailyVichar.findOne({
      date: new Date(body.date),
      isDeleted: false,
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A vichar already exists for this date" },
        { status: 400 }
      );
    }

    const vichar = await DailyVichar.create(body);
    return NextResponse.json({ success: true, data: vichar }, { status: 201 });
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
    const vichar = await DailyVichar.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!vichar) {
      return NextResponse.json(
        { success: false, message: "Vichar not found" },
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

