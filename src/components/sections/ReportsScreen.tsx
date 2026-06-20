"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { usePermissions } from "@/hooks/usePermissions";
import type { DbWellnessReport } from "@/lib/db/types";

export function ReportsScreen({ onBack }: { onBack?: () => void }) {
  const { tier, can, startCheckout, refresh } = usePermissions();
  const [reports, setReports] = useState<DbWellnessReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => setReports(d.reports ?? []))
      .catch(() => setReports([]));
  }, []);

  async function generate(type: "weekly" | "monthly") {
    setGenerating(type);
    const res = await fetch("/api/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    setGenerating(null);
    if (res.ok && data.report) {
      setReports((prev) => [data.report, ...prev]);
      refresh();
    }
  }

  async function exportReport(id: string, format: "pdf" | "doctor") {
    setLoading(true);
    window.open(`/api/reports/${id}/export?format=${format}`, "_blank");
    setLoading(false);
  }

  const canMonthly = can("monthly_report");
  const canWeekly = can("weekly_report");

  return (
    <AppShell className="bg-bg">
      {onBack && (
        <button type="button" onClick={onBack} className="mb-4 text-xs text-ink-faint">
          ← Back
        </button>
      )}
      <h1 className="font-serif text-2xl text-ink">Wellness Reports</h1>
      <p className="mt-1 text-xs text-ink-mid">Weekly & monthly summaries of your tracking data</p>

      <div className="mt-5 space-y-3">
        {canMonthly ? (
          <button
            type="button"
            disabled={generating === "monthly"}
            onClick={() => generate("monthly")}
            className="w-full rounded-card bg-surface p-4 text-left shadow-card"
          >
            <p className="text-sm font-medium text-ink">Generate monthly report</p>
            <p className="text-[10px] text-ink-faint">Last 30 days summary</p>
          </button>
        ) : (
          <UpgradePrompt
            feature="Monthly wellness reports"
            requiredTier="starter"
            onUpgrade={(t) => startCheckout(t)}
          />
        )}

        {canWeekly ? (
          <button
            type="button"
            disabled={generating === "weekly"}
            onClick={() => generate("weekly")}
            className="w-full rounded-card bg-surface p-4 text-left shadow-card"
          >
            <p className="text-sm font-medium text-ink">Generate weekly report</p>
            <p className="text-[10px] text-ink-faint">Last 7 days summary</p>
          </button>
        ) : tier !== "free" ? (
          <UpgradePrompt
            feature="Weekly reports"
            requiredTier="plus"
            onUpgrade={(t) => startCheckout(t)}
          />
        ) : null}
      </div>

      <h2 className="mb-3 mt-6 text-[0.65rem] font-medium uppercase tracking-wider text-ink-faint">
        Your reports
      </h2>
      {reports.length === 0 ? (
        <p className="text-xs text-ink-faint">No reports yet. Generate one above.</p>
      ) : (
        <ul className="space-y-2">
          {reports.map((r) => (
            <li key={r.id} className="rounded-card bg-surface p-4 shadow-card">
              <p className="text-sm font-medium text-ink">{r.title}</p>
              <p className="text-[10px] text-ink-faint">
                {r.periodStart} — {r.periodEnd}
              </p>
              <div className="mt-2 flex gap-2">
                {can("pdf_export") && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => exportReport(r.id, "pdf")}
                    className="rounded-full bg-rose-pale px-3 py-1 text-[10px] text-rose-deep"
                  >
                    PDF
                  </button>
                )}
                {can("doctor_report") && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => exportReport(r.id, "doctor")}
                    className="rounded-full bg-rose-pale px-3 py-1 text-[10px] text-rose-deep"
                  >
                    Doctor export
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
