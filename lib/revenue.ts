import type { RevenueEstimate } from "@/lib/types";

/**
 * Revenue estimation formula (no BSR data needed):
 *
 * Estimated Monthly Sales ≈ reviewCount * 0.3
 * Revenue = sales * price
 *
 * Multiplier adjusts based on rating quality:
 *  ≥ 4.5 → 1.2x (bestseller premium)
 *  ≥ 4.0 → 1.0x (average)
 *  ≥ 3.5 → 0.8x (below average)
 *  < 3.5 → 0.5x (poor performer)
 */
export function estimateRevenue(
  reviewCount: number,
  price: number,
  rating: number,
  currency = "INR"
): RevenueEstimate {
  const ratingMultiplier = rating > 0 ? rating / 5 : 0.5;
  const estimatedMonthlySales = Math.max(0, Math.round(reviewCount * 0.3 * ratingMultiplier));
  const estimatedMonthlyRevenue = Math.round(estimatedMonthlySales * price);

  let confidence: "High" | "Medium" | "Low" = "Low";
  if (reviewCount > 500) {
    confidence = "High";
  } else if (reviewCount > 100) {
    confidence = "Medium";
  }

  return {
    estimatedMonthlySales,
    estimatedMonthlyRevenue,
    currency,
    confidence,
  };
}

export function formatRevenue(amount: number, currency: string): string {
  if (currency === "INR") {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}
