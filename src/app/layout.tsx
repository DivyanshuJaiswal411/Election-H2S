import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Election Assistant",
  description: "A smart, dynamic assistant to help users understand the election process and timelines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
