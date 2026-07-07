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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Runs before React — sets data-theme on <html> so first paint is correct */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('mqsx-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light')}catch(e){}})()` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
