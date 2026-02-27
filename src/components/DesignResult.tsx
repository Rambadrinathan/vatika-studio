"use client";

import { useDesignStore, MAX_FREE_RENDITIONS } from "@/lib/store";
import type { GeneratedImage } from "@/lib/store";
import { recommendProducts, getDeliveryTier, getDiscountMultiplier, DELIVERY_TIERS } from "@/lib/catalog";
import { buildScenePrompt, buildIterationPrompt } from "@/lib/prompts";
import { saveDesign, loadDesigns } from "@/lib/db";
import DeliverySlider from "@/components/DeliverySlider";
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

/** Max possible savings at 45 days */
function getMaxSavings(total: number): number {
  const maxTier = DELIVERY_TIERS[DELIVERY_TIERS.length - 1];
  return total - Math.round(total * maxTier.multiplier);
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
    deliveryDays,
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

  // Delivery pricing
  const deliveryMultiplier = getDiscountMultiplier(deliveryDays);
  const deliveryTier = getDeliveryTier(deliveryDays);
  const discountedTotal = Math.round(rec.grandTotal * deliveryMultiplier);
  const discountPct = Math.round((1 - deliveryMultiplier) * 100);
  const savings = rec.grandTotal - discountedTotal;
  const maxSavings = getMaxSavings(rec.grandTotal);
  const maxDiscountedTotal = Math.round(rec.grandTotal * DELIVERY_TIERS[DELIVERY_TIERS.length - 1].multiplier);
  const planterCount = rec.items.reduce((s, i) => s + i.qty, 0);

  // Active design (if one exists for current budget + spaceType)
  const activeDesign = designs.find(
    (d) => d.budget === budget && (d.spaceType || "balcony") === spaceType
  );

  // Budget chips — include user's current budget if not in standard list
  const chips = useMemo(() => {
    const set = new Set(BUDGET_CHIPS);
    set.add(budget);
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
    const existing = designs.find(
      (d) => d.budget === chipBudget && (d.spaceType || "balcony") === spaceType
    );
    if (existing) {
      setBudget(chipBudget);
      setShowOriginal(false);
      return;
    }
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

      {/* ═══════ 1. URGENCY BANNER — full width, always visible ═══════ */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">&#9889;</span>
          <p className="text-sm font-bold text-amber-900 truncate">
            Wait 45 days &amp; save up to 50% on this exact design
          </p>
        </div>
        <a href="#price-slider" className="flex-shrink-0 text-xs font-bold bg-amber-900 text-white px-3 py-1.5 rounded-full hover:bg-amber-800 transition-colors">
          See how &#8595;
        </a>
      </div>

      {/* ═══════ 2. SCARCITY BADGE ═══════ */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setStep(1)}
          className="text-xs text-gray-400 hover:text-forest hover:underline"
        >
          &larr; Change photo
        </button>
        <div className="scarcity-pulse flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
          <span className="text-sm">&#128293;</span>
          <span className="text-xs font-bold text-amber-800">
            {renditionsLeft > 0
              ? `Only ${renditionsLeft} Free AI Designs Left`
              : "Rs. 10 per design"}
          </span>
        </div>
      </div>

      {/* ═══════ LOADING STATE ═══════ */}
      {isGenerating && !activeDesign && (
        <div className="bg-white rounded-2xl border border-sage-dark p-12 text-center mb-4">
          <div className="animate-pulse-gentle">
            <div className="text-5xl mb-4">&#127807;</div>
            <h3 className="text-xl font-bold text-forest mb-2">
              Designing your {formatBudgetShort(budget)} garden...
            </h3>
            <p className="text-gray-500 mb-2">
              Placing {planterCount} premium planters into your space. ~30 seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {rec.items.map((item, i) => (
                <span key={i} className="text-xs bg-sage px-2 py-1 rounded text-forest">
                  {item.qty > 1 ? `${item.qty}x ` : ""}{item.planter.name}
                </span>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-forest"
                  style={{ animation: `pulse-gentle 1.5s ease-in-out ${i * 0.3}s infinite` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ ERROR ═══════ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => { setError(null); generate(budget); }}
            className="mt-2 text-sm text-red-600 underline">
            Try again
          </button>
        </div>
      )}

      {/* ═══════ ACTIVE DESIGN ═══════ */}
      {activeDesign && (
        <>
          {/* ── 3. HERO RENDER ── */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-forest shadow-xl mb-4 group">
            <img
              src={showOriginal ? photo! : activeDesign.render.url}
              alt={showOriginal ? "Your original space" : "AI-generated garden design"}
              className="w-full object-cover"
              style={{ minHeight: "320px", maxHeight: "600px" }}
            />

            {/* Before/After toggle */}
            <div className="absolute top-3 left-3 flex gap-2">
              <button onClick={() => setShowOriginal(false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm transition-all ${!showOriginal ? "bg-forest text-white shadow-lg" : "bg-black/40 text-white/80 hover:bg-black/60"}`}>
                AI Design
              </button>
              <button onClick={() => setShowOriginal(true)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm transition-all ${showOriginal ? "bg-forest text-white shadow-lg" : "bg-black/40 text-white/80 hover:bg-black/60"}`}>
                Original
              </button>
            </div>

            {/* Generating overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                <div className="text-white text-center">
                  <div className="text-3xl mb-2 animate-spin">&#127807;</div>
                  <p className="font-medium">Creating new design...</p>
                </div>
              </div>
            )}
          </div>

          {/* ── 4. PRICE SPOTLIGHT CALLOUT ── */}
          <div className="rounded-2xl overflow-hidden mb-4 border-2 border-forest/20 shadow-md">
            {/* Top section — current price */}
            <div className="bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">&#127991;&#65039;</span>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Your Price</h3>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {discountPct > 0 && (
                  <span className="text-lg text-gray-400 line-through">{formatRs(rec.grandTotal)}</span>
                )}
                <span className="text-3xl font-black text-forest">{formatRs(discountedTotal)}</span>
                {discountPct > 0 && (
                  <span className="bg-forest text-white text-sm font-bold px-3 py-1 rounded-full">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm font-semibold text-emerald-600 mt-1">
                  You save {formatRs(savings)} with {deliveryDays}-day delivery
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {planterCount} handcrafted planters + plants &middot; {formatBudgetShort(budget)} budget
              </p>
            </div>

            {/* Bottom section — 45-day teaser */}
            {deliveryDays < 45 && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-t-2 border-amber-200 px-5 py-3 flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">&#9203;</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-amber-900">
                    Wait 45 days &#8594; Pay only {formatRs(maxDiscountedTotal)}
                    <span className="ml-2 text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                      50% OFF
                    </span>
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Save {formatRs(maxSavings)} — factory schedules = bigger savings
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── 5. DUAL SLIDERS ── */}
          <div id="price-slider">
            <DeliverySlider originalTotal={rec.grandTotal} />
          </div>

          {/* ── 6. BUDGET CHIPS ── */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
              &#128071; Choose your garden budget
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {chips.map((chipBudget) => {
                const isActive = chipBudget === budget;
                const hasDesign = designs.some(
                  (d) => d.budget === chipBudget && (d.spaceType || "balcony") === spaceType
                );
                const isPopular = chipBudget === 50000;
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
                    {isPopular && !isActive && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        Popular
                      </span>
                    )}
                    {hasDesign && !isActive && !isPopular && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-forest rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 7. ITERATION CONTROLS ── */}
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
                onClick={() => { generate(budget, feedback.trim() || undefined); setFeedback(""); }}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-lg bg-forest text-white font-medium hover:bg-forest-light disabled:opacity-50 whitespace-nowrap text-sm"
              >
                {isGenerating ? "Generating..." : feedback.trim() ? "Regenerate" : "New Variation"}
              </button>
            </div>
          </div>

          {/* ── 8. SAVED DESIGNS CAROUSEL ── */}
          {sortedDesigns.length > 1 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-forest mb-2 flex items-center gap-1.5">
                <span>&#10024;</span>
                Your AI has generated {sortedDesigns.length} unique designs
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {sortedDesigns.map((d) => {
                  const isActive = d.budget === budget;
                  const dRec = recommendProducts(d.budget, spaceType);
                  const dPrice = Math.round(dRec.grandTotal * deliveryMultiplier);
                  const dSavingsPct = discountPct;
                  return (
                    <button
                      key={d.budget}
                      onClick={() => { setBudget(d.budget); setShowOriginal(false); }}
                      className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all text-left ${
                        isActive
                          ? "border-forest shadow-lg ring-2 ring-forest/30 design-card-active"
                          : "border-gray-200 hover:border-forest/50 hover:shadow-md"
                      }`}
                      style={{ width: "160px" }}
                    >
                      <div className="relative">
                        <img src={d.render.url} alt={`${formatBudgetShort(d.budget)} design`}
                          className="w-full h-24 object-cover" />
                        <div className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isActive ? "bg-forest text-white" : "bg-black/60 text-white"}`}>
                          {formatBudgetShort(d.budget)}
                        </div>
                        {dSavingsPct > 0 && (
                          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-400 text-amber-900 text-[9px] font-bold">
                            Save {dSavingsPct}%
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-semibold text-gray-800">
                          {dRec.items.reduce((s, i) => s + i.qty, 0)} planters
                        </div>
                        <div className="text-xs text-forest font-bold">
                          {formatRs(dPrice)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 9. PRODUCTS IN YOUR DESIGN ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-forest flex items-center gap-1.5">
                <span>&#127807;</span>
                {planterCount} Handcrafted Planters Included
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
                <div key={i}
                  className="rounded-lg border border-gray-200 p-3 hover:border-forest/50 hover:shadow-md transition-all relative">
                  {discountPct > 0 && (
                    <div className="absolute top-2 right-2 text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                      Factory Direct
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-2 mb-2">
                    <img src={item.planter.image} alt={item.planter.name}
                      className="w-full h-24 object-contain" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {item.qty > 1 ? `${item.qty}x ` : ""}{item.planter.name}
                  </div>
                  <div className="text-xs text-gray-500">with {item.plant.name}</div>
                  <div className="text-xs text-forest font-bold mt-1">
                    {formatRs(Math.round((item.planter.price + item.plant.price) * item.qty * deliveryMultiplier))}
                  </div>
                </div>
              ))}
            </div>

            {/* Total + savings callout */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  {discountPct > 0 && (
                    <div className="text-sm text-gray-400 line-through">{formatRs(rec.grandTotal)}</div>
                  )}
                  <div className="font-bold text-forest text-lg">
                    Total: {formatRs(discountedTotal)}
                  </div>
                </div>
                <button onClick={() => setShowQuote(true)}
                  className="px-4 py-2 rounded-lg bg-gold text-white font-medium hover:bg-gold-light transition-colors text-sm">
                  View Quotation
                </button>
              </div>
              {/* Savings callout box */}
              {savings > 0 && (
                <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
                  <span className="text-base flex-shrink-0">&#9989;</span>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      You&apos;re saving {formatRs(savings)} vs. retail
                    </p>
                    {deliveryDays < 45 && (
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Wait 45 days &#8594; Save {formatRs(maxSavings)} (50% off full MRP)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 10. CTA — ENERGY BOOSTED ── */}
          <div className="bg-gradient-to-br from-forest via-forest to-forest-dark text-white rounded-2xl p-6 mb-6 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl" />

            <div className="relative">
              <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                <span>&#127793;</span> Ready to bring this garden to life?
              </h3>
              <p className="text-sm text-white/80 mb-1">
                {savings > 0
                  ? `Lock in your ${formatRs(savings)} savings — or slide the delivery time to save even more.`
                  : "Our team will install these exact products in your space. Free site visit included."}
              </p>
              <p className="text-xs text-white/50 mb-4 flex items-center gap-1">
                <span>&#9889;</span> This AI design is held for you for 24 hours
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={`https://wa.me/919830024611?text=${encodeURIComponent(
                    `Hi, I'd like to proceed with my Vatika Studio design.\n\nBudget: ${formatRs(budget)}\nDelivery: ${deliveryTier.label} (${deliveryTier.days <= 2 ? "1-2" : deliveryTier.days} days)\nEstimate: ${formatRs(discountedTotal)}${discountPct > 0 ? ` (${discountPct}% off MRP ${formatRs(rec.grandTotal)})` : ""}\nProducts: ${rec.items.map((i) => `${i.qty}x ${i.planter.name}`).join(", ")}\n\nPlease schedule a site visit.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-4 py-3 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Us to Proceed
                </a>
                <a href="tel:+919830024611"
                  className="flex-1 text-center px-4 py-3 rounded-xl border-2 border-white/30 text-white font-bold hover:bg-white/10 transition-colors">
                  Call: +91 98300 24611
                </a>
              </div>

              <p className="text-[11px] text-white/40 mt-3 text-center">
                Trusted by 200+ homes in Kolkata
              </p>
            </div>
          </div>

          <button onClick={() => reset()}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-500 hover:bg-gray-50">
            Start New Design
          </button>
        </>
      )}

      {/* ═══════ QUOTATION MODAL ═══════ */}
      {showQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-forest">Detailed Quotation</h3>
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
                      <div className="text-xs text-gray-400">+ {item.plant.name}</div>
                    </td>
                    <td className="text-center p-2">{item.qty}</td>
                    <td className="text-right p-2">
                      {formatRs(item.planter.price + item.plant.price)}
                    </td>
                    <td className="text-right p-2 font-medium">
                      {formatRs((item.planter.price + item.plant.price) * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-sage/50">
                  <td colSpan={3} className="p-2 text-right text-sm">Subtotal (MRP)</td>
                  <td className="p-2 text-right text-sm">{formatRs(rec.grandTotal)}</td>
                </tr>
                {discountPct > 0 && (
                  <tr className="bg-sage/50">
                    <td colSpan={3} className="p-2 text-right text-sm text-forest">
                      {deliveryTier.label} ({discountPct}% off)
                    </td>
                    <td className="p-2 text-right text-sm text-forest font-medium">
                      &minus;{formatRs(savings)}
                    </td>
                  </tr>
                )}
                <tr className="bg-sage font-bold">
                  <td colSpan={3} className="p-2 text-right">Total</td>
                  <td className="p-2 text-right text-forest">{formatRs(discountedTotal)}</td>
                </tr>
              </tfoot>
            </table>
            <div className="bg-sage/50 rounded-lg p-3 text-xs text-gray-500 mb-4">
              <p><strong>Delivery:</strong> {deliveryTier.label} — estimated {deliveryTier.days <= 2 ? "1-2" : deliveryTier.days} days</p>
              <p className="mt-1"><strong>Terms:</strong> 50% advance, 40% prior to dispatch, 10% on completion.</p>
              <p className="mt-1"><strong>Validity:</strong> 30 days. Installation charges additional.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowQuote(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600">
                Close
              </button>
              <a
                href={`https://wa.me/919830024611?text=${encodeURIComponent(
                  `Hi, I'd like to proceed with my Vatika Studio design.\n\nBudget: ${formatRs(budget)}\nDelivery: ${deliveryTier.label} (${deliveryTier.days <= 2 ? "1-2" : deliveryTier.days} days)\nEstimate: ${formatRs(discountedTotal)}${discountPct > 0 ? ` (${discountPct}% off MRP ${formatRs(rec.grandTotal)})` : ""}\nProducts: ${rec.items.map((i) => `${i.qty}x ${i.planter.name}`).join(", ")}\n\nPlease schedule a site visit.`
                )}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 rounded-lg bg-forest text-white font-medium text-center">
                Proceed via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
