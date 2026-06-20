export interface WearableSyncResult {
  steps: number;
  sleepHours: number;
  heartRateAvg: number;
  syncedAt: string;
}

/** Demo wearable provider — replace with Google Fit OAuth in production */
export async function syncDemoWearable(_accessToken?: string): Promise<WearableSyncResult> {
  return {
    steps: Math.floor(4000 + Math.random() * 6000),
    sleepHours: Math.round((6 + Math.random() * 2.5) * 10) / 10,
    heartRateAvg: Math.floor(65 + Math.random() * 20),
    syncedAt: new Date().toISOString(),
  };
}

export const WEARABLE_PROVIDERS = [
  { id: "google_fit", name: "Google Fit", available: true },
  { id: "apple_health", name: "Apple Health", available: false },
  { id: "fitbit", name: "Fitbit", available: false },
] as const;
