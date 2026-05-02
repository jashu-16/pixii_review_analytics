import * as cheerio from "cheerio";
import type { ProductData, Review } from "@/lib/types";

// Vercel-compatible stealth headers (no Playwright needed)
function getStealthHeaders(referer?: string): HeadersInit {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
  ];
  const ua = userAgents[Math.floor(Math.random() * userAgents.length)];

  return {
    "User-Agent": ua,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
    ...(referer ? { Referer: referer } : {}),
  };
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function randomDelay() {
  return delay(800 + Math.random() * 1200);
}

const BASE_URL = "https://www.amazon.in";

// Extract ASIN from any Amazon URL format
export function extractAsin(url: string): string | null {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/product\/([A-Z0-9]{10})/,
    /\/ASIN\/([A-Z0-9]{10})/,
    /([A-Z0-9]{10})(?:\/|\?|$)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      await randomDelay();
      const res = await fetch(url, {
        ...options,
        headers: getStealthHeaders(BASE_URL),
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 200) {
        return await res.text();
      }
      if (res.status === 503 || res.status === 429) {
        await delay(3000 * (i + 1));
        continue;
      }
      return null;
    } catch {
      if (i < retries - 1) await delay(2000 * (i + 1));
    }
  }
  return null;
}

// Scrape product details from Amazon product page
export async function scrapeProductDetails(
  asin: string
): Promise<ProductData | null> {
  const url = `${BASE_URL}/dp/${asin}`;
  const html = await fetchWithRetry(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  // Try JSON-LD structured data first
  let title = "";
  let price = 0;
  let rating = 0;
  let reviewCount = 0;
  let imageUrl = "";
  let brand = "";

  // Try structured data
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "{}");
      if (data["@type"] === "Product") {
        title = title || data.name || "";
        brand = brand || data.brand?.name || "";
        imageUrl = imageUrl || data.image || "";
        if (data.offers) {
          const priceStr = data.offers.price || data.offers.lowPrice || "0";
          price = price || parseFloat(priceStr);
        }
        if (data.aggregateRating) {
          rating = rating || parseFloat(data.aggregateRating.ratingValue || "0");
          reviewCount =
            reviewCount ||
            parseInt(data.aggregateRating.reviewCount || "0", 10);
        }
      }
    } catch { /* noop */ }
  });

  // Fallback: parse HTML selectors
  if (!title) {
    title =
      $("#productTitle").text().trim() ||
      $("h1.product-title-word-break").text().trim() ||
      $('[data-feature-name="title"] span').first().text().trim();
  }

  if (!price) {
    const priceText =
      $(".a-price .a-offscreen").first().text().trim() ||
      $("#priceblock_ourprice").text().trim() ||
      $("#priceblock_dealprice").text().trim() ||
      $(".a-price-whole").first().text().trim();
    price = parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;
  }

  if (!rating) {
    const ratingText =
      $("span[data-hook='rating-out-of-text']").text() ||
      $("#acrPopover").attr("title") ||
      $(".a-icon-star .a-icon-alt").first().text();
    rating = parseFloat(ratingText.match(/[\d.]+/)?.[0] || "0");
  }

  if (!reviewCount) {
    const rcText =
      $("#acrCustomerReviewText").first().text() ||
      $("[data-hook='total-review-count']").text();
    reviewCount = parseInt(rcText.replace(/[^\d]/g, "") || "0", 10);
  }

  if (!imageUrl) {
    imageUrl =
      $("#landingImage").attr("src") ||
      $("#imgBlkFront").attr("src") ||
      $(".a-dynamic-image").first().attr("src") ||
      "";
  }

  if (!brand) {
    brand =
      $("#bylineInfo").text().replace(/Visit the |Store| Brand/gi, "").trim() ||
      $("[data-feature-name='bylineInfo']").text().trim() ||
      "";
  }

  if (!title) return null;

  return {
    asin,
    title: title.substring(0, 200),
    price,
    currency: "INR",
    rating,
    reviewCount,
    imageUrl,
    url: `${BASE_URL}/dp/${asin}`,
    brand: brand.substring(0, 100),
    isSeedProduct: false,
  };
}

