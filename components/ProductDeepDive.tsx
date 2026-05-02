"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import type { AnalysisResult, EnrichedProduct } from "@/lib/types";

interface ProductDeepDiveProps {
  result: AnalysisResult;
}

function ProductCard({ ep, index }: { ep: EnrichedProduct; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const { product, analysis } = ep;

  return (
    <div
      className="glass-card"
      style={{
        overflow: "hidden",
        transition: "all 0.2s ease",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Rank */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background:
              index === 0
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: index === 0 ? "white" : "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>

        {/* Image */}
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.title}
            width={36}
            height={36}
            style={{
              objectFit: "contain",
              borderRadius: 6,
              flexShrink: 0,
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.title || "Unknown Product"}
            {product.isSeedProduct && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "1px 6px",
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: 4,
                  color: "#a5b4fc",
                }}
              >
                SEED
              </span>
            )}
          </div>
          {analysis?.summary && (
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {analysis.summary}
            </div>
          )}
        </div>

        {/* Chevron */}
        <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded Content */}
      {open && analysis && (
        <div
          style={{
            padding: "0 20px 20px",
            borderTop: "1px solid var(--border)",
            paddingTop: 20,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Buying Reasons */}
            <div
              style={{
                background: "rgba(16,185,129,0.05)",
                border: "1px solid rgba(16,185,129,0.15)",
                borderRadius: 10,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#10b981",
                }}
              >
                <ThumbsUp size={13} />
                Why People Buy
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {analysis.topBuyingReasons.map((reason, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", marginTop: 2 }}>
                      ✓
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Complaints */}
            <div
              style={{
                background: "rgba(244,63,94,0.05)",
                border: "1px solid rgba(244,63,94,0.15)",
                borderRadius: 10,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#f43f5e",
                }}
              >
                <ThumbsDown size={13} />
                Common Complaints
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {analysis.topComplaints.map((complaint, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#f43f5e", marginTop: 2 }}>
                      ✗
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      {complaint}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sentiment + Summary */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <span className="stat-badge positive">
                😊 {analysis.sentimentBreakdown.positive}%
              </span>
              <span className="stat-badge neutral">
                😐 {analysis.sentimentBreakdown.neutral}%
              </span>
              <span className="stat-badge negative">
                😞 {analysis.sentimentBreakdown.negative}%
              </span>
            </div>
          </div>
        </div>
      )}

      {open && !analysis && (
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13 }}>
          No AI analysis available for this product.
        </div>
      )}
    </div>
  );
}

export function ProductDeepDive({ result }: ProductDeepDiveProps) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <h2 className="section-heading">Per-Product Deep Dive</h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "#a5b4fc",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 20,
            padding: "3px 10px",
          }}
        >
          <Sparkles size={11} />
          AI-Powered
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {result.products.map((ep, i) => (
          <ProductCard key={ep.product.asin} ep={ep} index={i} />
        ))}
      </div>
    </div>
  );
}
