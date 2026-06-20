import { getCyclePhase } from "@/lib/cycle";

export type NotificationType =
  | "period_reminder"
  | "wellness_tip"
  | "assessment_reminder"
  | "plan_expiry"
  | "cycle_insight"
  | "symptom_checkin"
  | "care_plan"
  | "doctor_awareness"
  | "learn_content"
  | "irregular_cycle"
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
  symptomCheckins: boolean;
  carePlanReminders: boolean;
  doctorAlerts: boolean;
  learnContent: boolean;
  browserPush: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  periodReminders: true,
  wellnessTips: true,
  assessmentReminders: true,
  planUpdates: true,
  cycleInsights: true,
  symptomCheckins: true,
  carePlanReminders: true,
  doctorAlerts: true,
  learnContent: true,
  browserPush: false,
};

export type CycleRegularity = "regular" | "irregular" | "absent" | "unknown";

export interface NotificationSyncContext {
  currentCycleDay: number;
  cycleLength: number;
  cycleRegularity: CycleRegularity;
  hasAssessment: boolean;
  showDoctorAlert: boolean;
  doctorReason?: string;
  primaryGoal: string;
  hasLoggedSymptomsToday: boolean;
  topTips: string[];
  suggestedLearnTopics: { id: string; name: string }[];
  subscriptionExpiresAt: string | null;
  subscriptionTier: string;
}

const WELLNESS_TIPS = [
  "Drink spearmint tea — it may help reduce androgen levels naturally.",
  "A 20-minute walk after meals can improve insulin sensitivity.",
  "Aim for 7–9 hours of sleep — it supports hormone balance.",
  "Include millets like bajra and jowar in your meals this week.",
  "Butterfly pose yoga can ease pelvic discomfort during your cycle.",
  "Pair carbs with protein to keep blood sugar steady.",
  "Magnesium-rich foods like spinach may ease PMS symptoms.",
  "Stress raises cortisol — try 5 minutes of deep breathing today.",
];

const PHASE_AWARENESS: Record<string, { title: string; body: string }> = {
  Menstruation: {
    title: "Menstruation phase",
    body: "Rest and replenish. Iron-rich foods like spinach and dates can support your body during bleeding.",
  },
  "Follicular Phase": {
    title: "Follicular phase rising",
    body: "Energy often builds now — a good window to start a gentle new habit or workout routine.",
  },
  Ovulation: {
    title: "Ovulation window",
    body: "You may feel more energetic. Listen to your body and avoid overtraining if you feel fatigued.",
  },
  "Luteal Phase": {
    title: "Luteal phase awareness",
    body: "Mood shifts and cravings are common with PCOS. Prioritise sleep and low-GI meals this week.",
  },
};

const IRREGULAR_CYCLE_TIPS = [
  "Irregular cycles are very common with PCOS. Log bleeding when it starts — patterns matter more than predictions.",
  "Focus on symptom patterns, not calendar predictions. Your logged data helps you and your doctor.",
  "Absent or skipped periods? Track other signs like mood, energy, and skin changes instead.",
];

const LEARN_NUDGES = [
  "Understanding insulin resistance can change how you manage PCOS day to day.",
  "Did you know PCOS affects more than fertility? Explore conditions in the Learn tab.",
  "Small lifestyle shifts often help more than extreme diets. Browse our PCOS guide.",
];

export function normalizeCycleRegularity(value: string | undefined): CycleRegularity {
  if (value === "regular" || value === "irregular" || value === "absent") return value;
  return "unknown";
}

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

import type { IconName } from "@/components/ui/icons";

