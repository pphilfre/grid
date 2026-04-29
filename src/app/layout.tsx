import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const MAPBOX_GL_VERSION = "v3.6.0";
const MAPBOX_GL_BASE_URL = `https://api.mapbox.com/mapbox-gl-js/${MAPBOX_GL_VERSION}`;

export const metadata: Metadata = {
  title: 'Nexus Data Grid',
  description: 'A tactical data grid interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href={`${MAPBOX_GL_BASE_URL}/mapbox-gl.css`}
          rel="stylesheet"
        />
        <Script src={`${MAPBOX_GL_BASE_URL}/mapbox-gl.js`} strategy="beforeInteractive" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
