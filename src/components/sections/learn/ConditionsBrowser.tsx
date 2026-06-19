"use client";

import { useState } from "react";
import type { ConditionCategoryId } from "@/lib/knowledge";
import { CONDITION_CATEGORIES, getConditionsByCategory } from "@/lib/knowledge";

export function ConditionsBrowser() {
  const [categoryId, setCategoryId] = useState<ConditionCategoryId>("menstrual-cycle");
  const conditions = getConditionsByCategory(categoryId);

  return (
    <div>
      <div className="hide-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {CONDITION_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoryId(cat.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors ${
              categoryId === cat.id
                ? "bg-teal-dark text-white"
                : "border border-gray-200 bg-white text-gray-600"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {conditions.map((condition) => (
          <article key={condition.id} className="rounded-2xl bg-white p-4 shadow-card">
            <p className="font-serif text-sm text-purple-dark">{condition.name}</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">{condition.description}</p>
            {condition.seeDoctor && (
              <p className="mt-2.5 rounded-xl bg-teal-light/50 px-3 py-2 text-[10px] leading-relaxed text-teal-dark">
                {condition.seeDoctor}
              </p>
            )}
          </article>
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-amber-light/60 px-3 py-2 text-[9px] leading-relaxed text-amber-mid">
        Educational information only — not medical advice. Always consult a qualified gynecologist.
      </p>
    </div>
  );
}
