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
    </div>
  );
}
