"use client";

import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppState } from "@/context/AppStateContext";
import { dispatchAppRefresh, pullCloudSyncIfNewer } from "@/lib/sync-pull";

export function useAppRefresh() {
  const { refreshUser, isAuthenticated } = useAuth();
  const { rehydrateFromStorage } = useAppState();

  const refresh = useCallback(async () => {
    await refreshUser();

    if (isAuthenticated) {
      await pullCloudSyncIfNewer();
    }

    rehydrateFromStorage();
    dispatchAppRefresh();
  }, [refreshUser, isAuthenticated, rehydrateFromStorage]);

  return { refresh };
}
