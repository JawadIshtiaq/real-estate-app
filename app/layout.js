import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Atria Homes | Signature Real Estate",
  description:
    "Atria Homes pairs architectural standouts with data-driven market intelligence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${playfair.variable} font-[var(--font-body)] antialiased`}
      >
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
