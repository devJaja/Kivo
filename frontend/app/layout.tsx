import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kivo - Smart Wallet",
  description: "Next-generation Web3 smart wallet with Account Abstraction",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "",
        type: "image/svg+xml",
      },
    ],
    apple: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-linear-to-br from-purple-600/10 via-blue-600/10 to-green-600/10 text-foreground">
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
