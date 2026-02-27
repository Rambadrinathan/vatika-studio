"use client";

import { useDesignStore } from "@/lib/store";
import { DELIVERY_TIERS, getDeliveryTier } from "@/lib/catalog";

function formatRs(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

// Map slider index (0-4) to delivery days
const SLIDER_DAYS = DELIVERY_TIERS.map((t) => t.days);

interface Props {
  originalTotal: number;
}

export default function DeliverySlider({ originalTotal }: Props) {
  const { deliveryDays, setDeliveryDays } = useDesignStore();

  const currentTier = getDeliveryTier(deliveryDays);
  const sliderIndex = SLIDER_DAYS.indexOf(currentTier.days);
  const discountedTotal = Math.round(originalTotal * currentTier.multiplier);
  const savings = originalTotal - discountedTotal;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-bold text-forest">Delivery Timeline</h3>
        {currentTier.discount > 0 && (
          <span className="text-xs font-bold text-white bg-forest px-2.5 py-1 rounded-full">
            {currentTier.discount}% OFF
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Choose when you need it — longer wait = bigger savings
      </p>

      {/* Slider */}
      <div className="relative mb-2">
        <input
          type="range"
          min={0}
          max={SLIDER_DAYS.length - 1}
          step={1}
          value={sliderIndex}
          onChange={(e) => setDeliveryDays(SLIDER_DAYS[Number(e.target.value)])}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-forest"
          style={{
            background: `linear-gradient(to right, #2d5a3d ${(sliderIndex / (SLIDER_DAYS.length - 1)) * 100}%, #e5e7eb ${(sliderIndex / (SLIDER_DAYS.length - 1)) * 100}%)`,
          }}
        />
        {/* Tick marks */}
        <div className="flex justify-between px-0.5 mt-1">
          {DELIVERY_TIERS.map((tier, i) => (
            <button
              key={tier.days}
              onClick={() => setDeliveryDays(tier.days)}
              className={`text-[10px] font-medium transition-colors ${
                i === sliderIndex ? "text-forest font-bold" : "text-gray-400"
              }`}
            >
              {tier.days <= 2 ? "2d" : `${tier.days}d`}
            </button>
          ))}
        </div>
      </div>

      {/* Active tier info */}
      <div className="mt-3 p-3 rounded-lg bg-sage/40 border border-forest/10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-forest">
            {currentTier.label}
          </span>
          <span className="text-sm font-bold text-forest">
            {formatRs(discountedTotal)}
          </span>
        </div>
        <p className="text-xs text-gray-500">{currentTier.description}</p>
        {savings > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs line-through text-gray-400">
              {formatRs(originalTotal)}
            </span>
            <span className="text-xs font-bold text-forest bg-sage px-2 py-0.5 rounded-full">
              You save {formatRs(savings)}
            </span>
          </div>
        )}
      </div>

      {/* Explainer */}
      <details className="mt-3 text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-forest transition-colors font-medium">
          Why waiting saves you money
        </summary>
        <div className="mt-2 pl-3 border-l-2 border-forest/20 space-y-1">
          <p>Direct from manufacturer — no warehousing costs</p>
          <p>No middlemen or distributor markups</p>
          <p>Made fresh on demand — zero inventory waste</p>
          <p>Savings passed directly to you</p>
        </div>
      </details>
    </div>
  );
}
