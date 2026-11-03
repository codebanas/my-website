import type { Metadata } from "next";
import localFont from "next/font/local";
import { initialScrollScript } from "@/lib/initial-scroll";
import "./globals.css";

const helveticaNeue = localFont({
  src: [
    { path: "./fonts/HelveticaNeueUltraLight.otf", weight: "100", style: "normal" },
    { path: "./fonts/HelveticaNeueUltraLightItalic.otf", weight: "100", style: "italic" },
    { path: "./fonts/HelveticaNeueThin.otf", weight: "200", style: "normal" },
    { path: "./fonts/HelveticaNeueThinItalic.otf", weight: "200", style: "italic" },
    { path: "./fonts/HelveticaNeueLight.otf", weight: "300", style: "normal" },
    { path: "./fonts/HelveticaNeueLightItalic.otf", weight: "300", style: "italic" },
    { path: "./fonts/HelveticaNeueRoman.otf", weight: "400", style: "normal" },
    { path: "./fonts/HelveticaNeueItalic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/HelveticaNeueMedium.otf", weight: "500", style: "normal" },
    { path: "./fonts/HelveticaNeueMediumItalic.otf", weight: "500", style: "italic" },
    { path: "./fonts/HelveticaNeueBold.otf", weight: "700", style: "normal" },
    { path: "./fonts/HelveticaNeueBoldItalic.otf", weight: "700", style: "italic" },
    { path: "./fonts/HelveticaNeueHeavy.otf", weight: "800", style: "normal" },
    { path: "./fonts/HelveticaNeueHeavyItalic.otf", weight: "800", style: "italic" },
    { path: "./fonts/HelveticaNeueBlack.otf", weight: "900", style: "normal" },
    { path: "./fonts/HelveticaNeueBlackItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-helvetica-neue",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Codebanas",
  description: "Codebanas",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: initialScrollScript }} />
      </head>
      <body className={helveticaNeue.variable}>{children}</body>
    </html>
  );
}
