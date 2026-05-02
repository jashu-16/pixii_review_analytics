import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Review, ProductAnalysis, AggregatedInsights, EnrichedProduct } from "@/lib/types";

function getGemini() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
}

const SYSTEM_INSTRUCTION = `You are an expert product analyst specializing in Amazon marketplace competitive intelligence. 
Analyze customer reviews and return structured JSON insights. Be precise, actionable, and data-driven.`;

export async function analyzeProductReviews(
  asin: string,
  productTitle: string,
  reviews: Review[]
): Promise<ProductAnalysis> {
  if (reviews.length === 0) {
    return {
      asin,
      topBuyingReasons: ["No reviews available for analysis"],
      topComplaints: ["No reviews available for analysis"],
      decisionFactors: [],
      sentimentBreakdown: { positive: 60, neutral: 25, negative: 15 },
      summary: "Insufficient review data for detailed analysis.",
    };
  }

  const sampleReviews = reviews.slice(0, 80);
  const reviewText = sampleReviews
    .map(
      (r, i) =>
        `[${i + 1}] Rating: ${r.rating}/5\nTitle: ${r.title}\nReview: ${r.body}`
    )
    .join("\n\n---\n\n");

  const prompt = `Analyze these ${sampleReviews.length} Amazon customer reviews for the product: "${productTitle}"

REVIEWS:
${reviewText}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "topBuyingReasons": ["reason1", "reason2", "reason3", "reason4", "reason5"],
  "topComplaints": ["complaint1", "complaint2", "complaint3", "complaint4", "complaint5"],
  "decisionFactors": [
    {"factor": "factor name", "importance": "high", "mentionCount": 0}
  ],
  "sentimentBreakdown": {
    "positive": 70,
    "neutral": 20,
    "negative": 10
  },
  "summary": "2-3 sentence executive summary of the product's market position"
}

Rules:
- topBuyingReasons: Specific reasons why customers love and buy this product (5 items)
- topComplaints: Specific issues customers complain about (5 items)
- decisionFactors: 5-7 key factors (e.g., "Battery Life", "Build Quality", "Value for Money")
- importance must be exactly: "high", "medium", or "low"
- sentimentBreakdown: Must sum to exactly 100
- Be specific, not generic`;

  try {
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 1200,
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            topBuyingReasons: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            topComplaints: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
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
            summary: { type: SchemaType.STRING },
          },
        },
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return {
      asin,
      topBuyingReasons: parsed.topBuyingReasons || [],
      topComplaints: parsed.topComplaints || [],
      decisionFactors: parsed.decisionFactors || [],
      sentimentBreakdown: parsed.sentimentBreakdown || {
        positive: 60,
        neutral: 25,
        negative: 15,
      },
      summary: parsed.summary || "",
    };
  } catch (err) {
    console.error("Gemini analysis error:", err);
    return {
      asin,
      topBuyingReasons: ["Analysis failed — API error"],
      topComplaints: ["Analysis failed — API error"],
      decisionFactors: [],
      sentimentBreakdown: { positive: 60, neutral: 25, negative: 15 },
      summary: "Analysis could not be completed.",
    };
  }
}

export async function aggregateInsights(
  products: EnrichedProduct[]
): Promise<AggregatedInsights> {
  const validProducts = products.filter((p) => p.analysis !== null);
  if (validProducts.length === 0) {
    return {
      topBuyingFactors: [],
      topComplaints: [],
      marketSentiment: { positive: 60, neutral: 25, negative: 15 },
      keyDecisionFactors: [],
    };
  }

  const allReasons = validProducts.flatMap((p) => p.analysis!.topBuyingReasons);
  const allComplaints = validProducts.flatMap((p) => p.analysis!.topComplaints);
  const allFactors = validProducts.flatMap((p) => p.analysis!.decisionFactors);

  const avgSentiment = {
    positive: Math.round(
      validProducts.reduce((s, p) => s + p.analysis!.sentimentBreakdown.positive, 0) /
        validProducts.length
    ),
    neutral: Math.round(
      validProducts.reduce((s, p) => s + p.analysis!.sentimentBreakdown.neutral, 0) /
        validProducts.length
    ),
    negative: Math.round(
      validProducts.reduce((s, p) => s + p.analysis!.sentimentBreakdown.negative, 0) /
        validProducts.length
    ),
  };

  const prompt = `You are aggregating competitive intelligence from ${validProducts.length} Amazon competitor products.

Buying reasons across all products:
${allReasons.join("\n")}

Complaints across all products:
${allComplaints.join("\n")}

Return ONLY valid JSON:
{
  "topBuyingFactors": [
    {"factor": "string", "mentionPct": 0}
  ],
  "topComplaints": [
    {"complaint": "string", "mentionPct": 0}
  ]
}

Rules:
- Cluster similar themes together into 5-7 topBuyingFactors
- 5-6 topComplaints with mentionPct
- mentionPct should be between 10-95 (realistic estimates)`;

  try {
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 700,
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
          },
        },
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    // Aggregate decision factors
    const factorMap = new Map<string, { total: number; count: number }>();
    allFactors.forEach((f) => {
      const key = f.factor.toLowerCase();
      const existing = factorMap.get(key);
      if (existing) {
        existing.total += f.mentionCount;
        existing.count += 1;
      } else {
        factorMap.set(key, { total: f.mentionCount, count: 1 });
      }
    });

    const keyDecisionFactors = Array.from(factorMap.entries())
      .map(([factor, data]) => ({
        factor: factor.charAt(0).toUpperCase() + factor.slice(1),
        importance: (data.count >= 3 ? "high" : data.count >= 2 ? "medium" : "low") as
          | "high"
          | "medium"
          | "low",
        mentionCount: data.total,
      }))
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, 7);

    return {
      topBuyingFactors: parsed.topBuyingFactors || [],
      topComplaints: parsed.topComplaints || [],
      marketSentiment: avgSentiment,
      keyDecisionFactors,
    };
  } catch {
    return {
      topBuyingFactors: allReasons.slice(0, 6).map((r) => ({ factor: r, mentionPct: 50 })),
      topComplaints: allComplaints.slice(0, 5).map((c) => ({ complaint: c, mentionPct: 30 })),
      marketSentiment: avgSentiment,
      keyDecisionFactors: [],
    };
  }
}
