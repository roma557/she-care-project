import type { PlanInfo, SubscriptionTier } from "@/lib/subscription/types";

export const PLANS: Record<Exclude<SubscriptionTier, "free">, PlanInfo> = {
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "For casual users — some AI help",
    monthlyPrice: 49,
    annualPrice: 490,
    color: "bg-plan-starter-light",
    limits: [
      "AI Coach: 30 messages/month",
      "AI Insights: 10/month",
      "Monthly Wellness Report: 1",
      "Data History: 6 months",
      "Fertility Predictions: Basic",
      "Cycle Analytics: Basic",
    ],
    features: [
      "Period Tracking",
      "Symptom Tracking",
      "Mood Tracking",
      "Sleep Tracking",
      "Water Tracking",
      "Weight Tracking",
    ],
  },
  plus: {
    id: "plus",
    name: "Plus",
    tagline: "For active users — serious tracking & predictions",
    monthlyPrice: 99,
    annualPrice: 990,
    color: "bg-plan-plus-light",
    limits: [
      "AI Coach: 200 messages/month",
      "AI Insights: 50/month",
      "Reports: Weekly + Monthly",
      "Data History: 3 years",
    ],
    features: [
      "Everything in Starter",
      "Fertility Window Prediction",
      "Ovulation Prediction",
      "Cycle Trend Analysis",
      "Symptom Pattern Detection",
      "Mood Correlation Analysis",
      "Early PMS Detection",
      "Basic PCOS Monitoring",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    tagline: "For power users — complete wellness assistant",
    monthlyPrice: 249,
    annualPrice: 2490,
    color: "bg-plan-premium-light",
    limits: [
      "Unlimited AI Coach",
      "Unlimited AI Insights",
      "Unlimited Reports",
      "Unlimited Data History",
      "Unlimited Wearables",
    ],
    features: [
      "Everything in Plus",
      "Wearable Sync",
      "Advanced Hormonal Health Insights",
      "Advanced Fertility Analysis",
      "Pregnancy Mode",
      "PCOS Analytics Dashboard",
      "Personalized Wellness Plans",
      "Partner Access",
      "PDF Report Export",
      "Doctor Report Export",
      "Priority Support",
      "Early Access Features",
    ],
  },
};

export const PAID_TIERS = ["starter", "plus", "premium"] as const;

/** Paid tiers exposed at /starter, /plus, /premium plan preview routes. */
export const PLAN_ROUTE_TIERS = PAID_TIERS;

export type PaidTier = (typeof PAID_TIERS)[number];
