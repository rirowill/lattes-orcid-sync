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

export const metadata: Metadata = {
    google: "13Qo8HZGmGiCgJ5rNxODBtWdUCKQFaCF28LU7fjp7Vk",
  metadataBase: new URL("https://lattes-orcid-sync.vercel.app"),
  title: "Lattes → ORCID | Currículo formatado sem digitar tudo de novo",
  description:
    "Suba o XML do seu Currículo Lattes e receba um currículo formatado para editais e um arquivo pronto para importar no ORCID.",
  openGraph: {
    title: "Lattes → ORCID | Currículo formatado sem digitar tudo de novo",
    description:
      "Suba o XML do seu Currículo Lattes e receba um currículo formatado para editais e um arquivo pronto para importar no ORCID.",
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
