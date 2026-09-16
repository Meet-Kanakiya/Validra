"use client";

import * as React from "react";
import { ChevronDown, HelpCircle, BookOpen } from "lucide-react";
import { FAQItem } from "@/types/landing";
import { cn } from "@/lib/utils";

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const [activeCategory, setActiveCategory] = React.useState<string>("All");

  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-6">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setOpenIndex(null);
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer",
              activeCategory === cat
                ? "bg-emerald-500 text-zinc-950 font-semibold shadow-md shadow-emerald-500/20"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion Items */}
      <div className="flex flex-col space-y-3">
        {filteredItems.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-2xl border transition-all duration-200 overflow-hidden",
                isOpen
                  ? "border-emerald-500/40 bg-zinc-900/80 shadow-lg shadow-emerald-950/20"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700/80 hover:bg-zinc-900/60"
              )}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <span className="p-1 rounded-md bg-zinc-800/80 text-emerald-400 mt-0.5 shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-base sm:text-lg font-semibold text-white group-hover:text-emerald-300">
                      {item.question}
                    </span>
                    <div className="text-[11px] text-zinc-400 font-medium uppercase mt-0.5 tracking-wider">
                      {item.category}
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180 bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  )}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-0 border-t border-zinc-800/50 mt-1">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mt-4">
                    {item.answer}
                  </p>
                  {item.legalRef && (
                    <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs font-mono text-emerald-400">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Legal Reference: {item.legalRef}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
