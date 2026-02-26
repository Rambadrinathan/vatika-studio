"use client";

import { useDesignStore } from "@/lib/store";
import type { SpaceType } from "@/lib/catalog";
import { useCallback, useRef, useState } from "react";

const MIN_BUDGET = 20000;
const MAX_BUDGET = 100000;
const STEP = 5000;

function formatRs(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

function getBudgetTier(budget: number): { label: string; desc: string } {
  if (budget <= 25000)
    return { label: "Starter", desc: "2-3 curated planters for a fresh look" };
  if (budget <= 40000)
    return { label: "Classic", desc: "4-5 planters with variety in sizes" };
  if (budget <= 60000)
    return {
      label: "Premium",
      desc: "6-8 planters, statement + accent pieces",
    };
  if (budget <= 80000)
    return { label: "Luxury", desc: "Full transformation with designer planters" };
  return { label: "Grand", desc: "Complete biophilic makeover, no compromise" };
}

const SPACE_OPTIONS: {
  type: SpaceType;
  label: string;
  desc: string;
  emoji: string;
  gradient: string;
}[] = [
  {
    type: "balcony",
    label: "Balcony",
    desc: "Railing planters, compact greenery",
    emoji: "🏙️",
    gradient: "from-sky-400 to-blue-500",
  },
  {
    type: "living-room",
    label: "Living Room",
    desc: "Indoor corners, shelves & tables",
    emoji: "🛋️",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    type: "terrace",
    label: "Terrace",
    desc: "Open space, large statement pieces",
    emoji: "🌿",
    gradient: "from-emerald-400 to-green-600",
  },
];

export default function DesignInput() {
  const { photo, setPhoto, budget, setBudget, spaceType, setSpaceType, setStep } =
    useDesignStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    },
    [setPhoto]
  );

  const clampedBudget = Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, budget));
  if (clampedBudget !== budget) setBudget(clampedBudget);

  const tier = getBudgetTier(clampedBudget);
  const pct =
    ((clampedBudget - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-forest mb-2">
          See Your Space Transformed
        </h2>
        <p className="text-gray-600">
          Choose your space type, upload a photo, and set your budget. Our AI
          will place real products from our catalog into your space.
        </p>
      </div>

      {/* ── 1. Space type selector ── */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-forest mb-3">
          1. What kind of space?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {SPACE_OPTIONS.map((opt) => {
            const isSelected = spaceType === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => setSpaceType(opt.type)}
                className={`relative rounded-xl overflow-hidden transition-all ${
                  isSelected
                    ? "ring-3 ring-forest shadow-lg scale-[1.02]"
                    : "hover:shadow-md hover:scale-[1.01]"
                }`}
              >
                {/* Gradient background simulating image */}
                <div
                  className={`bg-gradient-to-br ${opt.gradient} h-24 flex flex-col items-center justify-center`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                </div>
                {/* Label */}
                <div
                  className={`px-2 py-2 text-center ${
                    isSelected ? "bg-forest text-white" : "bg-white text-gray-700"
                  }`}
                >
                  <div className="text-sm font-bold">{opt.label}</div>
                  <div
                    className={`text-[10px] leading-tight ${
                      isSelected ? "text-white/80" : "text-gray-400"
                    }`}
                  >
                    {opt.desc}
                  </div>
                </div>
                {/* Check mark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                    <span className="text-forest text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Photo upload ── */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-forest mb-3">
          2. Upload a photo of your space
        </label>
        {!photo ? (
          <div
            className={`dropzone rounded-xl p-10 text-center cursor-pointer ${
              dragOver ? "drag-over" : ""
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files);
            }}
          >
            <div className="text-4xl mb-3">📸</div>
            <p className="text-forest font-medium">
              Click or drag a photo here
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {spaceType === "balcony"
                ? "Your balcony or verandah"
                : spaceType === "living-room"
                ? "Your living room or indoor space"
                : "Your terrace or rooftop"}
            </p>
          </div>
        ) : (
          <div className="relative group rounded-xl overflow-hidden border-2 border-forest">
            <img
              src={photo}
              alt="Your space"
              className="w-full h-56 object-cover"
            />
            <button
              onClick={() => setPhoto(null)}
              className="absolute top-3 right-3 px-3 py-1 bg-white/90 text-gray-700 rounded-lg text-sm font-medium hover:bg-white shadow"
            >
              Change photo
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
        />
      </div>

      {/* ── 3. Budget slider ── */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-forest mb-3">
          3. Set your budget
        </label>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-forest">
              {formatRs(clampedBudget)}
            </div>
            <div className="mt-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-sage text-forest text-xs font-semibold">
                {tier.label}
              </span>
              <span className="text-xs text-gray-500 ml-2">{tier.desc}</span>
            </div>
          </div>

          <div className="relative px-1">
            <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full bg-sage-dark" />
            <div
              className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full bg-forest"
              style={{ width: `${pct}%` }}
            />
            <input
              type="range"
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={STEP}
              value={clampedBudget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-forest
                [&::-webkit-slider-thumb]:border-[3px]
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-forest
                [&::-moz-range-thumb]:border-[3px]
                [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:shadow-lg
                [&::-moz-range-thumb]:cursor-pointer
              "
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
            <span>{formatRs(MIN_BUDGET)}</span>
            <span>{formatRs(MAX_BUDGET)}</span>
          </div>
        </div>
      </div>

      {/* ── Generate button ── */}
      <button
        onClick={() => {
          if (photo) setStep(2);
        }}
        disabled={!photo}
        className="w-full py-4 rounded-xl bg-forest text-white font-bold text-lg hover:bg-forest-light disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
      >
        Transform My Space
      </button>
    </div>
  );
}
