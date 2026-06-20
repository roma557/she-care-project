/**
 * Migrate legacy tier IDs in users.json and backfill subscriptions table.
 * Run: node scripts/migrate-subscriptions.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const LEGACY_MAP = {
  rozana: "starter",
  sampoorna: "plus",
  sakhi: "premium",
};

const DB_PATH = join(process.cwd(), "data", "users.json");

if (!existsSync(DB_PATH)) {
  console.log("No users.json found — nothing to migrate.");
  process.exit(0);
}

const db = JSON.parse(readFileSync(DB_PATH, "utf-8"));
let migrated = 0;

for (const user of Object.values(db.users ?? {})) {
  const sub = user.subscription;
  if (!sub) continue;
  const oldTier = sub.tier;
  if (oldTier in LEGACY_MAP) {
    sub.tier = LEGACY_MAP[oldTier];
    migrated++;
  }
  if (sub.tier !== "free" && sub.expiresAt) {
    if (!db.subscriptions) db.subscriptions = {};
    if (!db.subscriptions[user.id]) {
      db.subscriptions[user.id] = [
        {
          id: crypto.randomUUID(),
          userId: user.id,
          tier: sub.tier,
          status: new Date(sub.expiresAt) > new Date() ? "active" : "expired",
          billingInterval: "month",
          currentPeriodStart: sub.startedAt,
          currentPeriodEnd: sub.expiresAt,
          provider: "demo",
          providerSubscriptionId: null,
          cancelAtPeriodEnd: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  }
}

writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
console.log(`Migrated ${migrated} user tier IDs. Subscriptions backfilled.`);
