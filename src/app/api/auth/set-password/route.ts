import { NextRequest, NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-server";
import { setUserPasswordAsync } from "@/lib/db";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { getEffectiveTier } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireSessionUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPaid = getEffectiveTier(user.subscription) !== "free";
  if (!isPaid) {
    return NextResponse.json({ error: "Password login is only for paid plans" }, { status: 403 });
  }

  const body = await req.json();
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const strengthError = validatePasswordStrength(password);
  if (strengthError) {
    return NextResponse.json({ error: strengthError }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await setUserPasswordAsync(user.id, passwordHash);

  return NextResponse.json({ ok: true, hasPassword: true });
}
