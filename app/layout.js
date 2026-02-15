import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Hamdard Estate | Signature Real Estate",
  description:
    "Hamdard Estate pairs architectural standouts with data-driven market intelligence.",
  icons: {
    icon: "/house-svgrepo-com.svg",
    shortcut: "/house-svgrepo-com.svg",
    apple: "/house-svgrepo-com.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${cormorant.variable} font-[var(--font-body)] antialiased`}
      >
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
