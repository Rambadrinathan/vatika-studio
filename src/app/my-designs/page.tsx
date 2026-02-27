"use client";

import { useDesignStore } from "@/lib/store";
import type { DesignEntry } from "@/lib/store";
import { loadDesigns, } from "@/lib/db";
import { recommendProducts } from "@/lib/catalog";
import type { SpaceType } from "@/lib/catalog";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";

const SPACE_LABELS: Record<SpaceType, string> = {
  balcony: "Balcony",
  "living-room": "Living Room",
  terrace: "Terrace",
};

const SPACE_ICONS: Record<SpaceType, string> = {
  balcony: "\u{1F307}",
  "living-room": "\u{1F6CB}\uFE0F",
  terrace: "\u{1F33F}",
};

function formatBudgetShort(n: number): string {
  if (n >= 100000) return `${n / 100000}L`;
  return `${n / 1000}K`;
}

function formatRs(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MyDesignsContent() {
  const router = useRouter();
  const { user, setStep, setBudget, setSpaceType, setDesigns, designs } =
    useDesignStore();
  const [savedDesigns, setSavedDesigns] = useState<DesignEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!user || loadedRef.current) return;
    loadedRef.current = true;
    loadDesigns(user.id).then((saved) => {
      setSavedDesigns(saved);
      setLoading(false);
    });
  }, [user]);

  // Group designs by spaceType
  const grouped = savedDesigns.reduce<Record<string, DesignEntry[]>>(
    (acc, d) => {
      const key = d.spaceType || "balcony";
      if (!acc[key]) acc[key] = [];
      acc[key].push(d);
      return acc;
    },
    {}
  );

  const categories = (["balcony", "living-room", "terrace"] as SpaceType[]).filter(
    (s) => grouped[s] && grouped[s].length > 0
  );

  const openInEditor = (design: DesignEntry) => {
    setBudget(design.budget);
    setSpaceType(design.spaceType || "balcony");
    const exists = designs.some(
      (d) =>
        d.budget === design.budget &&
        (d.spaceType || "balcony") === (design.spaceType || "balcony")
    );
    if (!exists) {
      setDesigns([...designs, design]);
    }
    setStep(2);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-sage-dark sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-forest leading-tight">
                My Designs
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                KarmYog Vatika Design Studio
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8 pb-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 animate-pulse">{"\u{1F33F}"}</div>
            <p className="text-gray-500">Loading your designs...</p>
          </div>
        ) : savedDesigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{"\u{1FAB4}"}</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              No designs yet
            </h2>
            <p className="text-gray-400 mb-6">
              Upload a photo and create your first garden design
            </p>
            <button
              onClick={() => {
                setStep(1);
                router.push("/");
              }}
              className="px-6 py-3 rounded-xl bg-forest text-white font-medium hover:bg-forest-light transition-colors"
            >
              Start Designing
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {savedDesigns.length} design{savedDesigns.length !== 1 ? "s" : ""} saved
            </p>

            {categories.map((spaceType) => (
              <div key={spaceType} className="mb-10">
                {/* Category header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{SPACE_ICONS[spaceType]}</span>
                  <h2 className="font-bold text-forest text-lg">
                    {SPACE_LABELS[spaceType]}
                  </h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                    {grouped[spaceType].length}
                  </span>
                </div>

                {/* Design cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {grouped[spaceType]
                    .sort((a, b) => a.budget - b.budget)
                    .map((design, i) => {
                      const rec = recommendProducts(
                        design.budget,
                        design.spaceType || "balcony"
                      );
                      return (
                        <div
                          key={`${spaceType}-${design.budget}-${i}`}
                          className="rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-forest/50 hover:shadow-xl transition-all group"
                        >
                          {/* Large image */}
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <img
                              src={design.render.url}
                              alt={`${formatBudgetShort(design.budget)} ${SPACE_LABELS[spaceType]} design`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-forest text-white text-sm font-bold shadow-lg">
                              {formatBudgetShort(design.budget)}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="text-sm font-semibold text-gray-800">
                                  {rec.items.reduce((s, item) => s + item.qty, 0)} planters
                                </div>
                                <div className="text-base text-forest font-bold">
                                  {formatRs(rec.grandTotal)}
                                </div>
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDate(design.render.timestamp)}
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => openInEditor(design)}
                                className="flex-1 px-3 py-2 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest-light transition-colors"
                              >
                                Open in Editor
                              </button>
                              <a
                                href={`https://wa.me/919830024611?text=${encodeURIComponent(
                                  `Hi, I'd like to proceed with my Vatika Studio design.\n\nBudget: ${formatRs(design.budget)}\nSpace: ${SPACE_LABELS[design.spaceType || "balcony"]}\nEstimate: ${formatRs(rec.grandTotal)}\nProducts: ${rec.items.map((item) => `${item.qty}x ${item.planter.name}`).join(", ")}\n\nPlease schedule a site visit.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-3 py-2 rounded-lg border border-forest text-forest text-sm font-medium text-center hover:bg-sage transition-colors"
                              >
                                WhatsApp
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}

            {/* New design button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setStep(1);
                  router.push("/");
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-forest text-white font-medium hover:bg-forest-light transition-colors flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create New Design
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-forest-dark text-white/60 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm">
          <p>
            KarmYog Vatika Design Studio — NatureLink Education Network Pvt. Ltd.
          </p>
          <p className="mt-1 text-xs">
            Biophilic design solutions for urban spaces | Kolkata, India
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function MyDesignsPage() {
  return (
    <AuthGate>
      <MyDesignsContent />
    </AuthGate>
  );
}
