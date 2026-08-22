import type { Metadata, Viewport } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "RailGaadi — Real-Time Indian Railways Journey Intelligence",
  description:
    "Live train tracking, immersive 3D railway maps, station timelines, elevation profiles, weather, and geographical context across Indian Railways.",
  keywords: [
    "Indian Railways",
    "Live Train Tracking",
    "Train Running Status",
    "Vande Bharat",
    "RailGaadi",
    "Train Map",
  ],
  authors: [{ name: "RailGaadi Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <QueryProvider>
          <div className="min-h-full flex flex-col">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
