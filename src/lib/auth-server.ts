import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  AuthUser,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  SessionPayload,
  createDefaultUser,
  getNextMonthReset,
} from "@/lib/auth-types";
import {
  findUserByIdAsync,
  findUserByPhoneAsync,
  hydrateUserSubscription,
  upsertUserAsync,
  userHasPasswordAsync,
} from "@/lib/db";
import type { UserRecord } from "@/lib/db/types";
import { getEffectiveTier } from "@/lib/subscription";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-in-production-her-wellness";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.userId || !payload.phone) return null;
    return { userId: String(payload.userId), phone: String(payload.phone) };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

function stripUserRecord(record: UserRecord): AuthUser {
  const { notifications: _, passwordHash: __, appData: ___, ...user } = record;
  return user;
}

export async function buildAuthUserResponse(record: UserRecord): Promise<AuthUser> {
  const hydrated = await hydrateUserSubscription(record);
  const hasPassword = await userHasPasswordAsync(hydrated.id);
  const isPaid = getEffectiveTier(hydrated.subscription) !== "free";
  const user = stripUserRecord(hydrated);
  return {
    ...user,
    hasPassword,
    needsPasswordSetup: isPaid && !hasPassword,
  };
}

export async function finalizeLogin(
  phone: string,
  name: string,
  fallbackName?: string,
): Promise<AuthUser> {
  let user = await findUserByPhoneAsync(phone);
  if (!user) {
    const displayName = name || fallbackName || "Friend";
    user = await upsertUserAsync(createDefaultUser(phone, displayName));
  } else if (name && name !== user.name) {
    user = await upsertUserAsync({ ...stripUserRecord(user), name });
  }

  if (new Date(user.aiQuestionsResetAt) <= new Date()) {
    user = await upsertUserAsync({
      ...stripUserRecord(user),
      aiQuestionsUsed: 0,
      aiQuestionsResetAt: getNextMonthReset(),
    });
  }

  const token = await createSessionToken({ userId: user.id, phone: user.phone });
  await setSessionCookie(token);

  return buildAuthUserResponse(user);
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const record = await findUserByIdAsync(payload.userId);
  if (!record) return null;
  return buildAuthUserResponse(record);
}

export async function requireSessionUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
