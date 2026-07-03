import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "URL Shortener - Shorten Links Instantly",
    template: "%s | URL Shortener",
  },
  description:
    "Free URL shortener. Paste any long URL and get a short, shareable link with click tracking. No signup required.",
  keywords: ["url shortener", "short links", "link shortener", "url shortener free"],
  openGraph: {
    title: "URL Shortener - Shorten Links Instantly",
    description: "Free URL shortener with click tracking. No signup required.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "URL Shortener - Shorten Links Instantly",
    description: "Free URL shortener with click tracking. No signup required.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

