"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import type { SubscriptionTier } from "@/lib/subscription/types";

interface DevPlanPreviewContextValue {
  enabled: boolean;
  previewTier: SubscriptionTier | null;
  setPreviewTier: (tier: SubscriptionTier | null) => void;
  isPreviewActive: boolean;
  routePreview: boolean;
}

const DevPlanPreviewContext = createContext<DevPlanPreviewContextValue | null>(null);

interface DevPlanPreviewProviderProps {
  children: ReactNode;
  initialTier?: SubscriptionTier;
  routePreview?: boolean;
}

export function DevPlanPreviewProvider({
  children,
  initialTier,
  routePreview = false,
}: DevPlanPreviewProviderProps) {
  const [previewTier, setPreviewTierState] = useState<SubscriptionTier | null>(
    routePreview && initialTier ? initialTier : null,
  );

  const setPreviewTier = useCallback(
    (tier: SubscriptionTier | null) => {
      if (routePreview) return;
      setPreviewTierState(tier);
    },
    [routePreview],
  );

  const isPreviewActive = routePreview || previewTier !== null;
  const effectivePreviewTier =
    routePreview && initialTier ? initialTier : previewTier;

  const value = useMemo(
    () => ({
      enabled: !routePreview,
      previewTier: effectivePreviewTier,
      setPreviewTier,
      isPreviewActive,
      routePreview,
    }),
    [effectivePreviewTier, setPreviewTier, isPreviewActive, routePreview],
  );

  return (
    <DevPlanPreviewContext.Provider value={value}>{children}</DevPlanPreviewContext.Provider>
  );
}

export function useDevPlanPreview() {
  const ctx = useContext(DevPlanPreviewContext);
  if (!ctx) {
    return {
      enabled: false,
      previewTier: null,
      setPreviewTier: () => {},
      isPreviewActive: false,
      routePreview: false,
    };
  }
  return ctx;
}
