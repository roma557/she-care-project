import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/auth-types";
import { verifyOtpAsync } from "@/lib/db";
import { finalizeLogin } from "@/lib/auth-server";
import { verifyMsg91AccessToken } from "@/lib/msg91-server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const accessToken = typeof body.accessToken === "string" ? body.accessToken.trim() : "";

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
    return NextResponse.json({
      user,
      needsPasswordSetup: user.needsPasswordSetup ?? false,
    });
  }

  const phone = normalizePhone(body.phone ?? "");
  const code = String(body.otp ?? "").trim();

  if (!phone || code.length !== 4) {
    return NextResponse.json({ error: "Invalid phone or OTP" }, { status: 400 });
  }

  const otpResult = await verifyOtpAsync(phone, code);
  if (!otpResult.valid) {
    return NextResponse.json({ error: "Incorrect or expired OTP" }, { status: 401 });
  }

  const user = await finalizeLogin(phone, name, otpResult.name);
  return NextResponse.json({
    user,
    needsPasswordSetup: user.needsPasswordSetup ?? false,
  });
}
