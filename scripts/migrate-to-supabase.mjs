/**
 * Backfill users from data/users.json into Supabase.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: node scripts/migrate-to-supabase.mjs
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const LEGACY_MAP = { rozana: "starter", sampoorna: "plus", sakhi: "premium" };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_URL and SUPABASE_SECRET_KEY)");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const DB_PATH = join(process.cwd(), "data", "users.json");

if (!existsSync(DB_PATH)) {
  console.log("No users.json — nothing to migrate.");
  process.exit(0);
}

const db = JSON.parse(readFileSync(DB_PATH, "utf-8"));
let usersMigrated = 0;
let subsMigrated = 0;

for (const user of Object.values(db.users ?? {})) {
  const tier = LEGACY_MAP[user.subscription?.tier] ?? user.subscription?.tier ?? "free";
  if (user.subscription?.tier in LEGACY_MAP) {
    user.subscription.tier = tier;
  }

  const { error: userError } = await supabase.from("users").upsert(
    {
      id: user.id,
      phone: user.phone,
      name: user.name,
      created_at: user.createdAt,
      notification_prefs: user.notificationPrefs ?? {},
      ai_questions_used: user.aiQuestionsUsed ?? 0,
      ai_questions_reset_at: user.aiQuestionsResetAt ?? new Date().toISOString(),
      notifications: user.notifications ?? [],
      app_data: user.appData ?? null,
    },
    { onConflict: "id" },
  );
  if (userError) {
    console.error(`User ${user.id}:`, userError.message);
    continue;
  }
  usersMigrated++;

  if (user.subscription?.tier !== "free" && user.subscription?.expiresAt) {
    const { error: subError } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      tier,
      status: new Date(user.subscription.expiresAt) > new Date() ? "active" : "expired",
      billing_interval: "month",
      current_period_start: user.subscription.startedAt,
      current_period_end: user.subscription.expiresAt,
      provider: "demo",
    });
    if (!subError) subsMigrated++;
  }
}

console.log(`Migrated ${usersMigrated} users and ${subsMigrated} subscriptions to Supabase.`);
