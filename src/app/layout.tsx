import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { cx } from "~/shared/style";

import { MainLayout } from "./_components";
import {
  JotaiProvider,
  MotionProvider,
  HeroUIProvider,
  OverlayProvider,
  QueryProvider,
} from "./_components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "메수라이브 - 메이플 시뮬레이터, 계산기",
  description: "메수라이브, 각종 메이플 시뮬레이터와 기댓값 계산기",
  openGraph: {
    title: "메수라이브 - 메플 시뮬레이터, 계산기",
    description: "메수라이브, 각종 메이플 시뮬레이터와 기댓값 계산기",
    url: "https://mesu.live",
    siteName: "메수라이브",
  },
  other: {
    "google-adsense-account": process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT,
  },
};

export const viewport: Viewport = {
  themeColor: "#FF8009",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cx("font-pretendard", "font-medium")}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <GoogleAnalytics gaId={process.env.GA4_ID!} />
      <body>
        <MotionProvider>
          <JotaiProvider>
            <HeroUIProvider>
              <QueryProvider>
                <OverlayProvider>
                  <MainLayout>{children}</MainLayout>
                </OverlayProvider>
              </QueryProvider>
            </HeroUIProvider>
          </JotaiProvider>
        </MotionProvider>
        <SpeedInsights />
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT}`}
          async
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
