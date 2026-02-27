"use client";

import { useDesignStore } from "@/lib/store";
import { DELIVERY_TIERS } from "@/lib/catalog";

function formatRs(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

const MIN_DAYS = DELIVERY_TIERS[0].days;           // 2
const MAX_DAYS = DELIVERY_TIERS[DELIVERY_TIERS.length - 1].days; // 45

/** Interpolate discount multiplier for any day value (smooth, not stepped) */
function getMultiplierSmooth(days: number): number {
  if (days <= DELIVERY_TIERS[0].days) return DELIVERY_TIERS[0].multiplier;
  if (days >= DELIVERY_TIERS[DELIVERY_TIERS.length - 1].days)
    return DELIVERY_TIERS[DELIVERY_TIERS.length - 1].multiplier;
  // Find surrounding tiers and lerp
  for (let i = 0; i < DELIVERY_TIERS.length - 1; i++) {
    const lo = DELIVERY_TIERS[i];
    const hi = DELIVERY_TIERS[i + 1];
    if (days >= lo.days && days <= hi.days) {
      const t = (days - lo.days) / (hi.days - lo.days);
      return lo.multiplier + t * (hi.multiplier - lo.multiplier);
    }
  }
  return 1;
}

function getDiscountPct(days: number): number {
  return Math.round((1 - getMultiplierSmooth(days)) * 100);
}

/** Get a label for the current day range */
function getTimeLabel(days: number): string {
  if (days <= 2) return "Express Delivery";
  if (days <= 7) return "Supplier Direct";
  if (days <= 15) return "Made to Order";
  if (days <= 30) return "Factory Direct";
  return "Manufacturer Direct";
}

function getTimeEmoji(days: number): string {
  if (days <= 2) return "\u{26A1}";    // lightning
  if (days <= 7) return "\u{1F69A}";   // truck
  if (days <= 15) return "\u{1F3ED}";  // factory
  if (days <= 30) return "\u{2699}\uFE0F"; // gear
  return "\u{1F331}";                  // seedling
}

interface Props {
  originalTotal: number;
}

export default function DeliverySlider({ originalTotal }: Props) {
  const { deliveryDays, setDeliveryDays } = useDesignStore();

  const multiplier = getMultiplierSmooth(deliveryDays);
  const currentPrice = Math.round(originalTotal * multiplier);
  const savings = originalTotal - currentPrice;
  const discountPct = getDiscountPct(deliveryDays);
  const timePct = ((deliveryDays - MIN_DAYS) / (MAX_DAYS - MIN_DAYS)) * 100;
  // Price slider is inverse — more time = lower price = slider goes left
  const pricePct = 100 - timePct;

  return (
    <div className="rounded-2xl overflow-hidden mb-4 border border-gray-200 shadow-sm">
      {/* Header band */}
      <div className="bg-gradient-to-r from-forest to-forest-light px-5 py-3 flex items-center justify-between">
        <div className="text-white">
          <div className="text-sm font-bold">Same garden. You choose the price.</div>
          <div className="text-[11px] text-white/70">Slide to explore — more time = bigger savings</div>
        </div>
        {savings > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-center">
            <div className="text-xs font-bold leading-tight">SAVE</div>
            <div className="text-sm font-black leading-tight">{discountPct}%</div>
          </div>
        )}
      </div>

      <div className="bg-white px-5 py-5">
        {/* ── Two big hero numbers ── */}
        <div className="flex items-center justify-between mb-5">
          {/* Time */}
          <div className="text-center flex-1">
            <div className="text-3xl mb-1">{getTimeEmoji(deliveryDays)}</div>
            <div className="text-3xl font-black text-forest leading-none">
              {deliveryDays <= 2 ? "1-2" : deliveryDays}
            </div>
            <div className="text-xs font-semibold text-forest/70 uppercase tracking-wide mt-1">
              days
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">{getTimeLabel(deliveryDays)}</div>
          </div>

          {/* Center: savings burst */}
          <div className="flex-shrink-0 mx-3">
            {savings > 0 ? (
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-lg"
                  style={{
                    background: `conic-gradient(#1A3C2E ${discountPct * 3.6}deg, #E8F5E9 0deg)`,
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-white flex flex-col items-center justify-center">
                    <div className="text-forest text-lg font-black leading-none">{discountPct}%</div>
                    <div className="text-[9px] text-forest/70 font-semibold">OFF</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex flex-col items-center justify-center">
                <div className="text-gray-400 text-sm font-bold">MRP</div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-center flex-1">
            <div className="text-3xl mb-1">{"\u{1F4B0}"}</div>
            <div className="text-2xl font-black text-forest leading-none">
              {formatRs(currentPrice)}
            </div>
            {savings > 0 ? (
              <>
                <div className="text-xs text-gray-400 line-through mt-1">{formatRs(originalTotal)}</div>
                <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                  You save {formatRs(savings)}
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-400 mt-1">Full price</div>
            )}
          </div>
        </div>

        {/* ── TIME SLIDER ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-forest uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">{"\u{23F1}\uFE0F"}</span>
              Delivery Time
            </label>
            <span className="text-xs font-bold text-forest bg-sage px-2 py-0.5 rounded-full">
              {deliveryDays <= 2 ? "1-2" : deliveryDays} days
            </span>
          </div>
          <div className="relative h-10 flex items-center">
            {/* Track background with gradient */}
            <div className="absolute inset-x-0 h-3 rounded-full overflow-hidden"
              style={{ background: "linear-gradient(to right, #f59e0b, #eab308, #22c55e, #16a34a, #1A3C2E)" }}
            />
            {/* Filled portion */}
            <div
              className="absolute left-0 h-3 rounded-full"
              style={{
                width: `${timePct}%`,
                background: "linear-gradient(to right, #f59e0b, #22c55e, #1A3C2E)",
                boxShadow: "0 0 8px rgba(46, 83, 57, 0.3)",
              }}
            />
            {/* Tick marks for tier breakpoints */}
            {DELIVERY_TIERS.map((tier) => {
              const pos = ((tier.days - MIN_DAYS) / (MAX_DAYS - MIN_DAYS)) * 100;
              return (
                <div
                  key={tier.days}
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-white/80 border border-gray-300 z-10"
                  style={{ left: `${pos}%`, marginLeft: "-2px" }}
                />
              );
            })}
            <input
              type="range"
              min={MIN_DAYS}
              max={MAX_DAYS}
              step={1}
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(Number(e.target.value))}
              className="delivery-slider relative w-full h-3 appearance-none bg-transparent cursor-pointer z-20"
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 px-0.5">
            <span>Express</span>
            <span>7d</span>
            <span>15d</span>
            <span>30d</span>
            <span>45d+</span>
          </div>
        </div>

        {/* ── PRICE SLIDER (inverse, linked) ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-forest uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">{"\u{1F4B0}"}</span>
              Your Price
            </label>
            <span className="text-xs font-bold text-forest bg-sage px-2 py-0.5 rounded-full">
              {formatRs(currentPrice)}
            </span>
          </div>
          <div className="relative h-10 flex items-center">
            {/* Track background — inverse gradient (green to gold) */}
            <div className="absolute inset-x-0 h-3 rounded-full overflow-hidden"
              style={{ background: "linear-gradient(to right, #1A3C2E, #16a34a, #22c55e, #eab308, #f59e0b)" }}
            />
            {/* Filled portion (from left) */}
            <div
              className="absolute left-0 h-3 rounded-full"
              style={{
                width: `${pricePct}%`,
                background: "linear-gradient(to right, #1A3C2E, #22c55e)",
                boxShadow: "0 0 8px rgba(46, 83, 57, 0.3)",
              }}
            />
            <input
              type="range"
              min={MIN_DAYS}
              max={MAX_DAYS}
              step={1}
              value={MAX_DAYS + MIN_DAYS - deliveryDays}
              onChange={(e) => setDeliveryDays(MAX_DAYS + MIN_DAYS - Number(e.target.value))}
              className="delivery-slider relative w-full h-3 appearance-none bg-transparent cursor-pointer z-20"
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 px-0.5">
            <span>Best price</span>
            <span>Full MRP</span>
          </div>
        </div>

        {/* ── Benefit line ── */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[10px]">{"\u{1F4A1}"}</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            {deliveryDays <= 2
              ? "Express: ready stock shipped from our warehouse. Full retail price."
              : deliveryDays <= 7
              ? "We skip the warehouse and ship direct from the supplier. You save on storage costs."
              : deliveryDays <= 15
              ? "Made fresh on your order. No overproduction, no waste. Savings passed to you."
              : deliveryDays <= 30
              ? "Manufactured on demand at the factory. Zero inventory waste, zero middlemen."
              : "Direct from the factory floor. Maximum lead time = maximum savings. Every rupee of markup eliminated."}
          </p>
        </div>
      </div>
    </div>
  );
}
