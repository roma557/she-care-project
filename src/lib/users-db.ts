import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { AuthUser } from "@/lib/auth-types";
import { AppNotification } from "@/lib/notifications";

interface UserRecord extends AuthUser {
  notifications: AppNotification[];
}

interface Database {
  users: Record<string, UserRecord>;
  otps: Record<string, { code: string; expiresAt: number; name?: string }>;
}

const DATA_DIR = join(process.cwd(), "data");
const DB_PATH = join(DATA_DIR, "users.json");

function ensureDb(): Database {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) {
    const empty: Database = { users: {}, otps: {} };
    writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  return JSON.parse(readFileSync(DB_PATH, "utf-8")) as Database;
}

function saveDb(db: Database): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function findUserByPhone(phone: string): UserRecord | null {
  const db = ensureDb();
  return Object.values(db.users).find((u) => u.phone === phone) ?? null;
}

export function findUserById(id: string): UserRecord | null {
  const db = ensureDb();
  return db.users[id] ?? null;
}

export function upsertUser(user: AuthUser): UserRecord {
  const db = ensureDb();
  const existing = db.users[user.id];
  const record: UserRecord = {
    ...user,
    notifications: existing?.notifications ?? [],
  };
  db.users[user.id] = record;
  saveDb(db);
  return record;
}

export function updateUser(id: string, patch: Partial<UserRecord>): UserRecord | null {
  const db = ensureDb();
  const user = db.users[id];
  if (!user) return null;
  db.users[id] = { ...user, ...patch };
  saveDb(db);
  return db.users[id];
}

export function storeOtp(phone: string, code: string, name?: string): void {
  const db = ensureDb();
  db.otps[phone] = { code, expiresAt: Date.now() + 5 * 60 * 1000, name };
  saveDb(db);
}

export function verifyOtp(phone: string, code: string): { valid: boolean; name?: string } {
  const db = ensureDb();
  const entry = db.otps[phone];
  if (!entry) return { valid: false };
  if (Date.now() > entry.expiresAt) {
    delete db.otps[phone];
    saveDb(db);
    return { valid: false };
  }
  if (entry.code !== code) return { valid: false };
  const name = entry.name;
  delete db.otps[phone];
  saveDb(db);
  return { valid: true, name };
}

export function getUserNotifications(userId: string): AppNotification[] {
  const user = findUserById(userId);
  return user?.notifications ?? [];
}

export function setUserNotifications(userId: string, notifications: AppNotification[]): AppNotification[] {
  const updated = updateUser(userId, { notifications });
  return updated?.notifications ?? [];
}
