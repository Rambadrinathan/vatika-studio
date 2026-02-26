import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KarmYog Vatika Design Studio — Transform Your Space with AI",
  description:
    "Upload a photo of your balcony, terrace, or living room and see it transformed into a stunning biophilic green space using real KarmYog Vatika products. Powered by AI.",
  keywords: ["biophilic design", "garden design", "AI interior design", "KarmYog Vatika", "planters", "green space"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
