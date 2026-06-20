import type { AppSyncPayload } from "@/lib/sync-types";
import { SYNC_STORAGE_KEY } from "@/lib/sync-types";
import { loadJSON, saveJSON } from "@/lib/storage";

/** Pull remote sync payload and apply locally when newer than last sync. */
export async function pullCloudSyncIfNewer(): Promise<boolean> {
  try {
    const res = await fetch("/api/sync");
    if (!res.ok) return false;

    const json = await res.json();
    if (!json?.data) return false;

    const remote = json.data as AppSyncPayload;
    const localUpdated = loadJSON<string | null>(SYNC_STORAGE_KEY, null);

    if (localUpdated && remote.updatedAt <= localUpdated) return false;

    saveJSON("profile", remote.profile);
    saveJSON("cycle", remote.cycle);
    saveJSON("assessment-result", remote.assessmentResult);
    if (remote.lastSymptomSaveDate) {
      saveJSON("last-symptom-save", remote.lastSymptomSaveDate);
    }
    if (remote.insights) {
      saveJSON("insights", remote.insights);
    }
    saveJSON(SYNC_STORAGE_KEY, remote.updatedAt);
    return true;
  } catch {
    return false;
  }
}

export const APP_REFRESH_EVENT = "shecare-refresh";

export function dispatchAppRefresh(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(APP_REFRESH_EVENT));
  }
}
