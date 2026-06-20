import { NextRequest, NextResponse } from "next/server";
import { normalizePhone, createDefaultUser } from "@/lib/auth-types";
import { storeOtpAsync } from "@/lib/db";

function generateOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const phone = normalizePhone(body.phone ?? "");
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!phone) {
    return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number" }, { status: 400 });
  }

  const code = generateOtp();
  await storeOtpAsync(phone, code, name || undefined);

  // In production, send via MSG91 / Twilio. Dev returns OTP for testing.
  const isDev = process.env.NODE_ENV !== "production";

  return NextResponse.json({
    success: true,
    message: "OTP sent to your phone",
    ...(isDev ? { devOtp: code } : {}),
  });
}
