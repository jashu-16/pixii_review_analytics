/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cheerio and OpenAI to run server-side on Vercel
  serverExternalPackages: ["cheerio"],

  // Image optimization — allow Amazon CDN images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ssl-images-amazon.com",
      },
      {
        protocol: "https",
        hostname: "**.amazon.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
    ],
  },
};

module.exports = nextConfig;
