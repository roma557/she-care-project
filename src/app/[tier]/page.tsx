import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanDashboardPage } from "@/components/plans/PlanDashboardPage";
import { PAID_TIERS, type PaidTier } from "@/lib/subscription/plans";
import { getPlanPreviewInfo } from "@/lib/subscription/plan-preview";

function isPaidTier(value: string): value is PaidTier {
  return PAID_TIERS.includes(value as PaidTier);
}

export function generateStaticParams() {
  return PAID_TIERS.map((tier) => ({ tier }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tier: string }>;
}): Promise<Metadata> {
  const { tier } = await params;

  if (!isPaidTier(tier)) {
    return { title: "Not Found — She Care" };
  }

  const info = getPlanPreviewInfo(tier);
  return {
    title: `${info.name} Plan Preview — She Care`,
    description: info.tagline,
  };
}

export default async function PlanRoutePage({
  params,
}: {
  params: Promise<{ tier: string }>;
}) {
  const { tier } = await params;

  if (!isPaidTier(tier)) {
    notFound();
  }

  return <PlanDashboardPage tier={tier} />;
}
