import type { AssessmentResult } from "@/lib/assessment";
import type { CycleState } from "@/lib/cycle";
import type { UserProfile } from "@/lib/profile";

export interface AppSyncPayload {
  profile: UserProfile;
  cycle: CycleState;
  assessmentResult: AssessmentResult | null;
  lastSymptomSaveDate: string | null;
  updatedAt: string;
}

export const SYNC_STORAGE_KEY = "last-sync-at";
