import type { Metadata } from "next";
import "./globals.css";
import AIChatWidget from "@/components/AIChatWidget";

export const metadata: Metadata = {
  title: "CMPRSSN — Agent Composition Survey",
  description: "A research survey mapping how teams compose, govern, and scale autonomous agent systems.",
  openGraph: {
    title: "CMPRSSN — Agent Composition Survey",
    description: "How do you compose your agents? Map your position in the emerging landscape of autonomous operations.",
    type: "website",
  },
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
          href="https://fonts.googleapis.com/css2?family=Audiowide&family=Rajdhani:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grid-bg">
        {children}
        <AIChatWidget />
      </body>
    </html>
  );
}