// Search Amazon for competitor products by keyword
export async function searchCompetitors(keyword: string): Promise<string[]> {
  const searchQuery = encodeURIComponent(keyword.substring(0, 100));
  const url = `${BASE_URL}/s?k=${searchQuery}&ref=nb_sb_noss`;
  const html = await fetchWithRetry(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const asins: string[] = [];

  // Extract ASINs from search result cards
  $("[data-asin]").each((_, el) => {
    const asin = $(el).attr("data-asin");
    if (asin && asin.length === 10 && !asins.includes(asin)) {
      asins.push(asin);
    }
  });

  return asins.slice(0, 9);
}

// Extract core keyword from product title for search
export function extractSearchKeyword(title: string): string {
  // Remove brand-specific words, model numbers, sizes, colors
  return title
    .replace(/\b[A-Z0-9]{6,}\b/g, "") // remove model numbers
    .replace(/\d+\s*(gb|tb|mb|ml|l|kg|g|cm|mm|inch|"|w|mah)\b/gi, "") // remove specs
    .replace(
      /\b(black|white|silver|gold|blue|red|green|grey|gray|pink|purple)\b/gi,
      ""
    ) // remove colors
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 5)
    .join(" ");
}

// Scrape reviews for a product (parallel pages)
export async function scrapeReviews(
  asin: string,
  maxPages = 3 // Increase default pages
): Promise<Review[]> {
  const pages = Array.from({ length: maxPages }, (_, i) => i + 1);

  const results = await Promise.all(
    pages.map(async (page) => {
      const url = `${BASE_URL}/product-reviews/${asin}?pageNumber=${page}&reviewerType=all_reviews&sortBy=recent`;
      const html = await fetchWithRetry(url);
      if (!html) return [];

      const $ = cheerio.load(html);
      const pageReviews: Review[] = [];

      $("[data-hook='review']").each((_, el) => {
        const ratingText =
          $(el).find("[data-hook='review-star-rating'] .a-icon-alt").text() ||
          $(el).find(".review-rating .a-icon-alt").text();
        const rating = parseFloat(ratingText.match(/[\d.]+/)?.[0] || "3");
        const title = $(el)
          .find("[data-hook='review-title'] span")
          .last()
          .text()
          .trim();
        const body = $(el).find("[data-hook='review-body'] span").text().trim();
        const date = $(el).find("[data-hook='review-date']").text().trim();

        if (body && body.length > 20) {
          pageReviews.push({
            title,
            body: body.substring(0, 500),
            rating,
            date,
          });
        }
      });

      return pageReviews;
    })
  );

  const flatReviews = results.flat();

  // Deduplicate by review body
  let uniqueReviews: Review[] = [];
  const seenBodies = new Set<string>();

  for (const review of flatReviews) {
    if (!seenBodies.has(review.body)) {
      seenBodies.add(review.body);
      uniqueReviews.push(review);
    }
  }

  // Fallback: If dedicated review pages are blocked, try the main product page
  if (uniqueReviews.length === 0) {
    console.log(`[Fallback] Dedicated review page blocked for ${asin}, fetching from product page...`);
    const fallbackUrl = `${BASE_URL}/dp/${asin}`;
    const fallbackHtml = await fetchWithRetry(fallbackUrl);
    if (fallbackHtml) {
      const $ = cheerio.load(fallbackHtml);
      $("[data-hook='review'], .review").each((_, el) => {
        const ratingText =
          $(el).find("[data-hook='review-star-rating'] .a-icon-alt").text() ||
          $(el).find(".review-rating .a-icon-alt").text();
        const rating = parseFloat(ratingText.match(/[\d.]+/)?.[0] || "3");
        const title = $(el)
          .find("[data-hook='review-title'] span")
          .last()
          .text()
          .trim();
        const body = $(el).find("[data-hook='review-body'] span").text().trim();
        const date = $(el).find("[data-hook='review-date']").text().trim();

        if (body && body.length > 20 && !seenBodies.has(body)) {
          seenBodies.add(body);
          uniqueReviews.push({
            title,
            body: body.substring(0, 500),
            rating,
            date,
          });
        }
      });
    }
  }

  return uniqueReviews;
}
