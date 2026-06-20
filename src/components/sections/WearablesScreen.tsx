"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { usePermissions } from "@/hooks/usePermissions";
import { WEARABLE_PROVIDERS } from "@/lib/wearables";
import type { DbWearableDevice } from "@/lib/db/types";

export function WearablesScreen({ onBack }: { onBack: () => void }) {
  const { can, startCheckout } = usePermissions();
  const [devices, setDevices] = useState<DbWearableDevice[]>([]);
  const [limit, setLimit] = useState(0);
  const [syncing, setSyncing] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/wearables");
    const data = await res.json();
    setDevices(data.devices ?? []);
    setLimit(data.limit ?? 0);
  }

  useEffect(() => {
    if (can("wearable_sync")) load();
  }, [can]);

  async function connect(provider: string) {
    const res = await fetch("/api/wearables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, deviceName: WEARABLE_PROVIDERS.find((p) => p.id === provider)?.name }),
    });
    if (res.ok) load();
  }

  async function sync(deviceId: string) {
    setSyncing(deviceId);
    await fetch("/api/wearables/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
    setSyncing(null);
    load();
  }

  if (!can("wearable_sync")) {
    return (
      <AppShell className="bg-bg">
        <button type="button" onClick={onBack} className="mb-4 text-xs text-ink-faint">
          ← Back
        </button>
        <UpgradePrompt
          feature="Wearable sync"
          requiredTier="premium"
          onUpgrade={(t) => startCheckout(t)}
        />
      </AppShell>
    );
  }

  return (
    <AppShell className="bg-bg">
      <button type="button" onClick={onBack} className="mb-4 text-xs text-ink-faint">
        ← Back
      </button>
      <h1 className="font-serif text-2xl text-ink">Wearables</h1>
      <p className="mt-1 text-xs text-ink-mid">
        {devices.length}/{limit === Infinity ? "∞" : limit} devices connected
      </p>

      <div className="mt-5 space-y-2">
        {devices.map((d) => (
          <div key={d.id} className="flex items-center justify-between rounded-card bg-surface p-4 shadow-card">
            <div>
              <p className="text-sm font-medium text-ink">{d.deviceName ?? d.provider}</p>
              <p className="text-[10px] text-ink-faint">
                Last sync: {d.lastSyncAt ? new Date(d.lastSyncAt).toLocaleString() : "Never"}
              </p>
            </div>
            <button
              type="button"
              disabled={syncing === d.id}
              onClick={() => sync(d.id)}
              className="rounded-full bg-rose-deep px-3 py-1 text-[10px] text-white"
            >
              {syncing === d.id ? "…" : "Sync"}
            </button>
          </div>
        ))}
      </div>

      {(limit === Infinity || devices.length < limit) && (
        <div className="mt-5 space-y-2">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-ink-faint">
            Connect device
          </p>
          {WEARABLE_PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={!p.available}
              onClick={() => connect(p.id)}
              className="w-full rounded-card bg-surface p-3 text-left text-sm shadow-card disabled:opacity-40"
            >
              {p.name} {!p.available && "(coming soon)"}
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}
