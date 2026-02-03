import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { StoreProvider } from "@/components/StoreProvider";
import { TourProvider } from "@/tour/tourContext";
import { PageLoadingFallback } from "@/components/ui/page-loading";
import TourControllerClient from "@/tour/tourControllerClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kitchenly",
  description: "Smart recipe management for home cooks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider>
            <StoreProvider>
              <TourProvider>
                <Suspense fallback={null}>
                  <TourControllerClient />
                </Suspense>

                <Navbar />

                <main>
                  <Suspense fallback={<PageLoadingFallback />}>
                    {children}
                  </Suspense>
                  <Toaster position="top-right" richColors />
                </main>
              </TourProvider>
            </StoreProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
