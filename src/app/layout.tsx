import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MIQSX — AI Brand Operating System",
  description: "Build a structured Brand DNA that keeps every asset consistent, learns from your feedback, and runs your brand — in Urdu, Roman Urdu, and English.",
  keywords: ["brand identity", "AI branding", "Pakistan", "brand kit", "brand OS"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
