import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Self-Healing Support Agent | Autonomous Signal Processing",
  description: "An autonomous multi-agent system that observes support signals, reasons about root causes, and takes intelligent action to resolve issues automatically.",
  openGraph: {
    title: "Self-Healing Support Agent",
    description: "Autonomous Signal Processing & Decision Engine for production support systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="theme-blacked"
          enableSystem={false}
          storageKey="migratex-theme"
          themes={["theme-blacked", "theme-stoned", "theme-light-pro", "theme-midnight", "theme-slate", "light", "dark"]}
          disableTransitionOnChange
        >
          <SmoothScroll>{children}</SmoothScroll>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
