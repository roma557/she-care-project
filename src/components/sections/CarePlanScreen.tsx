"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ScreenBackHeader } from "@/components/ui/ScreenBackHeader";

const tabs = [
  { id: "diet", label: "Diet" },
  { id: "exercise", label: "Exercise" },
  { id: "sleep", label: "Sleep" },
  { id: "supplements", label: "Supplements" },
  { id: "herbs", label: "Herbs" },
  { id: "medical", label: "Medical" },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface CarePlanScreenProps {
  onBack: () => void;
}

function TabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case "diet":
      return (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-teal-dark">Eat more</p>
            <div className="grid grid-cols-2 gap-2">
              {["Millets (bajra, jowar)", "Dal & legumes", "Leafy greens", "Nuts & seeds", "Spearmint tea", "Fatty fish"].map(
                (food) => (
                  <span key={food} className="rounded-xl bg-teal-light px-2.5 py-2 text-[10px] text-teal-dark">
                    {food}
                  </span>
                ),
              )}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-pink-mid">Limit</p>
            <div className="grid grid-cols-2 gap-2">
              {["White rice & maida", "Sugary drinks", "Deep-fried snacks", "Processed foods"].map((food) => (
                <span key={food} className="rounded-xl bg-pink-light px-2.5 py-2 text-[10px] text-pink-dark">
                  {food}
                </span>
              ))}
            </div>
          </div>
          <ul className="space-y-2 text-xs text-gray-700">
            <li className="flex gap-2"><span className="text-teal-mid">•</span>Choose low-GI carbs — pair with protein</li>
            <li className="flex gap-2"><span className="text-teal-mid">•</span>Eat within 1 hour of waking</li>
            <li className="flex gap-2"><span className="text-teal-mid">•</span>2 cups spearmint tea daily</li>
          </ul>
        </div>
      );
    case "exercise":
      return (
        <ul className="space-y-3">
          {[
            { icon: "🚶", title: "Daily walking", desc: "20 min after meals — improves insulin sensitivity" },
            { icon: "🏋️", title: "Strength training", desc: "2–3× weekly — builds muscle, boosts metabolism" },
            { icon: "🧘", title: "Yoga", desc: "Butterfly pose, cat-cow, child's pose for pelvic health" },
            { icon: "🏃", title: "Moderate cardio", desc: "30 min, 3× weekly — swimming or brisk walking" },
            { icon: "⚠️", title: "Avoid over-exercise", desc: "Excessive cardio can raise cortisol and worsen symptoms" },
          ].map((item) => (
            <li key={item.title} className="flex gap-3 rounded-2xl bg-white p-3.5 shadow-card">
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-purple-dark">{item.title}</p>
                <p className="mt-0.5 text-[10px] text-gray-500">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      );
    case "sleep":
      return (
        <ul className="space-y-3">
          {[
            { icon: "🌙", title: "7–9 hours nightly", desc: "Consistent sleep supports hormone balance" },
            { icon: "⏰", title: "Fixed schedule", desc: "Same bedtime ±30 min, even on weekends" },
            { icon: "📵", title: "Screen-free 30 min before bed", desc: "Blue light disrupts melatonin production" },
            { icon: "🌡️", title: "Cool, dark room", desc: "18–22°C ideal — use blackout curtains" },
            { icon: "☕", title: "No caffeine after 2pm", desc: "Includes chai — switch to herbal tea" },
          ].map((item) => (
            <li key={item.title} className="flex gap-3 rounded-2xl bg-white p-3.5 shadow-card">
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-purple-dark">{item.title}</p>
                <p className="mt-0.5 text-[10px] text-gray-500">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      );
    case "supplements":
      return (
        <div className="space-y-3">
          {[
            { name: "Myo-inositol", dose: "2g/day — may improve ovulation & insulin" },
            { name: "Vitamin D3 + K2", dose: "2000–4000 IU/day — common deficiency in PCOS" },
            { name: "Omega-3", dose: "1000mg EPA/DHA — anti-inflammatory" },
            { name: "Magnesium", dose: "300–400mg before bed — sleep & insulin" },
            { name: "NAC", dose: "600mg 2× daily — antioxidant support" },
            { name: "Iron / B12", dose: "If deficient — get levels tested first" },
          ].map((sup) => (
            <div key={sup.name} className="rounded-2xl bg-white p-3.5 shadow-card">
              <p className="text-sm font-medium text-purple-dark">{sup.name}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{sup.dose}</p>
            </div>
          ))}
          <p className="rounded-xl bg-amber-light/60 px-3 py-2 text-[9px] leading-relaxed text-amber-mid">
            Always discuss supplements and doses with your doctor before starting.
          </p>
        </div>
      );
    case "herbs":
      return (
        <ul className="space-y-3">
          {[
            { name: "Spearmint", desc: "2 cups tea daily — may reduce androgens & hirsutism" },
            { name: "Shatavari", desc: "Ayurvedic adaptogen — supports reproductive health" },
            { name: "Ashwagandha", desc: "Stress & cortisol management — take with food" },
            { name: "Chasteberry (Vitex)", desc: "May support progesterone — avoid if on OCP" },
            { name: "Cinnamon", desc: "1 tsp daily — may improve insulin sensitivity" },
            { name: "Fenugreek (Methi)", desc: "Soaked seeds — traditional blood sugar support" },
          ].map((herb) => (
            <li key={herb.name} className="rounded-2xl bg-teal-light/50 p-3.5">
              <p className="text-sm font-medium text-teal-dark">{herb.name}</p>
              <p className="mt-0.5 text-[10px] text-gray-600">{herb.desc}</p>
            </li>
          ))}
        </ul>
      );
    case "medical":
      return (
        <div className="space-y-3">
          {[
            { name: "Metformin", desc: "Insulin sensitizer — first-line for metabolic PCOS" },
            { name: "Oral contraceptives", desc: "Regulate cycles & reduce androgens" },
            { name: "Spironolactone", desc: "Anti-androgen for acne & excess hair" },
            { name: "Letrozole", desc: "Ovulation induction for fertility treatment" },
          ].map((med) => (
            <div key={med.name} className="rounded-2xl bg-white p-3.5 shadow-card">
              <p className="text-sm font-medium text-purple-dark">{med.name}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{med.desc}</p>
            </div>
          ))}
          <div className="rounded-2xl bg-purple-light p-4">
            <p className="text-sm font-medium text-purple-dark">Monitoring schedule</p>
            <ul className="mt-2 space-y-1.5 text-[10px] text-gray-600">
              <li>• Hormonal panel every 6–12 months</li>
              <li>• HbA1c & lipid profile annually</li>
              <li>• Pelvic ultrasound as advised</li>
              <li>• Blood pressure check regularly</li>
            </ul>
          </div>
          <p className="rounded-xl bg-amber-light/60 px-3 py-2 text-[9px] leading-relaxed text-amber-mid">
            Never start or stop medications without your doctor&apos;s guidance.
          </p>
        </div>
      );
  }
}

export function CarePlanScreen({ onBack }: CarePlanScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>("diet");

  return (
    <AppShell hasNav={false} className="bg-gradient-to-b from-teal-light/40 to-cream">
      <ScreenBackHeader
        title="Care Plan"
        subtitle="Daily guidance for diet, movement & more"
        onBack={onBack}
      />

      <div className="hide-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-teal-dark text-white"
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
