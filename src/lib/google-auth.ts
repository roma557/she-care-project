export interface GoogleTokenPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

function getGoogleClientId(): string | undefined {
  return process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(getGoogleClientId());
}

/** Verify a Google Identity Services ID token. */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenPayload> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error("Google sign-in is not configured");
  }

  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );
  if (!res.ok) {
    throw new Error("Invalid Google sign-in token");
  }

  const data = (await res.json()) as Record<string, string>;
  if (data.aud !== clientId) {
    throw new Error("Google token audience mismatch");
  }
  if (data.email_verified !== "true") {
    throw new Error("Google email is not verified");
  }
  if (!data.email) {
    throw new Error("Google account has no email");
  }

  return {
    email: data.email,
    name: data.name ?? data.email.split("@")[0] ?? "Friend",
    picture: data.picture,
    sub: data.sub,
  };
}
