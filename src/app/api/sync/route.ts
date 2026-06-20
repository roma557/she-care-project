import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { findUserById, getUserAppData, setUserAppData } from "@/lib/users-db";
import type { AppSyncPayload } from "@/lib/sync-types";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data = getUserAppData(user.id);
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

  const existing = getUserAppData(user.id);
  if (
    existing?.updatedAt &&
    body.data.updatedAt &&
    existing.updatedAt > body.data.updatedAt
  ) {
    return NextResponse.json({ data: existing, merged: false });
  }

  const saved = setUserAppData(user.id, {
    ...body.data,
    updatedAt: new Date().toISOString(),
  });

  const record = findUserById(user.id);
  if (!record) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { notifications: _, appData: __, ...safeUser } = record;
  return NextResponse.json({ data: saved, user: safeUser, merged: true });
}
