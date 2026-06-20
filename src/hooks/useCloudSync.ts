"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppState } from "@/context/AppStateContext";
import type { AppSyncPayload } from "@/lib/sync-types";
import { saveJSON, loadJSON } from "@/lib/storage";
import { SYNC_STORAGE_KEY } from "@/lib/sync-types";

const DEBOUNCE_MS = 2000;

export function useCloudSync() {
  const { user, isAuthenticated } = useAuth();
  const {
    hydrated,
    profile,
    cycle,
    assessmentResult,
    lastSymptomSaveDate,
  } = useAppState();

  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulledForUser = useRef<string | null>(null);

  // Pull cloud data on login
  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user) return;
    if (pulledForUser.current === user.id) return;
    pulledForUser.current = user.id;

    fetch("/api/sync")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.data) return;
        const remote = json.data as AppSyncPayload;
        const localUpdated = loadJSON<string | null>(SYNC_STORAGE_KEY, null);

        if (!localUpdated || remote.updatedAt > localUpdated) {
          saveJSON("profile", remote.profile);
          saveJSON("cycle", remote.cycle);
          saveJSON("assessment-result", remote.assessmentResult);
          if (remote.lastSymptomSaveDate) {
            saveJSON("last-symptom-save", remote.lastSymptomSaveDate);
          }
          saveJSON(SYNC_STORAGE_KEY, remote.updatedAt);
          window.location.reload();
        }
      })
      .catch(() => {});
  }, [hydrated, isAuthenticated, user]);

  // Push local changes when logged in
  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user || !profile.onboardingComplete) return;

    if (pushTimer.current) clearTimeout(pushTimer.current);

    pushTimer.current = setTimeout(() => {
      const payload: AppSyncPayload = {
        profile,
        cycle,
        assessmentResult,
        lastSymptomSaveDate,
        updatedAt: new Date().toISOString(),
      };

      fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json?.data?.updatedAt) {
            saveJSON(SYNC_STORAGE_KEY, json.data.updatedAt);
          }
        })
        .catch(() => {});
    }, DEBOUNCE_MS);

    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [
    hydrated,
    isAuthenticated,
    user,
    profile,
    cycle,
    assessmentResult,
    lastSymptomSaveDate,
  ]);
}
