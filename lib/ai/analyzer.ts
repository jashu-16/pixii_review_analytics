import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Review, AggregatedInsights, Recommendation, Opportunity, ReviewCluster } from "@/lib/types";

function getGemini() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
}

const SYSTEM_INSTRUCTION = `You are an expert product analyst and AI Growth Advisor specializing in Amazon marketplace competitive intelligence. 
Analyze customer reviews and return structured JSON business insights. Be precise, actionable, and data-driven.
Focus on business insights, not generic summaries.`;

async function processBatch(reviews: Review[]): Promise<any> {
  const prompt = `Analyze these ${reviews.length} Amazon customer reviews for competitor products in this market.

REVIEWS:
${reviews.map((r, i) => `[${i + 1}] Rating: ${r.rating}/5\nTitle: ${r.title}\nReview: ${r.body}`).join("\n\n---\n\n")}

Analyze the reviews and return structured insights based on the schema.
Rules:
- topBuyingFactors: Top 5 specific reasons customers buy these products.
- topComplaints: Top 5 specific issues customers complain about.
- decisionFactors: 5-7 key factors (e.g., "Battery Life", "Build Quality") and count how many reviews mention them.
- importance must be exactly: "high", "medium", or "low".
- sentimentBreakdown: Must sum to exactly 100.
- mentionPct: Approximate percentage of reviews mentioning the factor (0-100).
- recommendations: 3 actionable recommendations to win the market. priority="high|medium|low".
- opportunities: 2 market gaps to exploit based on competitor weaknesses.
- strategy: 3-4 powerful lines summarizing how a new product can dominate this category.
- reviewClusters: Cluster the reviews into 4-5 core themes (e.g., "Quality", "Design") and their percentage of discussion.
- Be specific, actionable, and business-focused.`;

  try {
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            topBuyingFactors: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  factor: { type: SchemaType.STRING },
                  mentionPct: { type: SchemaType.NUMBER },
                },
              },
            },
            topComplaints: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  complaint: { type: SchemaType.STRING },
                  mentionPct: { type: SchemaType.NUMBER },
                },
              },
            },
            decisionFactors: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  factor: { type: SchemaType.STRING },
                  importance: { type: SchemaType.STRING },
                  mentionCount: { type: SchemaType.NUMBER },
                },
              },
            },
            sentimentBreakdown: {
              type: SchemaType.OBJECT,
              properties: {
                positive: { type: SchemaType.NUMBER },
                neutral: { type: SchemaType.NUMBER },
                negative: { type: SchemaType.NUMBER },
              },
            },
            recommendations: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  reason: { type: SchemaType.STRING },
                  action: { type: SchemaType.STRING },
                  priority: { type: SchemaType.STRING },
                },
              },
            },
            opportunities: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  insight: { type: SchemaType.STRING },
                  action: { type: SchemaType.STRING },
                },
              },
            },
            strategy: { type: SchemaType.STRING },
            reviewClusters: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  theme: { type: SchemaType.STRING },
                  percentage: { type: SchemaType.NUMBER },
                },
              },
            },
          },
        },
      },
    });

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.error("Gemini batch JSON parse error:", parseErr);
      console.error("Raw text was:", text);
      return null;
    }
  } catch (err) {
    console.error("Gemini batch analysis error:", err);
    return null;
  }
}

