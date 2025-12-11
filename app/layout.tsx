import type { Metadata } from "next";
import { Geist, Geist_Mono, Mulish } from "next/font/google";
import "./globals.css";
import Providers from "./_components/providers";
import AuthWrapper from "./_components/auth-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  weight: ["400", "600", "700", "200", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finance AI",
  description: "Plataforma de gestão financeira com IA",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${mulish.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuthWrapper>{children}</AuthWrapper>
        </Providers>
      </body>
    </html>
  );
}
