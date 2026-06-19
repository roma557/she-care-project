import { NextRequest, NextResponse } from "next/server";
import {
  normalizePhone,
  createDefaultUser,
  getNextMonthReset,
} from "@/lib/auth-types";
import {
  findUserByPhone,
  upsertUser,
  verifyOtp,
} from "@/lib/users-db";
import { createSessionToken, setSessionCookie } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const phone = normalizePhone(body.phone ?? "");
  const code = String(body.otp ?? "").trim();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!phone || code.length !== 4) {
    return NextResponse.json({ error: "Invalid phone or OTP" }, { status: 400 });
  }

  const otpResult = verifyOtp(phone, code);
  if (!otpResult.valid) {
    return NextResponse.json({ error: "Incorrect or expired OTP" }, { status: 401 });
  }

  let user = findUserByPhone(phone);
  if (!user) {
    const displayName = name || otpResult.name || "Friend";
    user = upsertUser(createDefaultUser(phone, displayName));
  } else if (name && name !== user.name) {
    user = upsertUser({ ...user, name });
  }

  // Reset AI counter monthly
  if (new Date(user.aiQuestionsResetAt) <= new Date()) {
    user = upsertUser({
      ...user,
      aiQuestionsUsed: 0,
      aiQuestionsResetAt: getNextMonthReset(),
    });
  }

  const token = await createSessionToken({ userId: user.id, phone: user.phone });
  await setSessionCookie(token);

  const { notifications: _, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}
