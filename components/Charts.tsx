"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { AnalysisResult } from "@/lib/types";

interface ChartsProps {
  result: AnalysisResult;
}

const SENTIMENT_COLORS = ["#10b981", "#6366f1", "#f43f5e"];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-bright)",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 13,
        }}
      >
        <div style={{ fontWeight: 600, color: payload[0].payload.fill }}>
          {payload[0].name}
        </div>
        <div style={{ color: "var(--text-secondary)" }}>{payload[0].value}%</div>
      </div>
    );
  }
  return null;
};

export function Charts({ result }: ChartsProps) {
  const { aggregatedInsights, products } = result;

  // Aggregate sentiment across all products
  const avgSentiment = aggregatedInsights.marketSentiment;
  const sentimentData = [
    { name: "Positive", value: avgSentiment.positive, fill: "#10b981" },
    { name: "Neutral", value: avgSentiment.neutral, fill: "#6366f1" },
    { name: "Negative", value: avgSentiment.negative, fill: "#f43f5e" },
  ];

  // Feature importance bar data
  const featureData = aggregatedInsights.topBuyingFactors.slice(0, 6).map((f) => ({
    name:
      f.factor.length > 18 ? f.factor.substring(0, 18) + "…" : f.factor,
    value: f.mentionPct,
  }));

  // Revenue by product bar data
  const revenueData = products
    .filter((p) => p.revenue.estimatedMonthlyRevenue > 0)
    .slice(0, 8)
    .map((p) => ({
      name:
        p.product.title.split(" ").slice(0, 3).join(" ") +
        (p.product.isSeedProduct ? " ★" : ""),
      revenue: p.revenue.estimatedMonthlyRevenue,
      fill: p.product.isSeedProduct ? "#6366f1" : "#8b5cf6",
    }));

  return (
    <div>
      <h2 className="section-heading" style={{ marginBottom: 20 }}>
        Analytics
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: 16,
        }}
      >
        {/* Sentiment Pie */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>
            Market Sentiment
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
            Aggregated across all products
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={SENTIMENT_COLORS[index]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {sentimentData.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.fill }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: s.fill }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Bar Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>
            Est. Monthly Revenue by Product
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
            ★ = Seed product
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 60 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  if (v >= 100000) return `${(v / 100000).toFixed(0)}L`;
                  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                  return String(v);
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-bright)",
                  borderRadius: 10,
                  fontSize: 13,
                }}
                formatter={(value) => [
                  typeof value === "number" ? `₹${(value / 100000).toFixed(1)}L` : value,
                  "Est. Revenue",
                ]}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {revenueData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Importance */}
      {featureData.length > 0 && (
        <div className="glass-card" style={{ padding: 24, marginTop: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>
            Feature Importance (Buying Factors)
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
            % of products where this factor was mentioned
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={featureData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-bright)",
                  borderRadius: 10,
                  fontSize: 13,
                }}
                formatter={(v) => [`${v}%`, "Mention Rate"]}
              />
              <Bar
                dataKey="value"
                fill="url(#featureGradient)"
                radius={[0, 6, 6, 0]}
                background={{ fill: "rgba(255,255,255,0.03)", radius: 6 }}
              />
              <defs>
                <linearGradient id="featureGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
