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
  let multiplier = 1.0;
  if (rating >= 4.5) multiplier = 1.2;
  else if (rating >= 4.0) multiplier = 1.0;
  else if (rating >= 3.5) multiplier = 0.8;
  else multiplier = 0.5;

  const estimatedMonthlySales = Math.round(reviewCount * 0.3 * multiplier);
  const estimatedMonthlyRevenue = Math.round(estimatedMonthlySales * price);

  return {
    estimatedMonthlySales,
    estimatedMonthlyRevenue,
    currency,
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
