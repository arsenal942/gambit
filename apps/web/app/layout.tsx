import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Header } from "@/components/layout/Header";
import { SoundInit } from "@/components/SoundInit";

export const metadata: Metadata = {
  title: "Gambit — Free Tactical Strategy Board Game",
  description:
    "A free browser-based tactical board game with three unique units, a river that changes abilities, and capture point victory. No download required.",
  openGraph: {
    title: "Gambit — Free Tactical Strategy Board Game",
    description:
      "Three units. One river. Infinite strategy. Play free in your browser.",
    type: "website",
    siteName: "Gambit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gambit — Free Tactical Strategy Board Game",
    description:
      "Three units. One river. Infinite strategy. Play free in your browser.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <SoundInit />
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
