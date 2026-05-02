"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, RefreshCw, Sparkles } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { MarketOverview } from "@/components/MarketOverview";
import { ProductTable } from "@/components/ProductTable";
import { InsightsPanel } from "@/components/InsightsPanel";
import { Charts } from "@/components/Charts";
import { ProductDeepDive } from "@/components/ProductDeepDive";
import type { ProgressStep, AnalysisResult } from "@/lib/types";

type Step = Exclude<ProgressStep, { type: "COMPLETE" } | { type: "ERROR" }>;

export default function DashboardPage() {
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState("EXTRACTING_ASIN");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "table" | "insights" | "charts" | "deepdive">("overview");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const url = sessionStorage.getItem("analyzeUrl");
    if (!url) {
      router.replace("/");
      return;
    }
    startAnalysis(url);

    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const startAnalysis = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSteps([]);
    setCurrentStep("EXTRACTING_ASIN");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const step: ProgressStep = JSON.parse(line.slice(6));

            if (step.type === "COMPLETE") {
              setResult(step.result);
              setIsLoading(false);
              return;
            }

            if (step.type === "ERROR") {
              setError(step.message);
              setIsLoading(false);
              return;
            }

            setCurrentStep(step.type);
            setSteps((prev) => [...prev, step as Step]);
          } catch { /* malformed SSE line */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(`Connection error: ${(err as Error).message}`);
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    abortRef.current?.abort();
    router.push("/");
  };

  const handleReanalyze = () => {
    const url = sessionStorage.getItem("analyzeUrl");
    if (url) startAnalysis(url);
  };

  const handleExport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pixii-analysis-${result.seedAsin}-${Date.now()}.json`;
    a.click();
  };

  const TABS = [
    { key: "overview", label: "Market Overview" },
    { key: "table", label: "Product Comparison" },
    { key: "insights", label: "AI Insights" },
    { key: "charts", label: "Analytics" },
    { key: "deepdive", label: "Deep Dive" },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Top Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: "1px solid var(--border)",
          background: "rgba(5,5,8,0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s ease",
            }}
            id="back-btn"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={14} color="white" />
            </div>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Pixii{" "}
              <span style={{ color: "#6366f1" }}>Growth Advisor</span>
            </span>
          </div>
        </div>

        {result && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleReanalyze}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
              }}
              id="reanalyze-btn"
            >
              <RefreshCw size={13} />
              Re-analyze
            </button>
            <button
              onClick={handleExport}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: 8,
                color: "#a5b4fc",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
              }}
              id="export-btn"
            >
              <Download size={13} />
              Export JSON
            </button>
          </div>
        )}
      </nav>

      {/* Content */}
      <div style={{ padding: "32px" }}>
        {isLoading && !error && (
          <LoadingState steps={steps} currentStep={currentStep} />
        )}

        {error && (
          <div
            style={{
              maxWidth: 500,
              margin: "60px auto",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 28,
              }}
            >
              ⚠️
            </div>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 12,
                color: "var(--text-primary)",
              }}
            >
              Analysis Failed
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                marginBottom: 28,
                lineHeight: 1.6,
              }}
            >
              {error}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={handleBack} className="btn-primary" style={{ padding: "10px 20px" }}>
                Go Back
              </button>
              <button onClick={handleReanalyze} className="btn-primary" style={{ padding: "10px 20px", background: "rgba(255,255,255,0.08)" }}>
                Retry
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="fade-in-up">
            {/* Result header */}
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                  flexWrap: "wrap",
                }}
              >
                <h1
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "var(--text-primary)",
                  }}
                >
                  Analysis Complete
                </h1>
                <div className="stat-badge positive">
                  ✓ {result.products.length} Products
                </div>
                <div className="stat-badge neutral">
                  ASIN: {result.seedAsin}
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                Analyzed{" "}
                {new Date(result.analyzedAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: 4,
                marginBottom: 28,
                background: "var(--bg-secondary)",
                padding: 4,
                borderRadius: 12,
                width: "fit-content",
                flexWrap: "wrap",
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  id={`tab-${tab.key}`}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "Inter, sans-serif",
                    transition: "all 0.15s ease",
                    background:
                      activeTab === tab.key
                        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                        : "transparent",
                    color:
                      activeTab === tab.key
                        ? "white"
                        : "var(--text-secondary)",
                    boxShadow:
                      activeTab === tab.key
                        ? "0 2px 10px rgba(99,102,241,0.3)"
                        : "none",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div>
              {activeTab === "overview" && <MarketOverview result={result} />}
              {activeTab === "table" && <ProductTable result={result} />}
              {activeTab === "insights" && <InsightsPanel result={result} />}
              {activeTab === "charts" && <Charts result={result} />}
              {activeTab === "deepdive" && <ProductDeepDive result={result} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
