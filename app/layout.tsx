import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const helveticaNeue = localFont({
  src: "./fonts/HelveticaNeueRoman.otf",
  variable: "--font-helvetica-neue",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Codebanas",
  description: "Codebanas",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={helveticaNeue.variable}>{children}</body>
    </html>
  );
}
