import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" }, { status: 200 });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 0,
  };
  // Clear both modern and legacy cookie names.
  response.cookies.set({ name: "auth_token", value: "", ...cookieOptions });
  response.cookies.set({ name: "token", value: "", ...cookieOptions });
  return response;
}
