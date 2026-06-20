import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import {
  findUserByIdAsync,
  setUserNotificationsAsync,
  updateUserAsync,
} from "@/lib/db";
import {
  generateSmartNotifications,
  AppNotification,
  NotificationPreferences,
  NotificationSyncContext,
  DEFAULT_NOTIFICATION_PREFS,
} from "@/lib/notifications";
import { getEffectiveTier } from "@/lib/subscription";

function parseContext(
  searchParams: URLSearchParams,
  userTier: string,
  userExpiresAt: string | null,
): NotificationSyncContext {
  const topTipsRaw = searchParams.get("topTips");
  const learnRaw = searchParams.get("learnTopics");

  return {
    currentCycleDay: Number(searchParams.get("cycleDay") ?? "1"),
    cycleLength: Number(searchParams.get("cycleLength") ?? "28"),
    cycleRegularity: (searchParams.get("cycleRegularity") ?? "unknown") as NotificationSyncContext["cycleRegularity"],
    hasAssessment: searchParams.get("hasAssessment") === "true",
    showDoctorAlert: searchParams.get("showDoctorAlert") === "true",
    doctorReason: searchParams.get("doctorReason") ?? undefined,
    primaryGoal: searchParams.get("primaryGoal") ?? "",
    hasLoggedSymptomsToday: searchParams.get("hasLoggedSymptomsToday") === "true",
    topTips: topTipsRaw ? (JSON.parse(topTipsRaw) as string[]) : [],
    suggestedLearnTopics: learnRaw
      ? (JSON.parse(learnRaw) as { id: string; name: string }[])
      : [],
    subscriptionExpiresAt: userExpiresAt,
    subscriptionTier: userTier,
  };
}

function mergePrefs(prefs: Partial<NotificationPreferences> | undefined): NotificationPreferences {
  return { ...DEFAULT_NOTIFICATION_PREFS, ...prefs };
}

async function syncForUser(
  userId: string,
  context: NotificationSyncContext,
  prefs: NotificationPreferences,
): Promise<AppNotification[]> {
  const record = await findUserByIdAsync(userId);
  if (!record) return [];

  const existingIds = new Set(record.notifications.map((n) => n.id));
  const newOnes = generateSmartNotifications({ context, existingIds, prefs });

  if (newOnes.length === 0) return record.notifications;

  const notifications = [...newOnes, ...record.notifications].slice(0, 50);
  await setUserNotificationsAsync(userId, notifications);
  return notifications;
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const context = parseContext(
    searchParams,
    getEffectiveTier(user.subscription),
    user.subscription.expiresAt,
  );

  const record = await findUserByIdAsync(user.id);
  if (!record) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const notifications = await syncForUser(
    user.id,
    context,
    mergePrefs(user.notificationPrefs),
  );

  return NextResponse.json({ notifications });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const context = body.context as NotificationSyncContext;
  if (!context) {
    return NextResponse.json({ error: "Missing context" }, { status: 400 });
  }

  const record = await findUserByIdAsync(user.id);
  if (!record) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  context.subscriptionTier = getEffectiveTier(user.subscription);
  context.subscriptionExpiresAt = user.subscription.expiresAt;

  const notifications = await syncForUser(
    user.id,
    context,
    mergePrefs(user.notificationPrefs),
  );

  return NextResponse.json({ notifications });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const record = await findUserByIdAsync(user.id);
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
    await updateUserAsync(user.id, {
      notificationPrefs: mergePrefs({ ...user.notificationPrefs, ...body.prefs }),
    });
  }

  const updated = await setUserNotificationsAsync(user.id, notifications);
  const freshUser = await findUserByIdAsync(user.id);
  const { notifications: _, ...safeUser } = freshUser!;

  return NextResponse.json({ notifications: updated, user: safeUser });
}
