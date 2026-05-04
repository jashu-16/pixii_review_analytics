"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Zap,
  TrendingUp,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
} from "lucide-react";

const EXAMPLE_URLS = [
  "https://www.amazon.in/dp/B09X7FXHVJ",
  "https://www.amazon.in/dp/B08L5TNJHG",
  "https://www.amazon.in/dp/B0BTLB7QXB",
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Revenue Intelligence",
    desc: "Estimate monthly sales & revenue for every competitor with our proprietary formula",
    color: "#6366f1",
  },
  {
    icon: MessageSquare,
    title: "AI Review Analysis",
    desc: "Our AI engine extracts buying reasons, complaints & decision factors from hundreds of reviews",
    color: "#8b5cf6",
  },
  {
    icon: BarChart3,
    title: "Sentiment Breakdown",
    desc: "Visual sentiment analysis — positive, neutral, negative percentages per product",
    color: "#06b6d4",
  },
  {
    icon: Shield,
    title: "Market Overview",
    desc: "Total addressable market size, average price, and aggregated insights across 10 products",
    color: "#10b981",
  },
];

const STEPS = [
  { step: "01", title: "Paste URL", desc: "Any Amazon.in product link" },
  { step: "02", title: "AI Scrapes", desc: "10 products + 100+ reviews each" },
  { step: "03", title: "Deep Analysis", desc: "Our AI extracts critical market insights" },
  { step: "04", title: "Dashboard", desc: "Revenue, sentiment, drivers" },
];

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!url) { setIsValid(null); return; }
    const amazonPattern = /amazon\.([a-z\.]{2,6})\/.*dp\/[A-Z0-9]{10}/i;
    const asinPattern = /[A-Z0-9]{10}/;
    setIsValid(amazonPattern.test(url) || asinPattern.test(url));
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) { setError("Please enter an Amazon product URL"); return; }
    if (isValid === false) { setError("Please enter a valid Amazon product URL"); return; }
    setError("");
    setIsLoading(true);
    // Store URL and navigate to dashboard
    sessionStorage.setItem("analyzeUrl", url.trim());
    sessionStorage.setItem("triggerAnalysis", "true");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden">
      {/* Ambient glows */}
      <div
        style={{
          position: "fixed",
          top: "10%",
          left: "20%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "10%",
          right: "15%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Navbar */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 40px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={16} color="white" />
            </div>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.01em",
              }}
            >
              Pixii <span style={{ color: "#6366f1" }}>Analytics</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Grow Your Amazon Brand
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 20,
                fontSize: 12,
                color: "#10b981",
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#10b981",
                  animation: "pulse 2s infinite",
                }}
              />
              Live
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "80px 24px 40px",
            textAlign: "center",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 20,
              fontSize: 13,
              color: "#a5b4fc",
              fontWeight: 500,
              marginBottom: 32,
              opacity: 0,
              animation: "revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <Zap size={13} />
            Amazon Competitor Intelligence Platform
          </div>

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 24,
              color: "var(--text-primary)",
              opacity: 0,
              animation: "revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards",
            }}
          >
            Decode your{" "}
            <span className="gradient-text">Amazon market</span>
            <br />
            in seconds
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              maxWidth: 600,
              margin: "0 auto 48px",
              opacity: 0,
              animation: "revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards",
            }}
          >
            Paste one Amazon product URL. Get revenue estimates, AI-extracted
            purchase drivers, complaints & sentiment for{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              10 competing products
            </strong>
            .
          </p>

          {/* Input Form */}
          <form onSubmit={handleSubmit} style={{ maxWidth: 680, margin: "0 auto", opacity: 0, animation: "revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards" }}>
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: "8px 8px 8px 20px",
                background: "var(--bg-secondary)",
                border: `1.5px solid ${
                  isValid === true
                    ? "rgba(16,185,129,0.4)"
                    : isValid === false
                    ? "rgba(244,63,94,0.4)"
                    : "rgba(255,255,255,0.1)"
                }`,
                borderRadius: 16,
                boxShadow: isValid === true
                  ? "0 0 30px rgba(16,185,129,0.1)"
                  : "0 0 30px rgba(0,0,0,0.3)",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                alignItems: "center",
              }}
            >
              <Search size={18} color={isValid === true ? "#10b981" : "var(--text-muted)"} />
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                placeholder="Paste Amazon product URL (e.g., amazon.in/dp/XXXXXXXXXX)"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 15,
                  color: "var(--text-primary)",
                  fontFamily: "'Inter', sans-serif",
                }}
                id="amazon-url-input"
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                id="analyze-btn"
                style={{ padding: "12px 24px", flexShrink: 0 }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Analyze Market
                    <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </div>
            {error && (
              <p style={{ marginTop: 10, fontSize: 13, color: "#f43f5e", textAlign: "left" }}>
                {error}
              </p>
            )}
          </form>

          {/* Example URLs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 20,
              flexWrap: "wrap",
              opacity: 0,
              animation: "revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Try an example:</span>
            {EXAMPLE_URLS.map((exUrl, i) => (
              <button
                key={i}
                onClick={() => { setUrl(exUrl); setError(""); }}
                style={{
                  fontSize: 12,
                  color: "#6366f1",
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                id={`example-url-${i + 1}`}
              >
                Example {i + 1}
              </button>
            ))}
          </div>
        </div>



        {/* Features Grid */}
        <div style={{ maxWidth: 1100, margin: "0 auto 80px", padding: "0 24px" }}>
          <h2
            style={{
              textAlign: "center",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 40,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Everything you need to outmaneuver competitors
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="glass-card"
                  style={{ padding: "28px 32px", display: "flex", gap: 20, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${feat.color}18`,
                      border: `1px solid ${feat.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={feat.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
                      {feat.title}
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 60,
              flexWrap: "wrap",
              maxWidth: 700,
              margin: "0 auto",
            }}
          >
            {[
              { value: "10", label: "Products Analyzed" },
              { value: "100+", label: "Reviews per Product" },
              { value: "< 60s", label: "Full Analysis Time" },
              { value: "AI", label: "Actionable Market Insights" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  className="gradient-text"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 32,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            padding: "24px",
            borderTop: "1px solid var(--border)",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            © {new Date().getFullYear()} Pixii Growth Advisor. Accelerating Amazon sellers worldwide.
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
