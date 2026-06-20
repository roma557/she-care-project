"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { usePermissions } from "@/hooks/usePermissions";
import type { DbPartnerInvite } from "@/lib/db/types";

export function PartnerScreen({ onBack }: { onBack: () => void }) {
  const { can, startCheckout } = usePermissions();
  const [phone, setPhone] = useState("");
  const [invites, setInvites] = useState<DbPartnerInvite[]>([]);
  const [sending, setSending] = useState(false);

  async function load() {
    const res = await fetch("/api/partners");
    const data = await res.json();
    setInvites(data.invites ?? []);
  }

  useEffect(() => {
    if (can("partner_access")) load();
  }, [can]);

  async function invite() {
    setSending(true);
    await fetch("/api/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setSending(false);
    setPhone("");
    load();
  }

  if (!can("partner_access")) {
    return (
      <AppShell className="bg-bg">
        <button type="button" onClick={onBack} className="mb-4 text-xs text-ink-faint">
          ← Back
        </button>
        <UpgradePrompt
          feature="Partner access"
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
      <h1 className="font-serif text-2xl text-ink">Partner Access</h1>
      <p className="mt-1 text-xs text-ink-mid">
        Share read-only cycle & symptom summaries with your partner
      </p>

      <div className="mt-5 rounded-card bg-surface p-4 shadow-card">
        <label className="text-[10px] font-medium text-ink-faint">Partner phone number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="10-digit mobile"
          className="mt-2 w-full rounded-lg border border-rose-pale px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={sending || phone.length < 10}
          onClick={invite}
          className="mt-3 w-full rounded-full bg-rose-deep py-2.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send invite"}
        </button>
      </div>

      <ul className="mt-5 space-y-2">
        {invites.map((inv) => (
          <li key={inv.id} className="rounded-card bg-surface p-3 text-sm shadow-card">
            <p className="text-ink">{inv.inviteePhone}</p>
            <p className="text-[10px] capitalize text-ink-faint">{inv.status}</p>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
