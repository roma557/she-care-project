"use client";

import { ReactNode, useRef, useState } from "react";
import { AppFullBleed } from "@/components/layout/AppShell";

interface PlanCardsCarouselProps {
  slides: { id: string; label: string; content: ReactNode }[];
  dotActiveClass?: string;
}

export function PlanCardsCarousel({ slides, dotActiveClass = "bg-rose-deep" }: PlanCardsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function scrollTo(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActiveIndex(index);
  }

  return (
    <div className="mb-2">
      <AppFullBleed>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          aria-label="Plan cards"
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="w-full shrink-0 snap-center snap-always px-7"
              aria-roledescription="slide"
              aria-label={slide.label}
            >
              {slide.content}
            </div>
          ))}
        </div>
      </AppFullBleed>

      <div className="mt-3 flex items-center justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => scrollTo(index)}
            className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 transition-opacity"
            aria-label={`Show ${slide.label}`}
            aria-current={activeIndex === index ? "true" : undefined}
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === index ? `w-4 ${dotActiveClass}` : "w-1.5 bg-ink-faint/40"
              }`}
            />
            <span
              className={`text-[0.55rem] font-medium uppercase tracking-[0.12em] ${
                activeIndex === index ? "text-ink-mid" : "text-ink-faint/60"
              }`}
            >
              {slide.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
