import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : undefined;
    const token =
      bearerToken ||
      cookieStore.get("auth_token")?.value ||
      cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    return NextResponse.json({
      success: true,
      message: "Token verified",
      data: { admin: decoded },
      admin: decoded,
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 403 });
  }
}
