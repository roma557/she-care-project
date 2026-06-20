import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import {
  getUserAppDataAsync,
  setUserAppDataAsync,
  findUserByIdAsync,
  hydrateUserSubscription,
} from "@/lib/db";
import { resolveEffectiveTier } from "@/lib/permissions";
import { trimSyncPayloadByTier } from "@/lib/sync-trim";
import type { AppSyncPayload } from "@/lib/sync-types";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const raw = await getUserAppDataAsync(user.id);
  const tier = await resolveEffectiveTier(user.id);
  const data = raw ? trimSyncPayloadByTier(raw, tier) : null;
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as { data: AppSyncPayload };
  if (!body.data?.profile || !body.data?.cycle) {
    return NextResponse.json({ error: "Invalid sync payload" }, { status: 400 });
  }

  const tier = await resolveEffectiveTier(user.id);
  const trimmed = trimSyncPayloadByTier(body.data, tier);

  const existing = await getUserAppDataAsync(user.id);
  if (
    existing?.updatedAt &&
    trimmed.updatedAt &&
    existing.updatedAt > trimmed.updatedAt
  ) {
    return NextResponse.json({
      data: trimSyncPayloadByTier(existing, tier),
      merged: false,
    });
  }

  const saved = await setUserAppDataAsync(user.id, {
    ...trimmed,
    updatedAt: new Date().toISOString(),
  });

  const record = await findUserByIdAsync(user.id);
  if (!record) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const hydrated = await hydrateUserSubscription(record);
  const { notifications: _, ...safeUser } = hydrated;
  return NextResponse.json({
    data: trimSyncPayloadByTier(saved, tier),
    user: safeUser,
    merged: true,
  });
}
