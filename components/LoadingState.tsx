"use client";

import { TrendingUp, Package, Star, MessageSquare, Zap, CheckCircle, Loader2 } from "lucide-react";

type Step = {
  type: string;
  message: string;
  index?: number;
  total?: number;
  productTitle?: string;
  found?: number;
};

interface LoadingStateProps {
  steps: Step[];
  currentStep: string;
}

const STEP_ORDER = [
  "EXTRACTING_ASIN",
  "SCRAPING_SEED",
  "FINDING_COMPETITORS",
  "SCRAPING_PRODUCT",
  "SCRAPING_REVIEWS",
  "AI_ANALYSIS",
  "AGGREGATING",
];

const STEP_META: Record<string, { label: string; icon: React.ElementType }> = {
  EXTRACTING_ASIN: { label: "Extracting ASIN", icon: Package },
  SCRAPING_SEED: { label: "Scraping Seed Product", icon: TrendingUp },
  FINDING_COMPETITORS: { label: "Finding Competitors", icon: Package },
  SCRAPING_PRODUCT: { label: "Scraping Products", icon: Package },
  SCRAPING_REVIEWS: { label: "Fetching Reviews", icon: MessageSquare },
  AI_ANALYSIS: { label: "AI Analysis", icon: Zap },
  AGGREGATING: { label: "Aggregating Insights", icon: Star },
};

export function LoadingState({ steps, currentStep }: LoadingStateProps) {
  const completedTypes = new Set(steps.map((s) => s.type));
  const currentMeta = STEP_META[currentStep];

  // Progress calculation
  const currentIdx = STEP_ORDER.indexOf(currentStep);
  const progress = currentIdx >= 0 ? Math.round(((currentIdx + 0.5) / STEP_ORDER.length) * 100) : 10;

  // Latest per-product step
  const latestStep = steps[steps.length - 1];

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "60px 24px",
        textAlign: "center",
      }}
    >
      {/* Animated spinner */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 32px",
          boxShadow: "0 0 40px rgba(99,102,241,0.4)",
          animation: "pulse-glow 2s ease-in-out infinite",
        }}
      >
        <Loader2 size={36} color="white" style={{ animation: "spin 1.5s linear infinite" }} />
      </div>

      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 8,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        Analyzing your market...
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 40 }}>
        {latestStep?.message || "Initializing analysis pipeline..."}
        {latestStep?.productTitle && (
          <span
            style={{
              display: "block",
              marginTop: 4,
              fontSize: 13,
              color: "#a5b4fc",
              fontStyle: "italic",
            }}
          >
            "{latestStep.productTitle}..."
          </span>
        )}
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {currentMeta?.label || "Processing..."}
          </span>
          <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>
            {progress}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step checklist */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          textAlign: "left",
        }}
      >
        {STEP_ORDER.map((stepType) => {
          const meta = STEP_META[stepType];
          const isCompleted = completedTypes.has(stepType) && currentStep !== stepType;
          const isCurrent = currentStep === stepType;
          const isPending = !completedTypes.has(stepType) && !isCurrent;
          const Icon = meta.icon;

          return (
            <div
              key={stepType}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                borderRadius: 10,
                background: isCurrent
                  ? "rgba(99,102,241,0.1)"
                  : isCompleted
                  ? "rgba(16,185,129,0.05)"
                  : "transparent",
                border: `1px solid ${
                  isCurrent
                    ? "rgba(99,102,241,0.3)"
                    : isCompleted
                    ? "rgba(16,185,129,0.15)"
                    : "transparent"
                }`,
                transition: "all 0.3s ease",
              }}
            >
              {isCompleted ? (
                <CheckCircle size={18} color="#10b981" />
              ) : isCurrent ? (
                <Loader2
                  size={18}
                  color="#6366f1"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Icon size={18} color="var(--text-muted)" />
              )}
              <span
                style={{
                  fontSize: 14,
                  color: isCurrent
                    ? "var(--text-primary)"
                    : isCompleted
                    ? "#10b981"
                    : "var(--text-muted)",
                  fontWeight: isCurrent ? 500 : 400,
                }}
              >
                {meta.label}
              </span>
              {isCurrent && latestStep?.index && latestStep?.total && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: "#6366f1",
                    fontWeight: 600,
                  }}
                >
                  {latestStep.index}/{latestStep.total}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(99,102,241,0.4); }
          50% { box-shadow: 0 0 60px rgba(99,102,241,0.6); }
        }
      `}</style>
    </div>
  );
}
