import * as cheerio from "cheerio";

const BIS_RELEASE_URL = "https://www.bis.org/statistics/pp_residential.htm";
const ZAMEEN_KARACHI_URL = "https://www.zameen.com/index/buy/houses/karachi-2/";
const ZAMEEN_PAKISTAN_URL =
  "https://www.zameen.com/index/buy/houses/pakistan-1521/";
const NEWS_FEEDS = [
  {
    label: "Commercial real estate (Canada)",
    url: "https://www.connectcre.ca/feed?story-market=canada",
  },
  {
    label: "Cross-border real estate",
    url: "https://www.connectcre.ca/feed?story-market=cross-border-news",
  },
];

function normalizeText(input) {
  return input.replace(/\s+/g, " ").replace(/–/g, "-").trim();
}

function findPercent(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace("−", "-");
    }
  }
  return null;
}

function parseQuarter(text) {
  const match = text.match(
    /In the (first|second|third|fourth) quarter of (\d{4})/i
  );
  if (!match) return null;
  const map = {
    first: "Q1",
    second: "Q2",
    third: "Q3",
    fourth: "Q4",
  };
  return `${map[match[1].toLowerCase()]} ${match[2]}`;
}

async function fetchBisSummary() {
  const response = await fetch(BIS_RELEASE_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch BIS release.");
  }
  const html = await response.text();
  const text = normalizeText(cheerio.load(html)("body").text());

  const globalYoy = findPercent(text, [
    /global real house prices .*? by ([+-]?\d+(?:\.\d+)?)%/i,
    /global real .*? prices .*? ([+-]?\d+(?:\.\d+)?)%/i,
  ]);

  const aeYoy = findPercent(text, [
    /advanced economies.*?(?:rising|increase|grew|continued to recover).*?([+-]?\d+(?:\.\d+)?)%/i,
    /advanced economies.*?\(([+-]?\d+(?:\.\d+)?)%/i,
  ]);

  const emeYoy = findPercent(text, [
    /emerging market economies.*?\(([+-]?\d+(?:\.\d+)?)%/i,
    /emerging market economies.*?(?:decline|decrease|fell).*?([+-]?\d+(?:\.\d+)?)%/i,
  ]);

  const period = parseQuarter(text);
  const dateMatch = text.match(/\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/);

  return {
    globalYoy,
    aeYoy,
    emeYoy,
    period,
    published: dateMatch ? dateMatch[0] : null,
    source: "BIS",
  };
}

function parseZameenPrice(text) {
  const clean = normalizeText(text);
  const avgMatch = clean.match(
    /Average Houses Price in ([A-Za-z]+\s+\d{4})\s+PKR\s+([\d.]+)\s*(Crore|Lakh|Thousand)/i
  );
  const oneYearMatch = clean.match(
    /1 Year Ago\s+PKR\s+([\d.]+)\s*(Crore|Lakh|Thousand)\s+([\d.]+)\s*%/i
  );

  return {
    period: avgMatch ? avgMatch[1] : null,
    avgPrice: avgMatch ? `PKR ${avgMatch[2]} ${avgMatch[3]}` : null,
    oneYearChange: oneYearMatch ? `${oneYearMatch[3]}%` : null,
  };
}

async function fetchZameen(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch Zameen index.");
  }
  const html = await response.text();
  const text = cheerio.load(html)("body").text();
  return parseZameenPrice(text);
}

async function fetchNewsFeed(feed) {
  const response = await fetch(feed.url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch news feed.");
  }
  const xml = await response.text();
  const $ = cheerio.load(xml, { xmlMode: true });
  const items = [];
  $("item").each((_, item) => {
    if (items.length >= 3) return;
    const title = $(item).find("title").text().trim();
    const link = $(item).find("link").text().trim();
    const pubDate = $(item).find("pubDate").text().trim();
    if (title && link) {
      items.push({ title, link, pubDate, source: feed.label });
    }
  });
  return items;
}

export async function getMarketSnapshot() {
  const [bis, karachi, pakistan, newsFeeds] = await Promise.allSettled([
    fetchBisSummary(),
    fetchZameen(ZAMEEN_KARACHI_URL),
    fetchZameen(ZAMEEN_PAKISTAN_URL),
    Promise.all(NEWS_FEEDS.map((feed) => fetchNewsFeed(feed))),
  ]);

  return {
    bis: bis.status === "fulfilled" ? bis.value : null,
    karachi: karachi.status === "fulfilled" ? karachi.value : null,
    pakistan: pakistan.status === "fulfilled" ? pakistan.value : null,
    news:
      newsFeeds.status === "fulfilled"
        ? newsFeeds.value.flat()
        : [],
  };
}
