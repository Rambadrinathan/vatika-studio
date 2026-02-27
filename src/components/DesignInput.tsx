"use client";

import { useDesignStore } from "@/lib/store";
import type { SpaceType } from "@/lib/catalog";
import { useCallback, useRef, useState, useEffect } from "react";

const MIN_BUDGET = 20000;
const MAX_BUDGET = 100000;
const STEP = 5000;

function formatRs(n: number): string {
  return `\u20B9${n.toLocaleString("en-IN")}`;
}

interface TierInfo {
  label: string;
  desc: string;
  icon: string;
}

function getBudgetTier(budget: number): TierInfo {
  if (budget <= 25000)
    return { label: "Starter", desc: "2-3 curated planters", icon: "\u{1F331}" };
  if (budget <= 40000)
    return { label: "Classic", desc: "4-5 planters with variety", icon: "\u{1F33F}" };
  if (budget <= 60000)
    return { label: "Premium", desc: "6-8 statement pieces", icon: "\u{1F33A}" };
  if (budget <= 80000)
    return { label: "Luxury", desc: "Full transformation", icon: "\u{2728}" };
  return { label: "Signature", desc: "No compromise makeover", icon: "\u{1F451}" };
}

const TIER_THRESHOLDS = [
  { budget: 25000, label: "Starter" },
  { budget: 40000, label: "Classic" },
  { budget: 60000, label: "Premium" },
  { budget: 80000, label: "Luxury" },
  { budget: 100000, label: "Signature" },
];

const SPACE_OPTIONS: {
  type: SpaceType;
  label: string;
  desc: string;
  bgGradient: string;
  overlayText: string;
}[] = [
  {
    type: "balcony",
    label: "Balcony",
    desc: "Railing planters, vertical gardens, compact greenery",
    bgGradient: "from-emerald-800 via-emerald-600 to-teal-500",
    overlayText: "Transform your balcony into a lush urban oasis",
  },
  {
    type: "living-room",
    label: "Living Room",
    desc: "Indoor corners, shelf gardens, table accents",
    bgGradient: "from-amber-800 via-amber-600 to-yellow-500",
    overlayText: "Bring nature indoors with designer planters",
  },
  {
    type: "terrace",
    label: "Terrace",
    desc: "Open space, statement pieces, full landscapes",
    bgGradient: "from-green-900 via-green-700 to-emerald-500",
    overlayText: "Create a rooftop paradise with premium pieces",
  },
];

