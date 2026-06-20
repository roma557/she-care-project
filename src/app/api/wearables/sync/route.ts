import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { assertAccess } from "@/lib/permissions";
import { getWearablesAsync, updateWearableSyncAsync } from "@/lib/db";
import { syncDemoWearable } from "@/lib/wearables";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    await assertAccess(user.id, "wearable_sync");
  } catch {
    return NextResponse.json({ error: "upgrade_required", requiredTier: "plus" }, { status: 403 });
  }

  const body = await req.json();
  const deviceId = String(body.deviceId ?? "");
  const devices = await getWearablesAsync(user.id);
  const device = devices.find((d) => d.id === deviceId);
  if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });

  const syncData = await syncDemoWearable();
  await updateWearableSyncAsync(deviceId);

  return NextResponse.json({ sync: syncData, deviceId });
}
