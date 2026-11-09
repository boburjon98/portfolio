import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bobur Tukhtamurodov | AI & Machine Learning Engineer",
  description:
    "AI & Machine Learning Engineer focused on locally deployed AI, multimodal applications, computer vision, RAG and secure enterprise AI infrastructure.",
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    type: "profile",
    title: "Bobur Tukhtamurodov | AI & ML Engineer",
    description: "AI applications, computer vision and secure local inference infrastructure. Explore Bobur Tukhtamurodov’s projects and engineering stack.",
    images: [{ url: "/portrait.png", width: 1122, height: 1402, alt: "Bobur Tukhtamurodov" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="/site.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
