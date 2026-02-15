import { unstable_cache } from "next/cache";

function monthLabel(date = new Date()) {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

const monthlyReport = {
  period: monthLabel(),
  bis: {
    globalYoy: "2.8",
    aeYoy: "1.9",
    emeYoy: "3.6",
  },
  karachi: {
    period: monthLabel(),
    avgPrice: "PKR 4.65 Crore",
    oneYearChange: "6.2%",
  },
  pakistan: {
    period: monthLabel(),
    avgPrice: "PKR 3.12 Crore",
    oneYearChange: "4.7%",
  },
  news: [
    {
      title: "Karachi demand remains strongest in mid-income and DHA corridors",
      link: "/marketplace",
      pubDate: monthLabel(),
      source: "Monthly Brief",
    },
    {
      title: "Pakistan housing sentiment improves as financing activity stabilizes",
      link: "/marketplace",
      pubDate: monthLabel(),
      source: "Monthly Brief",
    },
    {
      title: "Regional construction costs show steady pressure across major cities",
      link: "/marketplace",
      pubDate: monthLabel(),
      source: "Monthly Brief",
    },
  ],
};

const getMonthlySnapshot = unstable_cache(
  async () => {
    return monthlyReport;
  },
  ["monthly-market-snapshot"],
  { revalidate: 60 * 60 * 24 * 30 }
);

export async function getMarketSnapshot() {
  return getMonthlySnapshot();
}
