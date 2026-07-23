import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PERIONYX — Enterprise Treasury Operating System",
    template: "%s | PERIONYX",
  },
  description:
    "PERIONYX is an enterprise treasury operating system. Manage payments, approvals, reconciliation, risk, audits, and reporting across your entire organization.",
  keywords: [
    "treasury",
    "payments",
    "enterprise",
    "finance",
    "risk management",
    "reconciliation",
    "audit",
    "compliance",
  ],
  authors: [{ name: "PERIONYX" }],
  openGraph: {
    title: "PERIONYX — Enterprise Treasury Operating System",
    description:
      "Manage payments, approvals, reconciliation, risk, audits, and reporting across your entire organization.",
    url: "https://perionyx.io",
    siteName: "PERIONYX",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PERIONYX — Enterprise Treasury Operating System",
    description:
      "Manage payments, approvals, reconciliation, risk, audits, and reporting across your entire organization.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "PERIONYX",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${notoKufiArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-perionyx-bg-primary text-perionyx-text-primary">
        <AppProviders>{children}</AppProviders>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e4e4e7",
              fontSize: "0.8125rem",
              borderRadius: "0.75rem",
            },
          }}
        />
      </body>
    </html>
  );
}
