import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TourProvider } from "@/tour/tourContext";
import TourController from "@/tour/tourController";

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
            <TourProvider>
              <TourController />

              <Navbar />

              <main>
                {children}
                <Toaster position="top-right" richColors />
              </main>
            </TourProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
