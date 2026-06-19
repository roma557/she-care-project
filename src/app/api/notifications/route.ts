import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import {
  findUserById,
  setUserNotifications,
  updateUser,
} from "@/lib/users-db";
import {
  generateSmartNotifications,
  AppNotification,
  NotificationPreferences,
} from "@/lib/notifications";
import { getEffectiveTier } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cycleDay = Number(searchParams.get("cycleDay") ?? "1");
  const hasAssessment = searchParams.get("hasAssessment") === "true";

  const record = findUserById(user.id);
  if (!record) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existingIds = new Set(record.notifications.map((n) => n.id));
  const newOnes = generateSmartNotifications({
    currentCycleDay: cycleDay,
    hasAssessment,
    subscriptionExpiresAt: user.subscription.expiresAt,
    subscriptionTier: getEffectiveTier(user.subscription),
    existingIds,
    prefs: user.notificationPrefs,
  });

  let notifications = record.notifications;
  if (newOnes.length > 0) {
    notifications = [...newOnes, ...notifications].slice(0, 50);
    setUserNotifications(user.id, notifications);
  }

  return NextResponse.json({ notifications });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const record = findUserById(user.id);
  if (!record) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let notifications: AppNotification[] = record.notifications;

  if (body.markAllRead) {
    notifications = notifications.map((n) => ({ ...n, read: true }));
  }

  if (body.dismissId) {
    notifications = notifications.filter((n) => n.id !== body.dismissId);
  }

  if (body.markReadId) {
    notifications = notifications.map((n) =>
      n.id === body.markReadId ? { ...n, read: true } : n,
    );
  }

  if (body.prefs) {
    updateUser(user.id, {
      notificationPrefs: { ...user.notificationPrefs, ...body.prefs } as NotificationPreferences,
    });
  }

  const updated = setUserNotifications(user.id, notifications);
  const freshUser = findUserById(user.id);
  const { notifications: _, ...safeUser } = freshUser!;

  return NextResponse.json({ notifications: updated, user: safeUser });
}
