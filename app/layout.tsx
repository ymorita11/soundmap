import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SoundMap — 音で旅する地図SNS",
  description:
    "目を閉じて30秒、音で旅しよう。世界中の誰かが録った環境音を、地図から探して聴く。",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/" signInUrl="/sign-in" signUpUrl="/sign-up">
      <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
        <body className="min-h-dvh overflow-hidden">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
