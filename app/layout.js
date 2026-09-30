import "./globals.css";

export const metadata = {
  title: "ItzFizz — Scroll-Driven Hero",
  description:
    "Scroll-driven hero section animation built with Next.js, GSAP ScrollTrigger and Tailwind CSS.",
};

export const viewport = {
  themeColor: "#0e0f12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ink font-sans antialiased">{children}</body>
    </html>
  );
}
