import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/auth-types";
import { findUserByPhoneAsync, userHasPasswordAsync } from "@/lib/db";
import { getEffectiveTier } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const phone = normalizePhone(body.phone ?? "");

  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const user = await findUserByPhoneAsync(phone);
  if (!user) {
    return NextResponse.json({ method: "otp", isPaid: false });
  }

  const isPaid = getEffectiveTier(user.subscription) !== "free";
  const hasPassword = await userHasPasswordAsync(user.id);

  return NextResponse.json({
    method: isPaid && hasPassword ? "password" : "otp",
    name: user.name,
    isPaid,
  });
}
