import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patton Pest Control – Scratch-Off Ticket",
  description: "Scratch your virtual ticket and win prizes from Patton Pest Control!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
