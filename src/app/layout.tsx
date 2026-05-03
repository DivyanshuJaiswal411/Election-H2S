import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AI Election Assistant",
  description: "A smart, dynamic assistant to help users understand the election process and timelines.",
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-ELECTION_ASSISTANT";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "AI Election Assistant",
              "operatingSystem": "Web",
              "applicationCategory": "EducationalApplication",
              "description": "A smart, dynamic assistant to help users understand the election process and timelines.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
