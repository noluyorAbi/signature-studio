import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const sans = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://signaturestudio.adatepe.dev"),
  title: "Signature Studio",
  description:
    "Craft an animated, email-safe signature in the Custom Esignature style. A personal POC for adatepe.dev.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Signature Studio",
    description: "Animated, email-safe email signatures, built in the browser and exported as Outlook-safe HTML.",
    url: "https://signaturestudio.adatepe.dev",
    siteName: "Signature Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Signature Studio",
    description: "Animated, email-safe email signatures, built in the browser.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
