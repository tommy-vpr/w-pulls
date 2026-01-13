import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WPulls",
  description: "W every pull",
  icons: {
    icon: "/images/w-pull-logo.png", // 32x32 or 48x48
    shortcut: "/images/w-pull-logo.png", // optional alias
    apple: "/images/w-pull-logo.png", // for iOS home screen
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0a0f]`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
