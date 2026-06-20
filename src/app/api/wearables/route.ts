import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { assertAccess, resolveEffectiveTier } from "@/lib/permissions";
import { getWearablesAsync, addWearableAsync, removeWearableAsync } from "@/lib/db";
import { getTierLimits } from "@/lib/subscription";
import { syncDemoWearable } from "@/lib/wearables";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const devices = await getWearablesAsync(user.id);
  const tier = await resolveEffectiveTier(user.id);
  return NextResponse.json({ devices, limit: getTierLimits(tier).wearableDevices });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    await assertAccess(user.id, "wearable_sync");
  } catch {
    return NextResponse.json({ error: "upgrade_required", requiredTier: "plus" }, { status: 403 });
  }

  const tier = await resolveEffectiveTier(user.id);
  const limits = getTierLimits(tier);
  const existing = await getWearablesAsync(user.id);
  if (existing.length >= limits.wearableDevices && limits.wearableDevices !== Infinity) {
    return NextResponse.json({ error: "device_limit_reached" }, { status: 403 });
  }

  const body = await req.json();
  const provider = String(body.provider ?? "google_fit");
  const deviceName = String(body.deviceName ?? "My Device");

  const device = await addWearableAsync({
    userId: user.id,
    provider,
    externalId: `demo_${Date.now()}`,
    deviceName,
    lastSyncAt: null,
  });

  return NextResponse.json({ device });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const deviceId = req.nextUrl.searchParams.get("id");
  if (!deviceId) return NextResponse.json({ error: "Device id required" }, { status: 400 });
  await removeWearableAsync(user.id, deviceId);
  return NextResponse.json({ ok: true });
}
