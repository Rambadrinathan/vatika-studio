"use client";

import { useDesignStore } from "@/lib/store";
import type { DesignEntry } from "@/lib/store";
import { loadDesigns } from "@/lib/db";
import { recommendProducts } from "@/lib/catalog";
import type { SpaceType } from "@/lib/catalog";
import { useEffect, useState, useRef } from "react";

const SPACE_LABELS: Record<SpaceType, string> = {
  balcony: "Balcony",
  "living-room": "Living Room",
  terrace: "Terrace",
};

const SPACE_ICONS: Record<SpaceType, string> = {
  balcony: "🌇",
  "living-room": "🛋️",
  terrace: "🌿",
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

interface Props {
  onClose: () => void;
}

export default function MyDesigns({ onClose }: Props) {
  const { user, setStep, setBudget, setSpaceType, setDesigns, designs } =
    useDesignStore();
  const [savedDesigns, setSavedDesigns] = useState<DesignEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDesign, setExpandedDesign] = useState<DesignEntry | null>(null);
  const loadedRef = useRef(false);

  // Load designs from Supabase
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

  // Sort categories: balcony, living-room, terrace
  const categories = (["balcony", "living-room", "terrace"] as SpaceType[]).filter(
    (s) => grouped[s] && grouped[s].length > 0
  );

  /** Open a design in the editor */
  const openInEditor = (design: DesignEntry) => {
    setBudget(design.budget);
    setSpaceType(design.spaceType || "balcony");
    // Merge this design into the store if not already there
    const exists = designs.some(
      (d) =>
        d.budget === design.budget &&
        (d.spaceType || "balcony") === (design.spaceType || "balcony")
    );
    if (!exists) {
      setDesigns([...designs, design]);
    }
    setStep(2);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-in panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-forest">My Designs</h2>
            <p className="text-xs text-gray-400">
              {savedDesigns.length} saved design
              {savedDesigns.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-3xl mb-3 animate-pulse">🌿</div>
              <p className="text-gray-500 text-sm">Loading your designs...</p>
            </div>
          ) : savedDesigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🪴</div>
              <h3 className="font-semibold text-gray-700 mb-1">
                No designs yet
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Create your first design to see it here
              </p>
              <button
                onClick={() => {
                  setStep(1);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest-light transition-colors"
              >
                Start Designing
              </button>
            </div>
          ) : (
            <>
              {categories.map((spaceType) => (
                <div key={spaceType} className="mb-6">
                  {/* Category header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{SPACE_ICONS[spaceType]}</span>
                    <h3 className="font-semibold text-forest text-sm">
                      {SPACE_LABELS[spaceType]}
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {grouped[spaceType].length}
                    </span>
                  </div>

                  {/* Design cards grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {grouped[spaceType]
                      .sort((a, b) => a.budget - b.budget)
                      .map((design, i) => {
                        const rec = recommendProducts(
                          design.budget,
                          design.spaceType || "balcony"
                        );
                        return (
                          <button
                            key={`${spaceType}-${design.budget}-${i}`}
                            onClick={() => setExpandedDesign(design)}
                            className="rounded-xl overflow-hidden border border-gray-200 hover:border-forest/50 hover:shadow-lg transition-all text-left group"
                          >
                            {/* Thumbnail */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img
                                src={design.render.url}
                                alt={`${formatBudgetShort(design.budget)} ${SPACE_LABELS[spaceType]} design`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-forest text-white text-[11px] font-bold shadow">
                                {formatBudgetShort(design.budget)}
                              </div>
                            </div>
                            {/* Info */}
                            <div className="p-2.5">
                              <div className="text-xs font-semibold text-gray-800">
                                {rec.items.reduce((s, item) => s + item.qty, 0)}{" "}
                                planters
                              </div>
                              <div className="text-xs text-forest font-bold">
                                {formatRs(rec.grandTotal)}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                {formatDate(design.render.timestamp)}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}

              {/* New design button at bottom */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setStep(1);
                    onClose();
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-forest text-white font-medium text-sm hover:bg-forest-light transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Create New Design
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════ EXPANDED DESIGN MODAL ═══════ */}
      {expandedDesign && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Full render */}
            <div className="relative">
              <img
                src={expandedDesign.render.url}
                alt="Design render"
                className="w-full rounded-t-2xl"
              />
              <button
                onClick={() => setExpandedDesign(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white backdrop-blur-sm transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="px-3 py-1 rounded-lg bg-forest text-white text-xs font-bold shadow">
                  {formatBudgetShort(expandedDesign.budget)}
                </span>
                <span className="px-3 py-1 rounded-lg bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
                  {SPACE_LABELS[expandedDesign.spaceType || "balcony"]}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-5">
              {(() => {
                const rec = recommendProducts(
                  expandedDesign.budget,
                  expandedDesign.spaceType || "balcony"
                );
                return (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-forest text-lg">
                        {SPACE_LABELS[expandedDesign.spaceType || "balcony"]}{" "}
                        Design
                      </h3>
                      <span className="text-xs text-gray-400">
                        {formatDate(expandedDesign.render.timestamp)}
                      </span>
                    </div>

                    {/* Product list */}
                    <div className="space-y-2 mb-4">
                      {rec.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                        >
                          <img
                            src={item.planter.image}
                            alt={item.planter.name}
                            className="w-10 h-10 rounded object-contain bg-white"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {item.qty > 1 ? `${item.qty}x ` : ""}
                              {item.planter.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              with {item.plant.name}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-forest">
                            {formatRs(
                              (item.planter.price + item.plant.price) * item.qty
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="font-bold text-forest text-lg">
                        Total: {formatRs(rec.grandTotal)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => {
                          setExpandedDesign(null);
                          openInEditor(expandedDesign);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-forest text-white font-medium text-sm hover:bg-forest-light transition-colors"
                      >
                        Open in Editor
                      </button>
                      <a
                        href={`https://wa.me/919830024611?text=${encodeURIComponent(
                          `Hi, I'd like to proceed with my Vatika Studio design.\n\nBudget: ${formatRs(expandedDesign.budget)}\nSpace: ${SPACE_LABELS[expandedDesign.spaceType || "balcony"]}\nEstimate: ${formatRs(rec.grandTotal)}\nProducts: ${rec.items.map((item) => `${item.qty}x ${item.planter.name}`).join(", ")}\n\nPlease schedule a site visit.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2.5 rounded-lg border border-forest text-forest font-medium text-sm text-center hover:bg-sage transition-colors"
                      >
                        WhatsApp to Proceed
                      </a>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
