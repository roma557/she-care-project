import { NextRequest, NextResponse } from "next/server";
import {
  normalizePhone,
  createDefaultUser,
  getNextMonthReset,
} from "@/lib/auth-types";
import {
  findUserByPhone,
  upsertUser,
  verifyOtp as verifyLocalOtp,
} from "@/lib/users-db";
import { createSessionToken, setSessionCookie } from "@/lib/auth-server";
import { verifyMsg91AccessToken } from "@/lib/msg91-server";

async function finalizeLogin(phone: string, name: string, fallbackName?: string) {
  let user = findUserByPhone(phone);
  if (!user) {
    const displayName = name || fallbackName || "Friend";
    user = upsertUser(createDefaultUser(phone, displayName));
  } else if (name && name !== user.name) {
    user = upsertUser({ ...user, name });
  }

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
  return safeUser;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const accessToken = typeof body.accessToken === "string" ? body.accessToken.trim() : "";

  // MSG91 widget flow — verify JWT access token on server
  if (accessToken) {
    const msg91 = await verifyMsg91AccessToken(accessToken);
    if (!msg91.ok || !msg91.identifier) {
      return NextResponse.json(
        { error: msg91.error ?? "OTP verification failed" },
        { status: 401 },
      );
    }

    const phone = normalizePhone(msg91.identifier);
    if (!phone) {
      return NextResponse.json({ error: "Invalid phone from verification" }, { status: 400 });
    }

    const user = await finalizeLogin(phone, name);
    return NextResponse.json({ user });
  }

  // Legacy dev fallback when MSG91 env vars are not set
  const phone = normalizePhone(body.phone ?? "");
  const code = String(body.otp ?? "").trim();

  if (!phone || code.length !== 4) {
    return NextResponse.json({ error: "Invalid phone or OTP" }, { status: 400 });
  }

  const otpResult = verifyLocalOtp(phone, code);
  if (!otpResult.valid) {
    return NextResponse.json({ error: "Incorrect or expired OTP" }, { status: 401 });
  }

  const user = await finalizeLogin(phone, name, otpResult.name);
  return NextResponse.json({ user });
}
