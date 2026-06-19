"use client";

import { useCallback, useEffect, useRef } from "react";

const ITEM_H = 52;
const PAD_H = 72;

interface DrumPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

function updateActive(drum: HTMLDivElement) {
  const items = Array.from(drum.querySelectorAll<HTMLElement>(".drum-item:not(.pad)"));
  let closestEl: HTMLElement | undefined;
  let closestDist = Infinity;

  for (const item of items) {
    const dist = Math.abs(item.offsetTop - drum.scrollTop - PAD_H);
    if (dist < closestDist) {
      closestDist = dist;
      closestEl = item;
    }
  }

  for (const item of items) {
    item.classList.remove("active", "text-[2.8rem]", "font-normal", "text-ink");
    item.classList.add("text-[2.2rem]", "font-light", "text-ink/20");
  }

  if (closestEl) {
    closestEl.classList.add("active", "text-[2.8rem]", "font-normal", "text-ink");
    closestEl.classList.remove("text-[2.2rem]", "font-light", "text-ink/20");
  }
}

export function DrumPicker({ min, max, value, onChange }: DrumPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScroll = useRef(false);

  const scrollToValue = useCallback(
    (val: number) => {
      const drum = scrollRef.current;
      if (!drum) return;
      drum.scrollTop = 2 * PAD_H + (val - min) * ITEM_H - PAD_H;
      updateActive(drum);
    },
    [min],
  );

  useEffect(() => {
    const timer = setTimeout(() => scrollToValue(value), 50);
    return () => clearTimeout(timer);
  }, [scrollToValue, value]);

  useEffect(() => {
    const drum = scrollRef.current;
    if (!drum) return;

    function handleScroll() {
      updateActive(drum!);
      if (!isUserScroll.current) return;

      const items = Array.from(drum!.querySelectorAll<HTMLElement>(".drum-item:not(.pad)"));
      let closestEl: HTMLElement | undefined;
      let closestDist = Infinity;

      for (const item of items) {
        const dist = Math.abs(item.offsetTop - drum!.scrollTop - PAD_H);
        if (dist < closestDist) {
          closestDist = dist;
          closestEl = item;
        }
      }

      if (closestEl) {
        const num = Number(closestEl.textContent);
        if (!Number.isNaN(num)) onChange(num);
      }
    }

    drum.addEventListener("scroll", handleScroll, { passive: true });
    return () => drum.removeEventListener("scroll", handleScroll);
  }, [min, onChange]);

  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="relative mx-auto h-[196px] w-[180px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[68px] bg-gradient-to-b from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[68px] bg-gradient-to-t from-bg to-transparent" />
      <div
        className="pointer-events-none absolute left-4 right-4 top-1/2 z-[1] -mt-[26px] h-[52px] rounded-md border-y border-rose-deep/25"
        aria-hidden
      />
      <div
        ref={scrollRef}
        className="hide-scrollbar h-[196px] w-[180px] overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch" }}
        onTouchStart={() => { isUserScroll.current = true; }}
        onMouseDown={() => { isUserScroll.current = true; }}
      >
        {[0, 1].map((i) => (
          <div key={`pad-top-${i}`} className="drum-item pad h-[72px]" />
        ))}
        {numbers.map((n) => (
          <div
            key={n}
            className="drum-item flex h-[52px] select-none items-center justify-center font-serif text-[2.2rem] font-light text-ink/20"
            style={{ scrollSnapAlign: "center" }}
          >
            {n}
          </div>
        ))}
        {[0, 1].map((i) => (
          <div key={`pad-bot-${i}`} className="drum-item pad h-[72px]" />
        ))}
      </div>
    </div>
  );
}
