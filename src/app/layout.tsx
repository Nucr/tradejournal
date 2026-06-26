import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import AnalyticsScript from "@/components/AnalyticsScript";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://verifter.com"),
  title: {
    default: "Verifter — Trade Journal & Performans Defteri",
    template: "%s | Verifter",
  },
  description:
    "İşlemlerini kaydet, performansını analiz et. Ekran görüntüsü, strateji ve RR ile her işlemini tek bir deftere kaydet.",
  keywords: [
    "trade journal",
    "işlem günlüğü",
    "trader",
    "performans analizi",
    "forex",
    "kripto",
    "borsa",
    "trade defteri",
  ],
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Verifter — Trade Journal & Performans Defteri",
    description:
      "İşlemlerini kaydet, performansını analiz et. Ekran görüntüsü, strateji ve RR ile her işlemini tek bir deftere kaydet.",
    url: "https://verifter.com",
    siteName: "Verifter",
    locale: "tr_TR",
    alternateLocale: "en_US",
    type: "website",
    images: [{ url: "/og-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verifter — Trade Journal",
    description:
      "İşlemlerini kaydet, performansını analiz et.",
    images: ["/icons/icon-512.png"],
  },
  robots: { index: true, follow: true },
  alternates: {
    languages: {
      tr: "/tr",
      en: "/en",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const locale = headersList.get("x-locale") || "tr";
  return (
    <html lang={locale} className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2ED9A4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Verifter",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "Trade journal & performans defteri",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var t = localStorage.getItem('theme');
                if (!t) { t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
                document.documentElement.classList.add(t);
              } catch(e) {}
            })();
          `,
        }} />
      </head>
      <body className="font-body antialiased">
        <AnalyticsScript />
        <ServiceWorkerRegister />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
