"use client";

import type { PcosGuideTabId } from "@/lib/knowledge";
import {
  PCOS_CAUSES,
  PCOS_GUIDE_TABS,
  PCOS_SYMPTOM_GROUPS,
  PCOS_TESTS,
  PCOS_TYPES,
} from "@/lib/knowledge";

export function PcosGuideContent({ tab }: { tab: PcosGuideTabId }) {
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
          {PCOS_CAUSES.map((cause) => (
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
          {PCOS_TYPES.map((type) => (
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
          {PCOS_SYMPTOM_GROUPS.map((section) => (
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
            {PCOS_TESTS.map((test) => (
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

export { PCOS_GUIDE_TABS };
