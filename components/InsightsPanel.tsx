"use client";

import { TrendingUp, AlertCircle, Target } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

interface InsightsPanelProps {
  result: AnalysisResult;
}

export function InsightsPanel({ result }: InsightsPanelProps) {
  const { aggregatedInsights } = result;

  return (
    <div>
      <h2 className="section-heading" style={{ marginBottom: 20 }}>
        Market Insights
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {/* Top Buying Factors */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={16} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                Top Buying Factors
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Why customers purchase
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {aggregatedInsights.topBuyingFactors.map((item, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#10b981",
                        minWidth: 16,
                        marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.4 }}>
                      {item.factor}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#10b981",
                      flexShrink: 0,
                    }}
                  >
                    {item.mentionPct}%
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 3 }}>
                  <div
                    style={{
                      width: `${item.mentionPct}%`,
                      height: "100%",
                      borderRadius: 2,
                      background: "linear-gradient(90deg, #10b981, #06b6d4)",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
            ))}
            {aggregatedInsights.topBuyingFactors.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                No buying factors extracted yet.
              </p>
            )}
          </div>
        </div>

        {/* Top Complaints */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertCircle size={16} color="#f43f5e" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                Common Complaints
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Market-wide pain points
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {aggregatedInsights.topComplaints.map((item, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#f43f5e",
                        minWidth: 16,
                        marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.4 }}>
                      {item.complaint}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#f43f5e",
                      flexShrink: 0,
                    }}
                  >
                    {item.mentionPct}%
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 3 }}>
                  <div
                    style={{
                      width: `${item.mentionPct}%`,
                      height: "100%",
                      borderRadius: 2,
                      background: "linear-gradient(90deg, #f43f5e, #f97316)",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
            ))}
            {aggregatedInsights.topComplaints.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                No complaints extracted yet.
              </p>
            )}
          </div>
        </div>

        {/* Key Decision Factors */}
        {aggregatedInsights.keyDecisionFactors.length > 0 && (
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Target size={16} color="#6366f1" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                  Decision Factors
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  What matters most to buyers
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {aggregatedInsights.keyDecisionFactors.map((factor, i) => {
                const importanceColor =
                  factor.importance === "high"
                    ? "#6366f1"
                    : factor.importance === "medium"
                    ? "#8b5cf6"
                    : "var(--text-muted)";
                return (
                  <div
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      background: `${importanceColor}10`,
                      border: `1px solid ${importanceColor}25`,
                      borderRadius: 20,
                      fontSize: 13,
                      color: importanceColor,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: importanceColor,
                      }}
                    />
                    {factor.factor}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
