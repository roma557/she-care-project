"use client";

import { PhoneApp } from "@/components/app/PhoneApp";
import type { PaidTier } from "@/lib/subscription/plans";

interface PlanDashboardPageProps {
  tier: PaidTier;
}

export function PlanDashboardPage({ tier }: PlanDashboardPageProps) {
  return <PhoneApp routePreviewTier={tier} />;
}
