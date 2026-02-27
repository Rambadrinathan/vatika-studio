"use client";

import { useDesignStore } from "@/lib/store";
import { DELIVERY_TIERS, getDeliveryTier } from "@/lib/catalog";

function formatRs(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

// Show only 3 key tiers to avoid decision paralysis:
// Express (no discount), a mid option, and the best deal
const VISIBLE_TIERS = [
  DELIVERY_TIERS[0], // 2 days — Express, 0%
  DELIVERY_TIERS[2], // 15 days — Made to Order, 20%
  DELIVERY_TIERS[4], // 45 days — Max savings, 50%
];

interface Props {
  originalTotal: number;
}

export default function DeliverySlider({ originalTotal }: Props) {
  const { deliveryDays, setDeliveryDays } = useDesignStore();

  const currentTier = getDeliveryTier(deliveryDays);

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-bold text-forest">
          Same garden. You choose the price.
        </h3>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Give us more time, we ship direct from the maker — no warehouse, no middlemen. You save.
      </p>

      {/* 3 Price cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {VISIBLE_TIERS.map((tier) => {
          const isActive = currentTier.days === tier.days;
          const price = Math.round(originalTotal * tier.multiplier);
          const savings = originalTotal - price;
          const isBestDeal = tier.days === 45;

          return (
            <button
              key={tier.days}
              onClick={() => setDeliveryDays(tier.days)}
              className={`relative rounded-xl p-3 text-left transition-all border-2 ${
                isActive
                  ? isBestDeal
                    ? "border-forest bg-forest/5 shadow-lg ring-2 ring-forest/20"
                    : "border-forest bg-forest/5 shadow-lg ring-2 ring-forest/20"
                  : "border-gray-200 bg-white hover:border-forest/40 hover:shadow-md"
              }`}
            >
              {/* Best deal badge */}
              {isBestDeal && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-forest text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  BEST VALUE
                </div>
              )}

              {/* Price — the hero number */}
              <div className={`text-lg font-bold leading-tight ${isActive ? "text-forest" : "text-gray-800"}`}>
                {formatRs(price)}
              </div>

              {/* Savings */}
              {tier.discount > 0 ? (
                <div className="text-[11px] font-semibold text-forest mt-0.5">
                  Save {formatRs(savings)}
                </div>
              ) : (
                <div className="text-[11px] text-gray-400 mt-0.5">
                  MRP
                </div>
              )}

              {/* Timeline pill */}
              <div className={`mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${
                isActive
                  ? "bg-forest/10 text-forest"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {tier.days <= 2 ? "1-2 days" : `${tier.days} days`}
              </div>

              {/* One-liner */}
              <div className="text-[10px] text-gray-400 mt-1.5 leading-tight">
                {tier.days <= 2
                  ? "Ready stock"
                  : tier.days <= 15
                  ? "Made fresh for you"
                  : "Direct from factory"}
              </div>
            </button>
          );
        })}
      </div>

      {/* "More options" expandable for the 2 intermediate tiers */}
      <details className="mt-2">
        <summary className="text-[11px] text-gray-400 cursor-pointer hover:text-forest transition-colors">
          More delivery options
        </summary>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {DELIVERY_TIERS.filter(
            (t) => !VISIBLE_TIERS.includes(t)
          ).map((tier) => {
            const isActive = currentTier.days === tier.days;
            const price = Math.round(originalTotal * tier.multiplier);
            return (
              <button
                key={tier.days}
                onClick={() => setDeliveryDays(tier.days)}
                className={`rounded-lg p-2.5 text-left transition-all border ${
                  isActive
                    ? "border-forest bg-forest/5"
                    : "border-gray-200 bg-white hover:border-forest/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${isActive ? "text-forest" : "text-gray-800"}`}>
                    {formatRs(price)}
                  </span>
                  <span className="text-[10px] font-medium text-forest bg-forest/10 px-1.5 py-0.5 rounded-full">
                    {tier.discount}% off
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {tier.days} days — {tier.days === 7 ? "Supplier direct" : "Zero waste, on demand"}
                </div>
              </button>
            );
          })}
        </div>
      </details>
    </div>
  );
}
