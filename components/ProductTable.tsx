"use client";

import { useState } from "react";
import { ExternalLink, Star, TrendingUp, ChevronUp, ChevronDown } from "lucide-react";
import { formatRevenue } from "@/lib/revenue";
import type { AnalysisResult, EnrichedProduct } from "@/lib/types";

type SortKey = "revenue" | "price" | "rating" | "reviews";

interface ProductTableProps {
  result: AnalysisResult;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= Math.round(rating) ? "#f59e0b" : "none"}
          color={s <= Math.round(rating) ? "#f59e0b" : "var(--text-muted)"}
        />
      ))}
      <span style={{ fontSize: 12, color: "var(--text-secondary)", marginLeft: 2 }}>
        {rating > 0 ? rating.toFixed(1) : "N/A"}
      </span>
    </div>
  );
}

export function ProductTable({ result }: ProductTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...result.products].sort((a, b) => {
    let aVal = 0;
    let bVal = 0;
    switch (sortKey) {
      case "revenue": aVal = a.revenue.estimatedMonthlyRevenue; bVal = b.revenue.estimatedMonthlyRevenue; break;
      case "price": aVal = a.product.price; bVal = b.product.price; break;
      case "rating": aVal = a.product.rating; bVal = b.product.rating; break;
      case "reviews": aVal = a.product.reviewCount; bVal = b.product.reviewCount; break;
    }
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const SortIcon = ({ colKey }: { colKey: SortKey }) =>
    sortKey === colKey ? (
      sortDir === "desc" ? <ChevronDown size={12} /> : <ChevronUp size={12} />
    ) : (
      <ChevronDown size={12} style={{ opacity: 0.3 }} />
    );

  return (
    <div>
      <h2 className="section-heading" style={{ marginBottom: 20 }}>
        Product Comparison
      </h2>
      <div
        className="glass-card"
        style={{ overflow: "hidden", padding: 0 }}
      >
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 280 }}>Product</th>
                <th
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort("price")}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Price <SortIcon colKey="price" />
                  </span>
                </th>
                <th
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort("revenue")}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Est. Revenue/mo <SortIcon colKey="revenue" />
                  </span>
                </th>
                <th
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort("reviews")}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Reviews <SortIcon colKey="reviews" />
                  </span>
                </th>
                <th
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort("rating")}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Rating <SortIcon colKey="rating" />
                  </span>
                </th>
                <th>Est. Sales/mo</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((ep: EnrichedProduct, i) => (
                <tr key={ep.product.asin}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Rank */}
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background:
                            i === 0
                              ? "linear-gradient(135deg, #f59e0b, #f97316)"
                              : i === 1
                              ? "rgba(156,163,175,0.2)"
                              : i === 2
                              ? "rgba(180,83,9,0.2)"
                              : "rgba(255,255,255,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: i < 3 ? (i === 0 ? "#f59e0b" : "var(--text-secondary)") : "var(--text-muted)",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>

                      {/* Image */}
                      {ep.product.imageUrl ? (
                        <img
                          src={ep.product.imageUrl}
                          alt={ep.product.title}
                          width={40}
                          height={40}
                          style={{
                            objectFit: "contain",
                            borderRadius: 6,
                            background: "rgba(255,255,255,0.05)",
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 6,
                            background: "rgba(99,102,241,0.1)",
                            flexShrink: 0,
                          }}
                        />
                      )}

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 180,
                          }}
                          title={ep.product.title}
                        >
                          {ep.product.title || "—"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          {ep.product.isSeedProduct && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: "1px 6px",
                                background: "rgba(99,102,241,0.15)",
                                border: "1px solid rgba(99,102,241,0.3)",
                                borderRadius: 4,
                                color: "#a5b4fc",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Seed
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {ep.product.brand}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                      {ep.product.price > 0
                        ? ep.product.currency === "INR"
                          ? `₹${ep.product.price.toLocaleString("en-IN")}`
                          : `$${ep.product.price.toLocaleString()}`
                        : "—"}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <TrendingUp size={14} color="#6366f1" />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#a5b4fc",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {ep.revenue.estimatedMonthlyRevenue > 0
                          ? formatRevenue(ep.revenue.estimatedMonthlyRevenue, ep.revenue.currency)
                          : "—"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                      {ep.product.reviewCount > 0
                        ? ep.product.reviewCount.toLocaleString()
                        : "—"}
                    </span>
                  </td>

                  <td>
                    <StarRating rating={ep.product.rating} />
                  </td>

                  <td>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#10b981",
                      }}
                    >
                      {ep.revenue.estimatedMonthlySales > 0
                        ? `~${ep.revenue.estimatedMonthlySales.toLocaleString()}/mo`
                        : "—"}
                    </span>
                  </td>

                  <td>
                    <a
                      href={ep.product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: "#6366f1",
                        textDecoration: "none",
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <ExternalLink size={11} />
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
