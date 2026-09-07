import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const helveticaNeue = localFont({
  src: "./fonts/HelveticaNeueRoman.otf",
  variable: "--font-helvetica-neue",
  display: "swap",
});

const geist = localFont({
  src: "./fonts/Geist-Variable.ttf",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Codebanas — Websites built for the next move",
  description: "Codebanas designs and builds high-performing digital experiences for ambitious businesses.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${helveticaNeue.variable} ${geist.variable}`}>{children}</body>
    </html>
  );
}
