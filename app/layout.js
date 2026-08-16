import "./globals.css";
import SiteHeader from "@/components/site-header";

export const metadata = {
  title: "Karachi Property Marketplace",
  description:
    "A curated Karachi property marketplace with seller tools and market intelligence.",
  icons: {
    icon: "/he-mark.svg?v=2",
    shortcut: "/he-mark.svg?v=2",
    apple: "/he-mark.svg?v=2",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-[var(--font-body)] antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
