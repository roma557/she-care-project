"use client";

import { useState } from "react";
import { AppShell, AppHeader } from "@/components/layout/AppShell";
import type { PcosGuideTabId } from "@/lib/knowledge";
import { PCOS_GUIDE_TABS, PcosGuideContent } from "@/components/sections/learn/PcosGuideContent";
import { ConditionsBrowser } from "@/components/sections/learn/ConditionsBrowser";

type LearnSection = "pcos" | "conditions";

export function LearnScreen() {
  const [section, setSection] = useState<LearnSection>("pcos");
  const [activeTab, setActiveTab] = useState<PcosGuideTabId>("diff");

  return (
    <AppShell className="bg-gradient-to-b from-purple-light/40 to-cream">
      <AppHeader>
        <h1 className="font-serif text-2xl font-semibold text-purple-dark">Learn</h1>
        <p className="mt-1 text-xs text-gray-500">PCOS, PCOD & women&apos;s health conditions</p>
      </AppHeader>

      <div className="mb-4 flex gap-2">
        {(
          [
            { id: "pcos" as const, label: "PCOS Guide" },
            { id: "conditions" as const, label: "Conditions" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`flex-1 rounded-full py-2 text-[10px] font-medium transition-colors ${
              section === item.id
                ? "bg-purple-dark text-white"
                : "border border-gray-200 bg-white text-gray-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === "pcos" ? (
        <>
          <div className="hide-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1">
            {PCOS_GUIDE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-purple-dark text-white"
                    : "border border-gray-200 bg-white text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <PcosGuideContent tab={activeTab} />
        </>
      ) : (
        <ConditionsBrowser />
      )}
    </AppShell>
  );
}