export default function DesignInput() {
  const { photo, setPhoto, budget, setBudget, spaceType, setSpaceType, setStep } =
    useDesignStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [budgetAnimating, setBudgetAnimating] = useState(false);

  const [fileError, setFileError] = useState<string | null>(null);

  const handleFile = useCallback(
    (files: FileList | null) => {
      setFileError(null);
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setFileError("Please upload a JPG or PNG image.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFileError("Image too large (max 10 MB). Please use a smaller photo.");
        return;
      }
      // Compress image to stay under Vercel's 4.5MB body limit
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1200;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const scale = MAX_DIM / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        setPhoto(compressed);
      };
      img.src = URL.createObjectURL(file);
    },
    [setPhoto]
  );

  const clampedBudget = Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, budget));
  if (clampedBudget !== budget) setBudget(clampedBudget);

  const tier = getBudgetTier(clampedBudget);
  const pct = ((clampedBudget - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;

  // Determine step completion
  const step1Done = true; // space type always selected
  const step2Done = !!photo;

  // Trigger budget animation on change
  useEffect(() => {
    setBudgetAnimating(true);
    const t = setTimeout(() => setBudgetAnimating(false), 300);
    return () => clearTimeout(t);
  }, [clampedBudget]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Section header ── */}
      <div className="text-center mb-10">
        <h2
          className="text-4xl sm:text-5xl font-bold text-forest mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Design Your Space
        </h2>
        <p className="text-muted text-lg max-w-lg mx-auto">
          Three simple steps to your dream green space. Vatika places real products from our curated catalog into your photo.
        </p>
      </div>

      {/* ── Step Progress Bar ── */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {[
          { num: "1", label: "Space", done: step1Done },
          { num: "2", label: "Photo", done: step2Done },
          { num: "3", label: "Budget", done: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`step-circle ${
                  s.done
                    ? "step-circle-done"
                    : i === 0 || (i === 1 && step1Done) || (i === 2 && step2Done)
                    ? "step-circle-active"
                    : "step-circle-pending"
                }`}
              >
                {s.done ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  s.num
                )}
              </div>
              <span className="text-xs font-semibold text-muted mt-1.5">{s.label}</span>
            </div>
            {i < 2 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 rounded-full transition-colors ${
                  (i === 0 && step1Done) || (i === 1 && step2Done) ? "bg-forest-light" : "bg-sage-dark"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ═══ 1. SPACE TYPE ═══ */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="step-circle step-circle-done text-sm">1</div>
          <h3 className="text-xl font-bold text-forest" style={{ fontFamily: "var(--font-display)" }}>
            What kind of space?
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {SPACE_OPTIONS.map((opt) => {
            const isSelected = spaceType === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => setSpaceType(opt.type)}
                className={`space-card relative rounded-2xl overflow-hidden ${
                  isSelected ? "space-card-selected" : "border border-gray-200"
                }`}
              >
                {/* Photography-style background */}
                <div className={`bg-gradient-to-br ${opt.bgGradient} aspect-[3/4] flex flex-col justify-end p-3 sm:p-4 relative`}>
                  {/* Subtle noise texture overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-7 h-7 bg-gold rounded-full flex items-center justify-center shadow-lg z-10">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  )}

                  <div className="relative z-10">
                    <h4
                      className="text-white text-lg sm:text-xl font-bold leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {opt.label}
                    </h4>
                    <p className="text-white/70 text-[11px] sm:text-xs mt-1 leading-snug">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ 2. PHOTO UPLOAD ═══ */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`step-circle ${step2Done ? "step-circle-done" : "step-circle-active"} text-sm`}>
            {step2Done ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              "2"
            )}
          </div>
          <h3 className="text-xl font-bold text-forest" style={{ fontFamily: "var(--font-display)" }}>
            Upload your space
          </h3>
        </div>

        {!photo ? (
          <div
            className={`dropzone rounded-2xl p-8 sm:p-12 text-center cursor-pointer bg-gradient-to-br from-sage/40 to-sage/20 ${
              dragOver ? "drag-over !border-gold !bg-sage/50" : ""
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
          >
            {/* Animated camera+plant icon */}
            <div className="animate-bob mb-4">
              <svg viewBox="0 0 64 64" className="w-16 h-16 mx-auto">
                <rect x="8" y="18" width="48" height="34" rx="6" fill="#E8F5E9" stroke="#2D6A4F" strokeWidth="2" />
                <circle cx="32" cy="35" r="10" fill="none" stroke="#2D6A4F" strokeWidth="2" />
                <circle cx="32" cy="35" r="5" fill="#2D6A4F" opacity="0.2" />
                <rect x="26" y="14" width="12" height="6" rx="2" fill="#2D6A4F" />
                {/* Little leaf accent */}
                <path d="M48 22c-2 3-4 5-4 8 0 2 1 3 3 3s3-1 3-3c0-3-2-5-2-8z" fill="#2D6A4F" opacity="0.5" />
              </svg>
            </div>

            <p
              className="text-forest text-xl font-bold mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {dragOver ? "Looking good! Drop it!" : "Drop your space here"}
            </p>
            <p className="text-muted text-sm">
              JPG, PNG up to 10MB &middot; Your photo stays private
            </p>

            <div className="mt-5">
              <span className="inline-flex items-center gap-2 text-forest font-semibold text-sm bg-white rounded-full px-5 py-2 shadow-sm border border-sage-dark hover:shadow-md transition-shadow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Choose File
              </span>
            </div>
          </div>
        ) : (
          <div className="relative group rounded-2xl overflow-hidden border-2 border-forest shadow-lg">
            <img src={photo} alt="Your space" className="w-full h-64 object-cover" />
            {/* Success overlay */}
            <div className="absolute inset-0 bg-forest/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setPhoto(null)}
                className="px-5 py-2.5 bg-white text-forest rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Change Photo
              </button>
            </div>
            {/* Tick badge */}
            <div className="absolute top-3 right-3 w-8 h-8 bg-forest rounded-full flex items-center justify-center shadow-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
        />
        {fileError && (
          <p className="text-red-600 text-sm mt-2 text-center font-medium">{fileError}</p>
        )}
      </div>

      {/* ═══ 3. BUDGET CONFIGURATOR ═══ */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`step-circle ${step2Done ? "step-circle-active" : "step-circle-pending"} text-sm`}>3</div>
          <h3 className="text-xl font-bold text-forest" style={{ fontFamily: "var(--font-display)" }}>
            Set your budget
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          {/* Hero budget number */}
          <div className="text-center mb-6">
            <div
              className={`text-5xl sm:text-6xl font-bold text-forest transition-transform ${
                budgetAnimating ? "animate-count-pulse" : ""
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {formatRs(clampedBudget)}
            </div>
          </div>

          {/* Tier pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {TIER_THRESHOLDS.map((t) => {
              const isActive = getBudgetTier(clampedBudget).label === t.label;
              return (
                <button
                  key={t.label}
                  onClick={() => setBudget(t.budget)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? "bg-forest text-white shadow-md scale-105"
                      : "bg-sage text-muted hover:bg-sage-dark"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Slider */}
          <div className="px-1 mb-3">
            <div className="relative h-12 flex items-center">
              {/* Track background */}
              <div className="absolute inset-x-0 h-3 rounded-full bg-sage-dark overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(to right, #2D6A4F, #1A3C2E)",
                  }}
                />
              </div>
              <input
                type="range"
                min={MIN_BUDGET}
                max={MAX_BUDGET}
                step={STEP}
                value={clampedBudget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="budget-slider relative w-full h-3 appearance-none bg-transparent cursor-pointer z-10"
              />
            </div>
            <div className="flex justify-between text-xs text-muted px-1">
              <span>{formatRs(MIN_BUDGET)}</span>
              <span>{formatRs(MAX_BUDGET)}</span>
            </div>
          </div>

          {/* Tier description */}
          <div className="text-center mt-4 p-3 bg-sage/30 rounded-xl">
            <span className="text-lg mr-1.5">{tier.icon}</span>
            <span className="font-bold text-forest text-sm">{tier.label}</span>
            <span className="text-muted text-sm ml-1">&mdash; {tier.desc}</span>
          </div>
        </div>
      </div>

      {/* ═══ CTA BUTTON ═══ */}
      <button
        onClick={() => { if (photo) setStep(2); }}
        disabled={!photo}
        className={`cta-shimmer-wrap w-full py-5 rounded-2xl font-bold text-xl tracking-wide shadow-xl transition-all ${
          photo
            ? "bg-gradient-to-r from-emerald-700 to-green-500 text-white hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {photo ? (
          <span className="flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z" />
            </svg>
            Transform My Space
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Upload a photo first
          </span>
        )}
      </button>

      {!photo && (
        <p className="text-center text-muted text-sm mt-3">
          Upload a photo of your {spaceType === "balcony" ? "balcony" : spaceType === "living-room" ? "living room" : "terrace"} to get started
        </p>
      )}
    </div>
  );
}
