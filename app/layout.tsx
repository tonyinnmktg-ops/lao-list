import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Headings: Fraunces (warm modern serif). Body: Inter.
const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// The public address for share previews and links. NEXT_PUBLIC_SITE_URL can override it (e.g. for local testing).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://laolist.app";

const title = "LaoList | Lao-Owned Businesses in the US";
const description = "A free community directory of Lao-owned and Lao-inspired businesses and organizations across the United States.";

// Share preview image comes from app/opengraph-image.jpg and app/twitter-image.jpg
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: { title, description, siteName: "LaoList", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable}`}>
        <Navbar />
        {children}
<Footer />
      </body>
    </html>
  );
}
