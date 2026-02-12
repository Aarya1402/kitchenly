import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Navbar } from "@/components/navbar";
import { StoreProvider } from "@/components/StoreProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoadingFallback } from "@/components/ui/page-loading";
import { Toaster } from "@/components/ui/sonner";
import { TourProvider } from "@/tour/tourContext";
import TourControllerClient from "@/tour/tourControllerClient";

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
