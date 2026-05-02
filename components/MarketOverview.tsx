"use client";

import { TrendingUp, Package, Star, BarChart3 } from "lucide-react";
import { formatRevenue } from "@/lib/revenue";
import type { AnalysisResult } from "@/lib/types";

interface MarketOverviewProps {
  result: AnalysisResult;
}

export function MarketOverview({ result }: MarketOverviewProps) {
  const { marketStats } = result;

  const cards = [
    {
      icon: TrendingUp,
      label: "Total Est. Monthly Revenue",
      value: formatRevenue(marketStats.totalMonthlyRevenue, marketStats.currency),
      sub: `across ${result.products.length} products`,
      color: "#6366f1",
      glowColor: "rgba(99,102,241,0.15)",
    },
    {
      icon: Package,
      label: "Average Price",
      value:
        marketStats.currency === "INR"
          ? `₹${marketStats.avgPrice.toLocaleString("en-IN")}`
          : `$${marketStats.avgPrice.toLocaleString()}`,
      sub: "median market pricing",
      color: "#8b5cf6",
      glowColor: "rgba(139,92,246,0.15)",
    },
    {
      icon: Star,
      label: "Average Rating",
      value: `${marketStats.avgRating} / 5.0`,
      sub: "across all products",
      color: "#f59e0b",
      glowColor: "rgba(245,158,11,0.15)",
    },
    {
      icon: BarChart3,
      label: "Total Reviews Analyzed",
      value: marketStats.totalReviews.toLocaleString(),
      sub: "data points from Amazon",
      color: "#10b981",
      glowColor: "rgba(16,185,129,0.15)",
    },
  ];

  return (
    <div>
      <h2 className="section-heading" style={{ marginBottom: 20 }}>
        Market Overview
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="glass-card fade-in-up"
              style={{
                padding: "24px",
                animationDelay: `${i * 80}ms`,
                animationFillMode: "both",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Background glow */}
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: card.glowColor,
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${card.color}18`,
                    border: `1px solid ${card.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} color={card.color} />
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                  {card.label}
                </span>
              </div>

              <div
                className="metric-value"
                style={{ color: card.color, marginBottom: 4 }}
              >
                {card.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{card.sub}</div>
            </div>
          );
        })}
      </div>
      <h2 className="section-heading" style={{ marginTop: 40, marginBottom: 20 }}>
        🎯 Winning Market Strategy
      </h2>
      <div
        className="glass-card"
        style={{
          padding: "24px 32px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))",
          borderLeft: "4px solid #6366f1",
        }}
      >
        <p style={{ fontSize: 18, color: "var(--text-primary)", lineHeight: 1.6, fontWeight: 500 }}>
          {result.aggregatedInsights.strategy || "Gathering market insights..."}
        </p>
      </div>

      {result.benchmark && (
        <>
          <h2 className="section-heading" style={{ marginTop: 40, marginBottom: 20 }}>
            ⚔️ Your Product vs Market
          </h2>
          <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>Metric</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>Your Product</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>Market Average</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Rating", key: "rating" as const, format: (v: number) => v.toFixed(1) },
                  { label: "Price", key: "price" as const, format: (v: number) => `₹${v.toLocaleString()}` },
                  { label: "Reviews", key: "reviews" as const, format: (v: number) => v.toLocaleString() },
                ].map((row, i) => {
                  const b = result.benchmark[row.key];
                  const isRed = b.status === "below";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: 500 }}>{row.label}</td>
                      <td style={{ padding: "16px 24px", color: "var(--text-primary)" }}>{row.format(b.your_product)}</td>
                      <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{row.format(b.market_avg)}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            background: isRed ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                            color: isRed ? "#ef4444" : "#22c55e",
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
