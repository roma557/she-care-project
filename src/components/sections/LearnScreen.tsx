"use client";

import { useState } from "react";
import { AppShell, AppHeader } from "@/components/layout/AppShell";

const tabs = [
  { id: "diff", label: "PCOS vs PCOD" },
  { id: "causes", label: "Causes" },
  { id: "types", label: "Types" },
  { id: "sympt", label: "Symptoms" },
  { id: "tests", label: "Tests" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function TabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case "diff":
      return (
        <div className="space-y-3">
          <div className="rounded-2xl bg-pink-light p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-pink-mid">PCOD</p>
            <p className="mt-1 font-serif text-base text-purple-dark">Polycystic Ovarian Disease</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              A disease with enlarged ovaries and multiple cysts. Often reversible with lifestyle changes.
            </p>
          </div>
          <div className="rounded-2xl bg-purple-light p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-purple-mid">PCOS</p>
            <p className="mt-1 font-serif text-base text-purple-dark">Polycystic Ovarian Syndrome</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              A hormonal syndrome — irregular cycles, excess androgens, and metabolic issues. Requires long-term management.
            </p>
          </div>
        </div>
      );
    case "causes":
      return (
        <ul className="space-y-2">
          {[
            "Genetics & family history",
            "Insulin resistance",
            "Chronic inflammation",
            "Elevated androgens",
            "Sedentary lifestyle",
            "Chronic stress",
          ].map((cause) => (
            <li
              key={cause}
              className="flex items-start gap-2 rounded-xl bg-white p-3 text-xs text-gray-700 shadow-card"
            >
              <span className="mt-0.5 text-pink-mid">•</span>
              {cause}
            </li>
          ))}
        </ul>
      );
    case "types":
      return (
        <div className="space-y-2.5">
          {[
            { title: "Insulin-resistant", desc: "Most common — weight gain, cravings, dark skin patches", color: "bg-teal-light" },
            { title: "Inflammatory / Adrenal", desc: "High DHEA-S, stress-driven, normal BMI", color: "bg-purple-light" },
            { title: "Post-pill", desc: "Onset after stopping birth control pills", color: "bg-pink-light" },
            { title: "Hidden / Lean", desc: "Normal weight but hormonal imbalance present", color: "bg-amber-light" },
          ].map((type) => (
            <div key={type.title} className={`rounded-2xl p-3.5 ${type.color}`}>
              <p className="text-sm font-medium text-purple-dark">{type.title}</p>
              <p className="mt-1 text-[10px] text-gray-600">{type.desc}</p>
            </div>
          ))}
        </div>
      );
    case "sympt":
      return (
        <div className="space-y-4">
          {[
            { group: "Common", tags: ["Irregular periods", "Acne", "Hair thinning", "Weight gain", "Fatigue"] },
            { group: "Metabolic", tags: ["Insulin resistance", "Sugar cravings", "Dark neck patches", "Bloating"] },
            { group: "Reproductive", tags: ["Infertility", "Heavy bleeding", "Pelvic pain", "Mood swings", "Anxiety"] },
          ].map((section) => (
            <div key={section.group}>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-pink-mid">
                {section.group}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {section.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case "tests":
      return (
        <div className="space-y-3">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <p className="font-serif text-sm text-purple-dark">Rotterdam Criteria</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              Diagnosis requires 2 of 3: irregular ovulation, clinical/biochemical hyperandrogenism, polycystic ovaries on ultrasound.
            </p>
          </div>
          <ul className="space-y-2">
            {[
              "Blood tests — testosterone, LH, FSH, insulin, glucose",
              "Pelvic ultrasound — ovarian morphology",
              "Thyroid & prolactin panel",
              "Vitamin D & lipid profile",
              "HbA1c for insulin resistance",
            ].map((test) => (
              <li key={test} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-teal-mid">✓</span>
                {test}
              </li>
            ))}
          </ul>
          <p className="rounded-xl bg-amber-light/60 px-3 py-2 text-[9px] leading-relaxed text-amber-mid">
            Ask your gynecologist for a full hormonal panel — early diagnosis improves outcomes.
          </p>
        </div>
      );
  }
}

export function LearnScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("diff");

  return (
    <AppShell className="bg-gradient-to-b from-purple-light/40 to-cream">
      <AppHeader>
        <h1 className="font-serif text-2xl font-semibold text-purple-dark">Learn</h1>
        <p className="mt-1 text-xs text-gray-500">Evidence-based PCOS & PCOD knowledge</p>
      </AppHeader>

      <div className="hide-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => (
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

      <TabContent tab={activeTab} />
    </AppShell>
  );
}
