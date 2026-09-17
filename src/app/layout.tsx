import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Noto_Sans_Display } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const notoSansDisplay = Noto_Sans_Display({
  variable: "--font-noto-sans-display",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const title = "脳内世界旅行";
const description =
  "何も見ずに国名をつなげていく「脳内世界旅行」を楽しもう";

export const metadata: Metadata = {
  metadataBase: new URL("https://world-tour.thwth.dev"),
  title,
  description,
  appleWebApp: {
    capable: true,
    title,
    statusBarStyle: "default",
  },
  openGraph: {
    title,
    description,
    siteName: title,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${notoSansDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-neutral-200">
        {children}
      </body>
    </html>
  );
}