export async function analyzeMarketReviews(
  allReviews: Review[]
): Promise<AggregatedInsights> {
  const defaultInsight = {
    topBuyingFactors: [],
    topComplaints: [],
    marketSentiment: { positive: 60, neutral: 25, negative: 15 },
    keyDecisionFactors: [],
    recommendations: [],
    opportunities: [],
    strategy: "Analysis could not generate a valid strategy.",
    reviewClusters: [],
  };

  if (allReviews.length === 0) {
    return defaultInsight;
  }

  const CHUNK_SIZE = 50;
  const batches: Review[][] = [];
  for (let i = 0; i < allReviews.length; i += CHUNK_SIZE) {
    batches.push(allReviews.slice(i, i + CHUNK_SIZE));
  }

  const batchesToProcess = batches.slice(0, 4);

  const batchResults = await Promise.all(
    batchesToProcess.map((batch) => processBatch(batch))
  );

  const validResults = batchResults.filter((r) => r !== null);

  if (validResults.length === 0) {
    return defaultInsight;
  }

  let pos = 0, neu = 0, neg = 0;
  const factorMap = new Map<string, { total: number; count: number }>();
  const buyMap = new Map<string, number[]>();
  const complaintMap = new Map<string, number[]>();
  const clusterMap = new Map<string, number[]>();
  
  let allRecs: Recommendation[] = [];
  let allOpps: Opportunity[] = [];
  let strategies: string[] = [];

  for (const res of validResults) {
    pos += res.sentimentBreakdown?.positive || 0;
    neu += res.sentimentBreakdown?.neutral || 0;
    neg += res.sentimentBreakdown?.negative || 0;

    (res.decisionFactors || []).forEach((f: any) => {
      const key = f.factor.toLowerCase();
      const existing = factorMap.get(key);
      if (existing) {
        existing.total += f.mentionCount;
        existing.count += 1;
      } else {
        factorMap.set(key, { total: f.mentionCount, count: 1 });
      }
    });

    (res.topBuyingFactors || []).forEach((f: any) => {
      const key = f.factor.toLowerCase();
      if (!buyMap.has(key)) buyMap.set(key, []);
      buyMap.get(key)!.push(f.mentionPct);
    });

    (res.topComplaints || []).forEach((c: any) => {
      const key = c.complaint.toLowerCase();
      if (!complaintMap.has(key)) complaintMap.set(key, []);
      complaintMap.get(key)!.push(c.mentionPct);
    });
    
    (res.reviewClusters || []).forEach((c: any) => {
      const key = c.theme.toLowerCase();
      if (!clusterMap.has(key)) clusterMap.set(key, []);
      clusterMap.get(key)!.push(c.percentage);
    });

    if (res.recommendations) allRecs.push(...res.recommendations);
    if (res.opportunities) allOpps.push(...res.opportunities);
    if (res.strategy) strategies.push(res.strategy);
  }

  const numBatches = validResults.length;
  const marketSentiment = {
    positive: Math.round(pos / numBatches),
    neutral: Math.round(neu / numBatches),
    negative: Math.round(neg / numBatches),
  };

  const totalSent = marketSentiment.positive + marketSentiment.neutral + marketSentiment.negative;
  if (totalSent !== 100 && totalSent > 0) {
    const diff = 100 - totalSent;
    marketSentiment.positive += diff;
  }

  const keyDecisionFactors = Array.from(factorMap.entries())
    .map(([factor, data]) => ({
      factor: factor.charAt(0).toUpperCase() + factor.slice(1),
      importance: (data.count >= 2 ? "high" : "medium") as "high" | "medium" | "low",
      mentionCount: data.total,
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 7);

  const topBuyingFactors = Array.from(buyMap.entries())
    .map(([factor, pcts]) => ({
      factor: factor.charAt(0).toUpperCase() + factor.slice(1),
      mentionPct: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
    }))
    .sort((a, b) => b.mentionPct - a.mentionPct)
    .slice(0, 5);

  const topComplaints = Array.from(complaintMap.entries())
    .map(([complaint, pcts]) => ({
      complaint: complaint.charAt(0).toUpperCase() + complaint.slice(1),
      mentionPct: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
    }))
    .sort((a, b) => b.mentionPct - a.mentionPct)
    .slice(0, 5);
    
  const reviewClusters = Array.from(clusterMap.entries())
    .map(([theme, pcts]) => ({
      theme: theme.charAt(0).toUpperCase() + theme.slice(1),
      percentage: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  // Deduplicate and rank recommendations
  const uniqueRecs = new Map<string, Recommendation>();
  for (const r of allRecs) {
    const key = r.title.toLowerCase();
    if (!uniqueRecs.has(key)) uniqueRecs.set(key, r);
  }
  const recommendations = Array.from(uniqueRecs.values())
    .sort((a, b) => (a.priority === "high" ? -1 : 1))
    .slice(0, 3);

  // Deduplicate opportunities
  const uniqueOpps = new Map<string, Opportunity>();
  for (const o of allOpps) {
    const key = o.title.toLowerCase();
    if (!uniqueOpps.has(key)) uniqueOpps.set(key, o);
  }
  const opportunities = Array.from(uniqueOpps.values()).slice(0, 2);

  // Choose the longest strategy (most detailed) as the representative strategy
  const strategy = strategies.sort((a, b) => b.length - a.length)[0] || defaultInsight.strategy;

  return {
    topBuyingFactors,
    topComplaints,
    marketSentiment,
    keyDecisionFactors,
    recommendations,
    opportunities,
    strategy,
    reviewClusters,
  };
}
