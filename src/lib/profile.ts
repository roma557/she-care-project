export interface UserProfile {
  name: string;
  onboardingComplete: boolean;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  onboardingComplete: false,
};

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
