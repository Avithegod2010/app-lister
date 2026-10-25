import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "App Lister — every app on your phone, one list",
  description:
    "App Lister shows every app installed on your Android phone — user and system — in one fast, fluid list. Material You theming, 100% offline, zero trackers. Built with Expo SDK 54, Kotlin and TypeScript.",
  keywords: [
    "app-lister",
    "Android",
    "Expo",
    "React Native",
    "Material You",
    "offline",
    "open source",
    "Avithegod2010",
  ],
  authors: [{ name: "Avithegod2010", url: "https://github.com/Avithegod2010" }],
  openGraph: {
    title: "App Lister — every app on your phone, one list",
    description:
      "Every installed package, real icons, Material You color, 100% offline. MIT licensed, built with Expo SDK 54.",
    url: "https://github.com/Avithegod2010/app-lister",
    siteName: "App Lister",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f2e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Sans+Condensed:wght@600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="https://raw.githubusercontent.com/Avithegod2010/app-lister/main/assets/images/favicon.png"
        />
      </head>
      <body className="paper-grain antialiased">{children}</body>
    </html>
  );
}
