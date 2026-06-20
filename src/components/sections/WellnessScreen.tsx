"use client";

import { useState } from "react";
import { AppShell, AppHeader } from "@/components/layout/AppShell";
import { ScreenBackHeader } from "@/components/ui/ScreenBackHeader";
import { AppIcon, IconName } from "@/components/ui/icons";

const affirmations: { icon: IconName; text: string }[] = [
  { icon: "flower", text: "You're doing your best — and your body notices." },
  { icon: "dumbbell", text: "PCOS doesn't define you. Your strength does." },
  { icon: "leaf", text: "Small, consistent steps create lasting change." },
  { icon: "sparkle", text: "Your worth isn't measured by a number on a scale." },
  { icon: "moon", text: "Rest is not laziness — it's part of healing." },
  { icon: "heart", text: "You deserve compassionate care, including from yourself." },
  { icon: "sun", text: "Every cycle is different, and that's okay." },
  { icon: "wind", text: "Asking for help is a sign of courage, not weakness." },
];

const copingTools = [
  { title: "Grounding breath", desc: "4 counts in, hold 4, out 6 — repeat 5 times" },
  { title: "Body scan", desc: "Notice tension without judgment, release slowly" },
  { title: "Journal prompt", desc: "What felt manageable today? What do I need?" },
  { title: "Gentle movement", desc: "10-min walk or stretch — no pressure to perform" },
];

const helplines = [
  { name: "iCall", number: "9152987821", hours: "Mon–Sat, 8am–10pm" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", hours: "24/7" },
];

interface WellnessScreenProps {
  onBack?: () => void;
}

export function WellnessScreen({ onBack }: WellnessScreenProps) {
  const [affirmIdx, setAffirmIdx] = useState(0);
  const current = affirmations[affirmIdx];

  function nextAffirmation() {
    setAffirmIdx((i) => (i + 1) % affirmations.length);
  }

  return (
    <AppShell hasNav={!onBack} className="bg-gradient-to-b from-peach/30 via-cream to-cream">
      {onBack ? (
        <ScreenBackHeader title="Wellness" onBack={onBack} />
      ) : (
        <AppHeader>
          <h1 className="font-serif text-2xl font-semibold text-purple-dark">Wellness</h1>
          <p className="mt-1 text-xs text-gray-500">Affirmations, coping tools & support</p>
        </AppHeader>
      )}

      <div className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-mid/20 to-purple-mid/30 p-5 shadow-card">
        <AppIcon name={current.icon} className="h-8 w-8 text-rose-deep" />
        <p className="mt-3 font-serif text-lg leading-snug text-purple-dark">
          {current.text}
        </p>
        <button
          type="button"
          onClick={nextAffirmation}
          className="mt-4 rounded-full bg-white/90 px-4 py-2 text-[10px] font-medium text-pink-mid shadow-sm"
        >
          Next affirmation →
        </button>
      </div>

      <p className="mb-3 text-sm font-medium text-purple-dark">Coping tools</p>
      <div className="mb-5 space-y-2">
        {copingTools.map((tool) => (
          <div key={tool.title} className="rounded-2xl bg-white p-3.5 shadow-card">
            <p className="text-sm font-medium text-purple-dark">{tool.title}</p>
            <p className="mt-0.5 text-[10px] text-gray-500">{tool.desc}</p>
          </div>
        ))}
      </div>

      <p className="mb-3 text-sm font-medium text-purple-dark">Crisis helplines (India)</p>
      <div className="space-y-2">
        {helplines.map((line) => (
          <div key={line.name} className="rounded-2xl border border-pink-light bg-pink-light/40 p-4">
            <p className="text-sm font-medium text-purple-dark">{line.name}</p>
            <p className="mt-1 font-serif text-lg text-pink-mid">{line.number}</p>
            <p className="mt-0.5 text-[10px] text-gray-500">{line.hours}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-amber-light/60 px-3 py-2 text-[9px] leading-relaxed text-amber-mid">
        If you&apos;re in immediate danger, call 112 or visit your nearest emergency room.
      </p>
    </AppShell>
  );
}