export function getNotificationIcon(type: NotificationType): IconName {
  switch (type) {
    case "period_reminder":
      return "calendar";
    case "wellness_tip":
      return "heart";
    case "assessment_reminder":
      return "clipboard";
    case "plan_expiry":
      return "star";
    case "cycle_insight":
      return "flower";
    case "symptom_checkin":
      return "pencil";
    case "care_plan":
      return "heart";
    case "doctor_awareness":
      return "shield";
    case "learn_content":
      return "book";
    case "irregular_cycle":
      return "refresh";
    default:
      return "bell";
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

function weekKey(): string {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

/** Generate PCOS-aware in-app awareness notifications from current app state. */
export function generateSmartNotifications(input: {
  context: NotificationSyncContext;
  existingIds: Set<string>;
  prefs: NotificationPreferences;
}): AppNotification[] {
  const { context, existingIds, prefs } = input;
  const generated: AppNotification[] = [];
  const today = new Date().toISOString().slice(0, 10);
  const phase = getCyclePhase(context.currentCycleDay);
  const isIrregular =
    context.cycleRegularity === "irregular" || context.cycleRegularity === "absent";
  const fertilityGoal = context.primaryGoal === "fertility";

  const push = (n: Omit<AppNotification, "createdAt" | "read"> & { id?: string }) => {
    const id = n.id ?? crypto.randomUUID();
    if (!existingIds.has(id)) {
      generated.push(createNotification({ ...n, id }));
    }
  };

  // Phase-based cycle awareness
  if (prefs.cycleInsights) {
    const phaseInfo = PHASE_AWARENESS[phase.name];
    if (phaseInfo) {
      const skipOvulation =
        phase.name === "Ovulation" && isIrregular && !fertilityGoal;
      if (!skipOvulation) {
        push({
          id: `phase-${phase.name}-${today}`,
          type: "cycle_insight",
          title: phaseInfo.title,
          body: phaseInfo.body,
          actionScreen: "cycle",
        });
      }
    }
  }

  // Period reminders — only for relatively regular cycles
  if (prefs.periodReminders && context.cycleRegularity === "regular") {
    const daysUntilEnd = context.cycleLength - context.currentCycleDay;
    if (daysUntilEnd <= 3 && daysUntilEnd >= 0) {
      push({
        id: `period-${today}`,
        type: "period_reminder",
        title: "Period may be approaching",
        body: `You're on day ${context.currentCycleDay} of ~${context.cycleLength}. Rest more and keep essentials handy.`,
        actionScreen: "cycle",
      });
    }
  }

  // Irregular / absent cycle awareness (no prediction)
  if (prefs.cycleInsights && isIrregular) {
    const tip = IRREGULAR_CYCLE_TIPS[new Date().getDate() % IRREGULAR_CYCLE_TIPS.length];
    push({
      id: `irregular-${today}`,
      type: "irregular_cycle",
      title: "Cycle awareness",
      body: tip,
      actionScreen: "cycle",
    });

    if (
      context.cycleRegularity === "absent" &&
      context.currentCycleDay > context.cycleLength + 7
    ) {
      push({
        id: `absent-cycle-${weekKey()}`,
        type: "irregular_cycle",
        title: "Track your signs",
        body: "No recent period logged. Note mood, energy, and skin changes — they still matter for PCOS care.",
        actionScreen: "cycle",
      });
    }
  }

  // Daily symptom check-in
  if (prefs.symptomCheckins && !context.hasLoggedSymptomsToday) {
    push({
      id: `symptom-${today}`,
      type: "symptom_checkin",
      title: "How are you feeling today?",
      body: "A quick symptom log helps spot patterns over time — especially with irregular cycles.",
      actionScreen: "home",
    });
  }

  // Care plan tip from assessment
  if (prefs.carePlanReminders && context.hasAssessment && context.topTips.length > 0) {
    const tip = context.topTips[new Date().getDate() % context.topTips.length];
    push({
      id: `careplan-${today}`,
      type: "care_plan",
      title: "Your care focus today",
      body: tip,
      actionScreen: "careplan",
    });
  }

  // Doctor awareness follow-up
  if (prefs.doctorAlerts && context.showDoctorAlert) {
    push({
      id: `doctor-${weekKey()}`,
      type: "doctor_awareness",
      title: "Consider speaking with a doctor",
      body:
        context.doctorReason ??
        "Your health profile suggests symptoms worth discussing with a gynaecologist or endocrinologist.",
      actionScreen: "assessment",
    });
  }

  // Learn content nudge
  if (prefs.learnContent) {
    if (context.suggestedLearnTopics.length > 0) {
      const topic =
        context.suggestedLearnTopics[new Date().getDate() % context.suggestedLearnTopics.length];
      push({
        id: `learn-topic-${topic.id}-${weekKey()}`,
        type: "learn_content",
        title: "Recommended reading",
        body: `Explore "${topic.name}" in the Learn tab — tailored to your health profile.`,
        actionScreen: "learn",
      });
    } else {
      const nudge = LEARN_NUDGES[new Date().getDate() % LEARN_NUDGES.length];
      push({
        id: `learn-general-${weekKey()}`,
        type: "learn_content",
        title: "PCOS awareness",
        body: nudge,
        actionScreen: "learn",
      });
    }
  }

  // Assessment reminder
  if (prefs.assessmentReminders && !context.hasAssessment) {
    push({
      id: "assessment-pending",
      type: "assessment_reminder",
      title: "Complete your health assessment",
      body: "Take the intake questionnaire to get personalised PCOS care recommendations.",
      actionScreen: "assessment",
    });
  }

  // Daily wellness tip
  if (prefs.wellnessTips) {
    const tip = WELLNESS_TIPS[new Date().getDate() % WELLNESS_TIPS.length];
    push({
      id: `tip-${today}`,
      type: "wellness_tip",
      title: "Today's wellness tip",
      body: tip,
      actionScreen: "wellness",
    });
  }

  // Subscription expiry
  if (
    prefs.planUpdates &&
    context.subscriptionExpiresAt &&
    context.subscriptionTier !== "free"
  ) {
    const daysLeft = Math.ceil(
      (new Date(context.subscriptionExpiresAt).getTime() - Date.now()) / 86400000,
    );
    if (daysLeft <= 7 && daysLeft > 0) {
      push({
        id: `plan-expiry-${daysLeft}`,
        type: "plan_expiry",
        title: "Plan expiring soon",
        body: `Your ${context.subscriptionTier} plan expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Renew to keep premium features.`,
        actionScreen: "profile",
      });
    }
  }

  return generated;
}

/** Build sync context from app state (client-side). */
export function buildNotificationContext(input: {
  currentCycleDay: number;
  cycleLength: number;
  cycleRegularity?: string;
  hasAssessment: boolean;
  assessmentResult: {
    showDoctorAlert: boolean;
    doctorReason?: string;
    topTips: string[];
    suggestedLearnTopics: { id: string; name: string }[];
  } | null;
  primaryGoal?: string;
  lastSymptomSaveDate?: string;
  subscriptionExpiresAt?: string | null;
  subscriptionTier?: string;
}): NotificationSyncContext {
  const today = new Date().toISOString().slice(0, 10);
  return {
    currentCycleDay: input.currentCycleDay,
    cycleLength: input.cycleLength,
    cycleRegularity: normalizeCycleRegularity(input.cycleRegularity),
    hasAssessment: input.hasAssessment,
    showDoctorAlert: input.assessmentResult?.showDoctorAlert ?? false,
    doctorReason: input.assessmentResult?.doctorReason,
    primaryGoal: input.primaryGoal ?? "",
    hasLoggedSymptomsToday: input.lastSymptomSaveDate === today,
    topTips: input.assessmentResult?.topTips ?? [],
    suggestedLearnTopics: input.assessmentResult?.suggestedLearnTopics ?? [],
    subscriptionExpiresAt: input.subscriptionExpiresAt ?? null,
    subscriptionTier: input.subscriptionTier ?? "free",
  };
}
