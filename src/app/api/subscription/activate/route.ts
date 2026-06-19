import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { findUserById, updateUser } from "@/lib/users-db";
import { SubscriptionTier } from "@/lib/subscription";

/** Demo endpoint to activate a plan — replace with Razorpay/Stripe webhook later */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const tier = body.tier as SubscriptionTier;
  const validTiers: SubscriptionTier[] = ["rozana", "sampoorna", "sakhi"];

  if (!validTiers.includes(tier)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + 1);

  const updated = updateUser(user.id, {
    subscription: {
      tier,
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    },
  });

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { notifications: _, ...safeUser } = updated;
  return NextResponse.json({ user: safeUser });
}
