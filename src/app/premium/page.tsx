import type { Metadata } from "next";
import { PlanDashboardPage } from "@/components/plans/PlanDashboardPage";

export const metadata: Metadata = {
  title: "Premium Experience — She Care",
  description:
    "Preview every premium feature — AI coaching, advanced analytics, pregnancy mode, and more.",
};

/**
 * /premium — A route that renders the app with ALL features unlocked.
 * The `PlanDashboardPage` wraps its children in a `DevPlanPreviewProvider`
 * with `initialTier="premium"` and `routePreview=true`, which forces
 * `usePermissions().can(feature)` to always return true.
 *
 * Server-side API endpoints independently verify the session JWT,
 * so this route cannot bypass metered usage limits (AI messages, reports).
 */
export default function PremiumPage() {
  return <PlanDashboardPage tier="premium" />;
}
