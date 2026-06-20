import type { Feature } from "@/lib/permissions/features";
import { requiredTierLabel } from "@/lib/permissions/features";

/** Screens / actions not yet built — always disabled with a lock icon. */
export const COMING_SOON: Record<string, { label: string }> = {
  privacy: { label: "Privacy settings" },
};

export function isComingSoon(id: string): boolean {
  return id in COMING_SOON;
}

export function comingSoonLabel(id: string): string {
  return COMING_SOON[id]?.label ?? "Coming soon";
}

export function tierLockDesc(feature: Feature): string {
  return `Requires ${requiredTierLabel(feature)} plan`;
}
