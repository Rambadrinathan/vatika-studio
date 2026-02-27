import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vatika.AI — Your Dream Green Space, Built by AI",
  description:
    "Upload a photo of your balcony, terrace, or living room and watch AI transform it into a stunning biophilic green space using real KarmYog Vatika products.",
  keywords: ["biophilic design", "garden design", "AI interior design", "Vatika.AI", "KarmYog Vatika", "planters", "green space"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
