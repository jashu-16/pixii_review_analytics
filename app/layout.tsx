import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixii Review Analytics — Amazon Competitor Intelligence",
  description:
    "AI-powered Amazon competitive analysis. Paste one product URL and instantly get revenue estimates, purchase drivers, complaints, and sentiment breakdowns for 10 competing products.",
  keywords: ["amazon analytics", "competitor analysis", "product research", "review analysis", "market intelligence"],
  openGraph: {
    title: "Pixii Review Analytics",
    description: "AI-powered Amazon competitor intelligence dashboard",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="noise-bg">{children}</body>
    </html>
  );
}
