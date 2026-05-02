export interface ProductData {
  asin: string;
  title: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  url: string;
  brand: string;
  isSeedProduct: boolean;
}

export interface Review {
  title: string;
  body: string;
  rating: number;
  date: string;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface DecisionFactor {
  factor: string;
  importance: "high" | "medium" | "low";
  mentionCount: number;
}

export interface ProductAnalysis {
  asin: string;
  topBuyingReasons: string[];
  topComplaints: string[];
  decisionFactors: DecisionFactor[];
  sentimentBreakdown: SentimentBreakdown;
  summary: string;
}

export interface RevenueEstimate {
  estimatedMonthlySales: number;
  estimatedMonthlyRevenue: number;
  currency: string;
  confidence: "High" | "Medium" | "Low";
}

export interface EnrichedProduct {
  product: ProductData;
  revenue: RevenueEstimate;
  analysis: ProductAnalysis | null;
  reviewCount: number;
}

export interface Recommendation {
  title: string;
  reason: string;
  action: string;
  priority: "high" | "medium" | "low";
}

export interface Opportunity {
  title: string;
  insight: string;
  action: string;
}

export interface ReviewCluster {
  theme: string;
  percentage: number;
}

export interface AggregatedInsights {
  topBuyingFactors: Array<{ factor: string; mentionPct: number }>;
  topComplaints: Array<{ complaint: string; mentionPct: number }>;
  marketSentiment: SentimentBreakdown;
  keyDecisionFactors: DecisionFactor[];
  recommendations: Recommendation[];
  opportunities: Opportunity[];
  strategy: string;
  reviewClusters: ReviewCluster[];
}

export interface BenchmarkStats {
  your_product: number;
  market_avg: number;
  status: "strong" | "good" | "below";
}

export interface Benchmark {
  rating: BenchmarkStats;
  price: BenchmarkStats;
  reviews: BenchmarkStats;
}

export interface AnalysisResult {
  seedAsin: string;
  products: EnrichedProduct[];
  aggregatedInsights: AggregatedInsights;
  benchmark: Benchmark;
  marketStats: {
    totalMonthlyRevenue: number;
    avgPrice: number;
    avgRating: number;
    totalReviews: number;
    currency: string;
  };
  analyzedAt: string;
}

export type ProgressStep =
  | { type: "EXTRACTING_ASIN"; message: string }
  | { type: "SCRAPING_SEED"; message: string }
  | { type: "FINDING_COMPETITORS"; message: string; found: number }
  | { type: "SCRAPING_PRODUCT"; message: string; index: number; total: number; productTitle: string }
  | { type: "SCRAPING_REVIEWS"; message: string; index: number; total: number; productTitle: string }
  | { type: "AI_ANALYSIS"; message: string; index: number; total: number; productTitle: string }
  | { type: "AGGREGATING"; message: string }
  | { type: "COMPLETE"; result: AnalysisResult }
  | { type: "ERROR"; message: string };
