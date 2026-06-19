export type NotificationType =
  | "period_reminder"
  | "wellness_tip"
  | "assessment_reminder"
  | "plan_expiry"
  | "cycle_insight"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  actionScreen?: string;
}

export interface NotificationPreferences {
  periodReminders: boolean;
  wellnessTips: boolean;
  assessmentReminders: boolean;
  planUpdates: boolean;
  cycleInsights: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  periodReminders: true,
  wellnessTips: true,
  assessmentReminders: true,
  planUpdates: true,
  cycleInsights: true,
};

const WELLNESS_TIPS = [
  "Drink spearmint tea — it may help reduce androgen levels naturally.",
  "A 20-minute walk after meals can improve insulin sensitivity.",
  "Aim for 7–9 hours of sleep — it supports hormone balance.",
  "Include millets like bajra and jowar in your meals this week.",
  "Butterfly pose yoga can ease pelvic discomfort during your cycle.",
  "Pair carbs with protein to keep blood sugar steady.",
];

export function createNotification(
  partial: Omit<AppNotification, "id" | "createdAt" | "read"> & { id?: string },
): AppNotification {
  return {
    id: partial.id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
    ...partial,
  };
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "period_reminder":
      return "📅";
    case "wellness_tip":
      return "💜";
    case "assessment_reminder":
      return "📋";
    case "plan_expiry":
      return "⭐";
    case "cycle_insight":
      return "🌸";
    default:
      return "🔔";
  }
}

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Generate contextual notifications based on app state */
export function generateSmartNotifications(input: {
  currentCycleDay: number;
  hasAssessment: boolean;
  subscriptionExpiresAt: string | null;
  subscriptionTier: string;
  existingIds: Set<string>;
  prefs: NotificationPreferences;
}): AppNotification[] {
  const generated: AppNotification[] = [];
  const today = new Date().toISOString().slice(0, 10);

  if (input.prefs.periodReminders && input.currentCycleDay >= 26) {
    const id = `period-${today}`;
    if (!input.existingIds.has(id)) {
      generated.push(
        createNotification({
          id,
          type: "period_reminder",
          title: "Period may be approaching",
          body: `You're on day ${input.currentCycleDay}. Consider stocking up on essentials and resting more.`,
          actionScreen: "cycle",
        }),
      );
    }
  }

  if (input.prefs.cycleInsights && input.currentCycleDay >= 12 && input.currentCycleDay <= 16) {
    const id = `ovulation-${today}`;
    if (!input.existingIds.has(id)) {
      generated.push(
        createNotification({
          id,
          type: "cycle_insight",
          title: "Fertile window insight",
          body: "You're in your ovulation phase. Energy may be higher — great time for strength training!",
          actionScreen: "cycle",
        }),
      );
    }
  }

  if (input.prefs.assessmentReminders && !input.hasAssessment) {
    const id = "assessment-pending";
    if (!input.existingIds.has(id)) {
      generated.push(
        createNotification({
          id,
          type: "assessment_reminder",
          title: "Complete your health assessment",
          body: "Take the 9-question PCOS profile to get personalised care recommendations.",
          actionScreen: "assessment",
        }),
      );
    }
  }

  if (input.prefs.wellnessTips) {
    const id = `tip-${today}`;
    if (!input.existingIds.has(id)) {
      const tip = WELLNESS_TIPS[new Date().getDate() % WELLNESS_TIPS.length];
      generated.push(
        createNotification({
          id,
          type: "wellness_tip",
          title: "Today's wellness tip",
          body: tip,
          actionScreen: "wellness",
        }),
      );
    }
  }

  if (
    input.prefs.planUpdates &&
    input.subscriptionExpiresAt &&
    input.subscriptionTier !== "free"
  ) {
    const daysLeft = Math.ceil(
      (new Date(input.subscriptionExpiresAt).getTime() - Date.now()) / 86400000,
    );
    if (daysLeft <= 7 && daysLeft > 0) {
      const id = `plan-expiry-${daysLeft}`;
      if (!input.existingIds.has(id)) {
        generated.push(
          createNotification({
            id,
            type: "plan_expiry",
            title: "Plan expiring soon",
            body: `Your ${input.subscriptionTier} plan expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Renew to keep premium features.`,
            actionScreen: "profile",
          }),
        );
      }
    }
  }

  return generated;
}
