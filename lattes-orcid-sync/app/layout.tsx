import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import SupportBlock from "@/components/SupportBlock";
import FeedbackBlock from "@/components/FeedbackBlock";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_TITLE = "Lattes2ORCID: Currículo Resumido + Integração com ORCID";
const SITE_DESCRIPTION =
  "Gere um currículo Lattes resumido em PDF e converta suas publicações para .bib, prontas para o ORCID. Vincule Lattes e ORCID sem digitar tudo de novo. Grátis e seguro.";

export const metadata: Metadata = {
   verification: {
    google: "13Qo8HZGmGiCgJ5rNxODBtWdUCKQFaCF28LU7fjp7Vk",
  },
  metadataBase: new URL("https://lattes-orcid-sync.vercel.app"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 655 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <SupportBlock />
        <FeedbackBlock />
      </body>
    </html>
  );
}
