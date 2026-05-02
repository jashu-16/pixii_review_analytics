import { NextRequest } from "next/server";
import {
  extractAsin,
  scrapeProductDetails,
  searchCompetitors,
  extractSearchKeyword,
  scrapeReviews,
} from "@/lib/scraper/amazon";
import { estimateRevenue } from "@/lib/revenue";
import { analyzeProductReviews, aggregateInsights } from "@/lib/ai/analyzer";
import type {
  ProgressStep,
  EnrichedProduct,
  AnalysisResult,
} from "@/lib/types";

// Vercel Pro: 60s max, Hobby: 10s (not enough — use Pro or self-host)
export const maxDuration = 60;

function encode(step: ProgressStep): string {
  return `data: ${JSON.stringify(step)}\n\n`;
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      `data: ${JSON.stringify({ type: "ERROR", message: "Invalid request body — please provide a JSON body with a 'url' field." })}

`,
      { headers: { "Content-Type": "text/event-stream" }, status: 400 }
    );
  }
  const url = body.url;

  if (!url) {
    return new Response(
      `data: ${JSON.stringify({ type: "ERROR", message: "Missing 'url' field in request body." })}\n\n`,
      { headers: { "Content-Type": "text/event-stream" }, status: 400 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (step: ProgressStep) => {
        try {
          controller.enqueue(new TextEncoder().encode(encode(step)));
        } catch { /* stream closed */ }
      };

      try {
        // STEP 1: Extract ASIN
        send({ type: "EXTRACTING_ASIN", message: "Extracting product identifier from URL..." });
        const seedAsin = extractAsin(url);
        if (!seedAsin) {
          send({ type: "ERROR", message: "Could not extract ASIN from the provided URL. Please use a valid Amazon product URL." });
          controller.close();
          return;
        }

        // STEP 2: Scrape seed product
        send({ type: "SCRAPING_SEED", message: "Fetching seed product details..." });
        const seedProduct = await scrapeProductDetails(seedAsin);
        if (!seedProduct) {
          send({ type: "ERROR", message: "Could not scrape the seed product. Amazon may have blocked this request. Please try again in a moment." });
          controller.close();
          return;
        }
        seedProduct.isSeedProduct = true;

        // STEP 3: Find competitors
        send({ type: "FINDING_COMPETITORS", message: "Searching for competitor products...", found: 0 });
        const keyword = extractSearchKeyword(seedProduct.title);
        const competitorAsins = await searchCompetitors(keyword);

        // Remove seed from competitors if present
        const uniqueCompetitorAsins = competitorAsins
          .filter((a) => a !== seedAsin)
          .slice(0, 9);

        send({
          type: "FINDING_COMPETITORS",
          message: `Found ${uniqueCompetitorAsins.length} competitor products`,
          found: uniqueCompetitorAsins.length,
        });

        const allAsins = [seedAsin, ...uniqueCompetitorAsins];
        const allProductData = [seedProduct];

        // STEP 4: Scrape all competitor products (parallel batches of 3)
        const competitorBatches: string[][] = [];
        for (let i = 0; i < uniqueCompetitorAsins.length; i += 3) {
          competitorBatches.push(uniqueCompetitorAsins.slice(i, i + 3));
        }

        let productIndex = 1;
        for (const batch of competitorBatches) {
          const batchResults = await Promise.all(
            batch.map(async (asin) => {
              send({
                type: "SCRAPING_PRODUCT",
                message: `Scraping product ${productIndex + 1} of ${allAsins.length}...`,
                index: productIndex,
                total: allAsins.length,
                productTitle: `ASIN: ${asin}`,
              });
              productIndex++;
              return scrapeProductDetails(asin);
            })
          );
          allProductData.push(
            ...batchResults.filter((p): p is NonNullable<typeof p> => p !== null)
          );
        }

        // STEP 5: Scrape reviews + analyze (sequential to avoid rate limits)
        const enrichedProducts: EnrichedProduct[] = [];

        for (let i = 0; i < allProductData.length; i++) {
          const product = allProductData[i];
          const isFirst = i === 0;

          // Scrape reviews
          send({
            type: "SCRAPING_REVIEWS",
            message: `Fetching reviews for ${isFirst ? "seed product" : `competitor ${i}`}...`,
            index: i + 1,
            total: allProductData.length,
            productTitle: product.title.substring(0, 60),
          });

          const reviews = await scrapeReviews(product.asin, 2);

          // AI Analysis
          send({
            type: "AI_ANALYSIS",
            message: `Analyzing ${reviews.length} reviews with AI...`,
            index: i + 1,
            total: allProductData.length,
            productTitle: product.title.substring(0, 60),
          });

          const analysis = await analyzeProductReviews(
            product.asin,
            product.title,
            reviews
          );

          const revenue = estimateRevenue(
            product.reviewCount,
            product.price,
            product.rating,
            product.currency
          );

          enrichedProducts.push({
            product,
            revenue,
            analysis,
            reviewCount: reviews.length,
          });
        }

        // STEP 6: Aggregate insights
        send({ type: "AGGREGATING", message: "Generating market-wide insights..." });
        const aggregated = await aggregateInsights(enrichedProducts);

        // STEP 7: Compute market stats
        const prices = enrichedProducts.map((p) => p.product.price).filter((p) => p > 0);
        const ratings = enrichedProducts.map((p) => p.product.rating).filter((r) => r > 0);
        const totalRevenue = enrichedProducts.reduce(
          (sum, p) => sum + p.revenue.estimatedMonthlyRevenue,
          0
        );

        const result: AnalysisResult = {
          seedAsin,
          products: enrichedProducts,
          aggregatedInsights: aggregated,
          marketStats: {
            totalMonthlyRevenue: totalRevenue,
            avgPrice:
              prices.length > 0
                ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
                : 0,
            avgRating:
              ratings.length > 0
                ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
                : 0,
            totalReviews: enrichedProducts.reduce(
              (sum, p) => sum + p.product.reviewCount,
              0
            ),
            currency: "INR",
          },
          analyzedAt: new Date().toISOString(),
        };

        send({ type: "COMPLETE", result });
        controller.close();
      } catch (err) {
        console.error("Analysis error:", err);
        send({
          type: "ERROR",
          message: `Unexpected error: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
