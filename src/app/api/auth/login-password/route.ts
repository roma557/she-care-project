import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/auth-types";
import { findUserByPhoneAsync, getUserPasswordHashAsync } from "@/lib/db";
import { finalizeLogin } from "@/lib/auth-server";
import { verifyPassword } from "@/lib/password";
import { getEffectiveTier } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const phone = normalizePhone(body.phone ?? "");
  const password = typeof body.password === "string" ? body.password : "";

  if (!phone || !password) {
    return NextResponse.json({ error: "Invalid phone or password" }, { status: 400 });
  }

  const user = await findUserByPhoneAsync(phone);
  if (!user) {
    return NextResponse.json({ error: "Invalid phone or password" }, { status: 401 });
  }

  const isPaid = getEffectiveTier(user.subscription) !== "free";
  const passwordHash = await getUserPasswordHashAsync(user.id);

  if (!isPaid || !passwordHash) {
    return NextResponse.json({ error: "Invalid phone or password" }, { status: 401 });
  }

  const valid = await verifyPassword(password, passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid phone or password" }, { status: 401 });
  }

  const safeUser = await finalizeLogin(phone, user.name);
  return NextResponse.json({ user: safeUser, hasPassword: true });
}
