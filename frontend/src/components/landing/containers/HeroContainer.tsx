"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileCheck,
  Play,
  Pause,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/shared";
import { HERO_SLIDES, HERO_METRICS } from "@/lib/data/landing-hero";
import { cn } from "@/lib/utils";

export function HeroContainer() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);

  // Auto-advance carousel every 5.5 seconds
  React.useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div id="hero" className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-white">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Announcement Badge */}
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-green-600 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-slate-700">
              Smart India Hackathon 2026 · Problem Statement 26034
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">
              Active
            </span>
          </div>

          {/* Main H1 Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl leading-[1.1]">
            Intelligent Packaged Commodity{" "}
            <span className="text-green-700">
              Compliance Enforcement
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl leading-relaxed">
            Automating statutory label verification under India&apos;s{" "}
            <span className="text-slate-900 font-semibold">Legal Metrology Act, 2009</span> and{" "}
            <span className="text-slate-900 font-semibold">Packaged Commodities Rules, 2011</span> with
            zero-hallucination deterministic validation and court-admissible evidence reporting.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-7 text-base font-semibold bg-green-700 hover:bg-green-800 text-white shadow-xs">
                <Shield className="w-5 h-5" />
                <span>Launch Inspector Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="h-12 px-6 text-base bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs">
                <Layers className="w-4 h-4 text-green-700" />
                <span>Explore Verification Pipeline</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE HERO CAROUSEL                                    */}
        {/* ============================================================ */}
        <div
          className="mt-12 lg:mt-16 relative rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-2 sm:p-4 shadow-sm group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-3 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              </div>
              <span className="text-slate-500 hidden sm:inline ml-2">
                validra-enforcement-suite://{slide.id}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-green-800 font-semibold text-[11px] bg-green-50 px-2 py-0.5 rounded border border-green-200">
                {slide.badge}
              </span>
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title={isAutoPlaying ? "Pause carousel" : "Play carousel"}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Carousel Image & Live Overlay Canvas */}
          <div className="relative aspect-[16/9] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover transition-opacity duration-700 ease-in-out"
            />

            {/* Bottom Gradient Scrim with telemetry */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-xs text-green-400 font-mono mb-2 backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Module 0{currentSlide + 1} / 0{HERO_SLIDES.length}</span>
                </div>
                <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                  {slide.title}
                </h3>
                <p className="text-xs sm:text-base text-slate-200 mt-1 max-w-2xl drop-shadow-xs hidden sm:block">
                  {slide.subtitle}
                </p>

                {/* Telemetry Metric Badges */}
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {slide.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 backdrop-blur-xs flex items-center gap-2 text-xs"
                    >
                      {m.status === "pass" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <FileCheck className="w-3.5 h-3.5 text-green-300" />
                      )}
                      <span className="text-slate-400">{m.label}:</span>
                      <span className="font-bold text-white font-mono">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Previous / Next Controls */}
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700 text-white flex items-center justify-center backdrop-blur-xs hover:bg-slate-800 transition-all cursor-pointer opacity-80 hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700 text-white flex items-center justify-center backdrop-blur-xs hover:bg-slate-800 transition-all cursor-pointer opacity-80 hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Carousel Slide Indicators */}
          <div className="flex items-center justify-center gap-2 mt-4 pb-1">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                  currentSlide === idx
                    ? "w-8 bg-green-700"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Key Metric Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {HERO_METRICS.map((stat, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-green-700 mt-1">
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {stat.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
