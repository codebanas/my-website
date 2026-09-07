import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codebanas — Websites built for the next move",
  description: "Codebanas designs and builds high-performing digital experiences for ambitious businesses.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
