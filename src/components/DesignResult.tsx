"use client";

import { useDesignStore, MAX_FREE_RENDITIONS } from "@/lib/store";
import type { GeneratedImage } from "@/lib/store";
import { recommendProducts } from "@/lib/catalog";
import { buildScenePrompt, buildIterationPrompt } from "@/lib/prompts";
import { saveDesign, loadDesigns } from "@/lib/db";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

/** Standard budget chips for quick switching */
const BUDGET_CHIPS = [20000, 25000, 35000, 50000, 75000, 100000];

function formatBudgetShort(n: number): string {
  if (n >= 100000) return `${n / 100000}L`;
  return `${n / 1000}K`;
}

function formatRs(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

export default function DesignResult() {
  const {
    photo,
    budget,
    setBudget,
    spaceType,
    designs,
    addDesign,
    setDesigns,
    isGenerating,
    setIsGenerating,
    error,
    setError,
    freeRenditionsUsed,
    incrementRenditions,
    setStep,
    reset,
    user,
  } = useDesignStore();

  const [feedback, setFeedback] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const loadedRef = useRef(false);

  // Load saved designs from Supabase on mount (once)
  useEffect(() => {
    if (!user || loadedRef.current) return;
    loadedRef.current = true;
    loadDesigns(user.id).then((saved) => {
      if (saved.length > 0) {
        // Merge saved designs (don't overwrite any currently generated ones)
        const currentBudgets = new Set(designs.map((d) => `${d.budget}-${d.spaceType || "balcony"}`));
        const newOnes = saved.filter(
          (d) => !currentBudgets.has(`${d.budget}-${d.spaceType || "balcony"}`)
        );
        if (newOnes.length > 0) {
          setDesigns([...designs, ...newOnes]);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Current recommendation for active budget
  const rec = useMemo(() => recommendProducts(budget, spaceType), [budget, spaceType]);

  // Active design (if one exists for current budget + spaceType)
  const activeDesign = designs.find(
    (d) => d.budget === budget && (d.spaceType || "balcony") === spaceType
  );

  // Budget chips — include user's current budget if not in standard list
  const chips = useMemo(() => {
    const set = new Set(BUDGET_CHIPS);
    set.add(budget);
    // Also add budgets from saved designs
    for (const d of designs) set.add(d.budget);
    return Array.from(set).sort((a, b) => a - b);
  }, [budget, designs]);

  /** Convert an image URL to a data URI */
  const imageUrlToDataUri = useCallback(async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  /** Generate a render for a given budget */
  const generate = useCallback(
    async (targetBudget: number, iterationFeedback?: string) => {
      if (!photo) return;
      setIsGenerating(true);
      setError(null);

      try {
        const targetRec = recommendProducts(targetBudget, spaceType);
        const prompt = iterationFeedback
          ? buildIterationPrompt(targetRec.items, iterationFeedback, spaceType)
          : buildScenePrompt(targetRec.items, spaceType);

        const uniqueImages = Array.from(
          new Set(targetRec.items.map((i) => i.planter.image))
        );
        const productImageDataUris = await Promise.all(
          uniqueImages.map((url) => imageUrlToDataUri(url))
        );

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            imageDataUri: photo,
            productImageDataUris,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed");

        const render: GeneratedImage = {
          url: data.imageUrl,
          prompt,
          timestamp: Date.now(),
        };
        addDesign({ budget: targetBudget, spaceType, render });
        setBudget(targetBudget);
        incrementRenditions();

        // Persist to Supabase if logged in
        if (user) {
          saveDesign(user.id, targetBudget, spaceType, render).catch(() => {});
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsGenerating(false);
      }
    },
    [photo, spaceType, user, setIsGenerating, setError, addDesign, setBudget, incrementRenditions, imageUrlToDataUri]
  );

  // Auto-generate on first mount
  useEffect(() => {
    if (!activeDesign && !isGenerating) generate(budget);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Handle budget chip click */
  const handleChipClick = (chipBudget: number) => {
    // If we already have a design for this budget+spaceType, just switch view
    const existing = designs.find(
      (d) => d.budget === chipBudget && (d.spaceType || "balcony") === spaceType
    );
    if (existing) {
      setBudget(chipBudget);
      setShowOriginal(false);
      return;
    }
    // Otherwise generate
    setBudget(chipBudget);
    generate(chipBudget);
  };

  const renditionsLeft = MAX_FREE_RENDITIONS - freeRenditionsUsed;

  // Sort saved designs for current spaceType by budget
  const sortedDesigns = designs
    .filter((d) => (d.spaceType || "balcony") === spaceType)
    .sort((a, b) => a.budget - b.budget);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Secondary: Change photo */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setStep(1)}
          className="text-xs text-gray-400 hover:text-forest hover:underline"
        >
          &larr; Change photo
        </button>
        <span className="text-xs text-gray-400">
          {renditionsLeft > 0
            ? `${renditionsLeft} free designs left`
            : "Rs. 10 per design"}
        </span>
      </div>

      {/* ═══════ LOADING STATE (first generation only) ═══════ */}
      {isGenerating && !activeDesign && (
        <div className="bg-white rounded-2xl border border-sage-dark p-12 text-center mb-4">
          <div className="animate-pulse-gentle">
            <div className="text-5xl mb-4">🌿</div>
            <h3 className="text-xl font-bold text-forest mb-2">
              Designing your {formatBudgetShort(budget)} garden...
            </h3>
            <p className="text-gray-500 mb-2">
              Placing {rec.items.reduce((s, i) => s + i.qty, 0)} premium planters
              into your space. ~30 seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {rec.items.map((item, i) => (
                <span
                  key={i}
                  className="text-xs bg-sage px-2 py-1 rounded text-forest"
                >
                  {item.qty > 1 ? `${item.qty}x ` : ""}
                  {item.planter.name}
                </span>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-forest"
                  style={{
                    animation: `pulse-gentle 1.5s ease-in-out ${i * 0.3}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ ERROR ═══════ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              generate(budget);
            }}
            className="mt-2 text-sm text-red-600 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* ═══════ ACTIVE DESIGN ═══════ */}
      {activeDesign && (
        <>
          {/* ── HERO RENDER ── */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-forest shadow-xl mb-4 group">
            <img
              src={showOriginal ? photo! : activeDesign.render.url}
              alt={
                showOriginal
                  ? "Your original space"
                  : "AI-generated garden design"
              }
              className="w-full object-cover"
              style={{ minHeight: "320px", maxHeight: "600px" }}
            />

            {/* Before/After toggle */}
            <div className="absolute top-3 left-3 flex gap-2">
              <button
                onClick={() => setShowOriginal(false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm transition-all ${
                  !showOriginal
                    ? "bg-forest text-white shadow-lg"
                    : "bg-black/40 text-white/80 hover:bg-black/60"
                }`}
              >
                AI Design
              </button>
              <button
                onClick={() => setShowOriginal(true)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm transition-all ${
                  showOriginal
                    ? "bg-forest text-white shadow-lg"
                    : "bg-black/40 text-white/80 hover:bg-black/60"
                }`}
              >
                Original
              </button>
            </div>

            {/* Budget + price tag */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium">
              {formatBudgetShort(budget)} plan &middot; {formatRs(rec.grandTotal)}
            </div>

            {/* Generating overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                <div className="text-white text-center">
                  <div className="text-3xl mb-2 animate-spin">🌿</div>
                  <p className="font-medium">Creating new design...</p>
                </div>
              </div>
            )}
          </div>

          {/* ── BUDGET CHIPS ── */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              Try a different budget
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {chips.map((chipBudget) => {
                const isActive = chipBudget === budget;
                const hasDesign = designs.some(
                  (d) => d.budget === chipBudget && (d.spaceType || "balcony") === spaceType
                );
                return (
                  <button
                    key={chipBudget}
                    onClick={() => handleChipClick(chipBudget)}
                    disabled={isGenerating}
                    className={`relative flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-50 ${
                      isActive
                        ? "bg-forest text-white shadow-lg"
                        : hasDesign
                        ? "bg-sage text-forest border-2 border-forest/30 hover:border-forest"
                        : "bg-white text-gray-600 border border-gray-300 hover:border-forest hover:text-forest"
                    }`}
                  >
                    {formatBudgetShort(chipBudget)}
                    {hasDesign && !isActive && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-forest rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── ITERATION CONTROLS ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Want changes? e.g., more greenery, warmer lighting..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && feedback.trim()) {
                    generate(budget, feedback.trim());
                    setFeedback("");
                  }
                }}
              />
              <button
                onClick={() => {
                  generate(budget, feedback.trim() || undefined);
                  setFeedback("");
                }}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-lg bg-forest text-white font-medium hover:bg-forest-light disabled:opacity-50 whitespace-nowrap text-sm"
              >
                {isGenerating
                  ? "Generating..."
                  : feedback.trim()
                  ? "Regenerate"
                  : "New Variation"}
              </button>
            </div>
          </div>

          {/* ── SAVED DESIGNS CARDS ── */}
          {sortedDesigns.length > 1 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-forest mb-2">
                Your Designs ({sortedDesigns.length})
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {sortedDesigns.map((d) => {
                  const isActive = d.budget === budget;
                  const dRec = recommendProducts(d.budget, spaceType);
                  return (
                    <button
                      key={d.budget}
                      onClick={() => {
                        setBudget(d.budget);
                        setShowOriginal(false);
                      }}
                      className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all text-left ${
                        isActive
                          ? "border-forest shadow-lg ring-2 ring-forest/20"
                          : "border-gray-200 hover:border-forest/50 hover:shadow-md"
                      }`}
                      style={{ width: "160px" }}
                    >
                      {/* Thumbnail */}
                      <div className="relative">
                        <img
                          src={d.render.url}
                          alt={`${formatBudgetShort(d.budget)} design`}
                          className="w-full h-24 object-cover"
                        />
                        <div
                          className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isActive
                              ? "bg-forest text-white"
                              : "bg-black/60 text-white"
                          }`}
                        >
                          {formatBudgetShort(d.budget)}
                        </div>
                      </div>
                      {/* Summary */}
                      <div className="p-2">
                        <div className="text-xs font-semibold text-gray-800">
                          {dRec.items.reduce((s, i) => s + i.qty, 0)} planters
                        </div>
                        <div className="text-xs text-forest font-bold">
                          {formatRs(dRec.grandTotal)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PRODUCTS IN YOUR DESIGN ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-forest">
                Products in Your Design
              </h3>
              <span className="text-xs bg-sage text-forest px-2 py-0.5 rounded-full font-semibold">
                {formatBudgetShort(budget)} plan
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              These exact planters and plants will be installed in your space.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {rec.items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 p-3 hover:border-forest/50 hover:shadow-md transition-all"
                >
                  <div className="bg-gray-50 rounded-lg p-2 mb-2">
                    <img
                      src={item.planter.image}
                      alt={item.planter.name}
                      className="w-full h-24 object-contain"
                    />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {item.qty > 1 ? `${item.qty}x ` : ""}
                    {item.planter.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    with {item.plant.name}
                  </div>
                  <div className="text-xs text-forest font-bold mt-1">
                    {formatRs(
                      (item.planter.price + item.plant.price) * item.qty
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
              <div>
                <div className="font-bold text-forest text-lg">
                  Total: {formatRs(rec.grandTotal)}
                </div>
                {rec.grandTotal < budget && (
                  <div className="text-xs text-gray-400">
                    {formatRs(budget - rec.grandTotal)} under budget
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowQuote(true)}
                className="px-4 py-2 rounded-lg bg-gold text-white font-medium hover:bg-gold-light transition-colors text-sm"
              >
                View Quotation
              </button>
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="bg-forest text-white rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-2">Love this design?</h3>
            <p className="text-sm text-white/80 mb-4">
              Our team will install these exact products in your space. Free site
              visit included.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="https://wa.me/919830024611?text=Hi%2C%20I%20just%20designed%20my%20space%20on%20Vatika%20Studio%20and%20I%27d%20like%20to%20proceed!"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-4 py-2.5 rounded-lg bg-white text-forest font-medium hover:bg-sage transition-colors"
              >
                WhatsApp Us to Proceed
              </a>
              <a
                href="tel:+919830024611"
                className="flex-1 text-center px-4 py-2.5 rounded-lg border border-white/40 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Call: +91 98300 24611
              </a>
            </div>
          </div>

          <button
            onClick={() => reset()}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-500 hover:bg-gray-50"
          >
            Start New Design
          </button>
        </>
      )}

      {/* ═══════ QUOTATION MODAL ═══════ */}
      {showQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-forest">
                Detailed Quotation
              </h3>
              <span className="text-xs bg-sage text-forest px-2 py-0.5 rounded-full font-semibold">
                {formatBudgetShort(budget)}
              </span>
            </div>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="bg-forest text-white">
                  <th className="text-left p-2 rounded-tl-lg">Product</th>
                  <th className="text-center p-2">Qty</th>
                  <th className="text-right p-2">Rate</th>
                  <th className="text-right p-2 rounded-tr-lg">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rec.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-2">
                      <div className="font-medium">{item.planter.name}</div>
                      <div className="text-xs text-gray-400">
                        + {item.plant.name}
                      </div>
                    </td>
                    <td className="text-center p-2">{item.qty}</td>
                    <td className="text-right p-2">
                      {formatRs(item.planter.price + item.plant.price)}
                    </td>
                    <td className="text-right p-2 font-medium">
                      {formatRs(
                        (item.planter.price + item.plant.price) * item.qty
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-sage font-bold">
                  <td colSpan={3} className="p-2 text-right">
                    Total
                  </td>
                  <td className="p-2 text-right text-forest">
                    {formatRs(rec.grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="bg-sage/50 rounded-lg p-3 text-xs text-gray-500 mb-4">
              <p>
                <strong>Terms:</strong> 50% advance, 40% prior to dispatch, 10%
                on completion.
              </p>
              <p className="mt-1">
                <strong>Validity:</strong> 30 days. Installation charges
                additional.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuote(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600"
              >
                Close
              </button>
              <a
                href={`https://wa.me/919830024611?text=${encodeURIComponent(
                  `Hi, I'd like to proceed with my Vatika Studio design.\n\nBudget: ${formatRs(budget)}\nEstimate: ${formatRs(rec.grandTotal)}\nProducts: ${rec.items.map((i) => `${i.qty}x ${i.planter.name}`).join(", ")}\n\nPlease schedule a site visit.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 rounded-lg bg-forest text-white font-medium text-center"
              >
                Proceed via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
