import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Header } from "@/components/layout/Header";
import { SoundInit } from "@/components/SoundInit";

export const metadata: Metadata = {
  title: "Gambit",
  description: "A tactical strategy board game",
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
