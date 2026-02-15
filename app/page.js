import { getMarketSnapshot } from "@/lib/marketData";
import { getSupabaseServer } from "@/lib/supabaseServer";
import ishtiaqPhoto from "@/components/Ishtiaq.png";
import FawadPhoto from "@/public/Fawad.png";

function formatMoney(value) {
  if (value == null) return "—";
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return value;
}

const fallbackListings = [
  {
    id: 1,
    title: "Glasshouse on Mulberry",
    price: "$1.48M",
    beds: 4,
    baths: 3,
    sqft: "2,980",
    tag: "New",
    location: "Hudson Ridge",
  },
  {
    id: 2,
    title: "The Copper Loft",
    price: "$925K",
    beds: 3,
    baths: 2,
    sqft: "2,210",
    tag: "Open House",
    location: "Northline Arts",
  },
  {
    id: 3,
    title: "Seaward Modern",
    price: "$2.15M",
    beds: 5,
    baths: 4,
    sqft: "3,840",
    tag: "Featured",
    location: "Marina Vista",
  },
];

const neighborhoods = [
  {
    name: "Clifton & DHA",
    homes: "Karachi South",
    vibe: "Coastal living, upscale apartments, and premium amenities.",
  },
  {
    name: "DHA City",
    homes: "Karachi North",
    vibe: "Family-friendly streets with parks and schools nearby.",
  },
  {
    name: "Bahria Town",
    homes: "Karachi Central",
    vibe: "Established neighborhoods with classic architecture.",
  },
];

const team = [
  {
    name: "Muhammad Ishtiaq Khan",
    role: "Founder & Managing Director",
    bio: "Leads strategic growth and premium listings across Karachi.",
    phone: "+92 300 2000340",
    whatsapp: "https://wa.me/923002000340",
    facebook: "https://www.facebook.com/share/1GqdmNSbEo/?mibextid=wwXIfr",
    photo: ishtiaqPhoto.src,
  },
  {
    name: "Muhammad Naseer Khan",
    role: "Managing Partner",
    bio: "Focused on buyer journeys, negotiation, and relocation strategy.",
    phone: "+92 300 2199385",
    whatsapp: "https://wa.me/923002199385",
    facebook: "https://facebook.com/muhammadnaseer.khan.161",
    photo: "",
  },
  {
    name: "Muhammad Amjad Khan",
    role: "Managing Partner",
    bio: "Tracks Karachi and national trends with apartment rent and sale data-first insights.",
    phone: "+92 300 2223460",
    whatsapp: "https://wa.me/923002223460",
    facebook: "https://facebook.com/smamjad124",
    photo: "",
  },  
  {
    name: "Muhammad Fawad Ishtiaq",
    role: "Bungalow Sale/Rent Consultant",
    bio: "Bungalow and Bungalow Portion Sale & Rent Consultant/Advisor",
    phone: "+92 301 8289888",
    whatsapp: "https://wa.me/923018289888",
    facebook: "https://facebook.com/fawad.khan.211436",
    photo: FawadPhoto.src,
  },
];

export default async function Home() {
  const market = await getMarketSnapshot();
  const supabase = getSupabaseServer();
  let featuredListings = fallbackListings;
  if (supabase) {
    const { data } = await supabase
      .from("listings")
      .select(
        "id, title, price, beds, baths, sqft, area_unit, status, city, neighborhood, hero_image_url"
      )
      .order("created_at", { ascending: false })
      .limit(3);
    if (data && data.length) {
      featuredListings = data;
    }
  }
  const news = market?.news ?? [];

  return (
    <div className="min-h-screen bg-white text-red-950">
      <section className="mx-auto w-full max-w-6xl space-y-10 px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
              Featured listings
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl">
              Distinctive homes across the city.
            </h2>
          </div>
          <a
            className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-800"
            href="/marketplace"
          >
            View all listings
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {featuredListings.map((listing) => (
            <article
              key={listing.id}
              className="rounded-[28px] border border-red-200/70 bg-white p-6 transition hover:-translate-y-1 hover:border-red-300"
            >
              <div className="h-40 overflow-hidden rounded-2xl border border-red-200/70 bg-red-50">
                {listing.hero_image_url ? (
                  <img
                    alt={listing.title}
                    className="h-full w-full object-cover"
                    src={listing.hero_image_url}
                  />
                ) : null}
              </div>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-red-500/70">
                <span>
                  {listing.neighborhood || listing.city || listing.location}
                </span>
                <span className="rounded-full border border-red-300 px-3 py-1 text-[10px] text-red-700">
                  {listing.status || listing.tag || "Featured"}
                </span>
              </div>
              <h3 className="mt-6 font-[var(--font-display)] text-xl">
                {listing.title}
              </h3>
              <div className="mt-2 text-2xl font-semibold text-red-700">
                {formatMoney(listing.price)}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-red-700/80">
                <span>{listing.beds} beds</span>
                <span>{listing.baths} baths</span>
                <span>{listing.sqft} {listing.area_unit || "sq ft"}</span>
              </div>
              <a
                className="mt-6 block w-full rounded-2xl bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-500"
                href={`/marketplace/${listing.id}`}
              >
                View details
              </a>
            </article>
          ))}
        </div>
      </section>

      <div className="relative overflow-hidden">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-red-500/25 via-rose-400/20 to-transparent blur-3xl" />
        <div className="absolute left-0 top-32 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-red-300/25 via-rose-200/10 to-transparent blur-3xl" />

        <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200/70 bg-red-50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-red-600">
              Signature Real Estate
            </div>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Homes that feel curated for the life you want to live.
            </h1>
            <p className="max-w-xl text-base text-red-700/80 sm:text-lg">
              Hamdard Estate pairs architectural standouts with data-driven market
              intelligence, so every move feels intentional, confident, and
              exquisitely timed.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500">
                Explore listings
              </button>
              <a
                className="rounded-full border border-red-300 px-6 py-3 text-sm font-semibold text-red-800 transition hover:border-red-400"
                href="/marketplace"
              >
                Open marketplace
              </a>
              <button className="rounded-full border border-red-300 px-6 py-3 text-sm font-semibold text-red-800 transition hover:border-red-400">
                Talk to an advisor
              </button>
            </div>

            <div className="grid gap-6 rounded-3xl border border-red-200/70 bg-red-50 p-6">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  className="h-12 rounded-2xl border border-red-200 bg-white px-4 text-sm text-red-900 placeholder:text-red-300"
                  placeholder="City or neighborhood"
                />
                <input
                  className="h-12 rounded-2xl border border-red-200 bg-white px-4 text-sm text-red-900 placeholder:text-red-300"
                  placeholder="Price range"
                />
                <button className="h-12 rounded-2xl bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-500">
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-red-200/70 bg-red-50 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
                Concierge
              </div>
              <p className="mt-4 text-sm text-red-700/80">
                Curated tours, architectural insights, and bespoke relocation
                services designed around your calendar.
              </p>
              <p className="mt-4 text-xs text-red-500/70">
                Updated monthly from internal market briefing.
              </p>
              <button className="mt-6 rounded-full border border-red-300 px-4 py-2 text-xs uppercase tracking-[0.2em] text-red-800 transition hover:border-red-400">
                View services
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-red-50 py-20">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
              Karachi districts
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl">
              Focused coverage for Karachi and beyond.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {neighborhoods.map((hood) => (
              <div
                key={hood.name}
                className="rounded-[28px] border border-red-200/70 bg-white p-6"
              >
                <h3 className="font-[var(--font-display)] text-xl">
                  {hood.name}
                </h3>
                <div className="mt-2 text-sm text-red-600/80">
                  {hood.homes}
                </div>
                <p className="mt-4 text-sm text-red-700/80">{hood.vibe}</p>
                <button className="mt-6 text-xs uppercase tracking-[0.2em] text-red-600">
                  Explore district
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="mx-auto w-full max-w-6xl space-y-10 px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
              Leadership
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl">
              The people guiding Hamdard Estate.
            </h2>
          </div>
          <button className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-800">
            Meet the team
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {team.map((member) => (
            <div
              key={member.name}
              className="rounded-[28px] border border-red-200/70 bg-white p-6"
            >
              <div className="aspect-square w-full overflow-hidden rounded-2xl border border-red-200/70 bg-red-50">
                {member.photo ? (
                  <img
                    alt={member.name}
                    className="h-full w-full object-cover"
                    src={member.photo}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-red-500/70">
                    <svg
                      aria-hidden="true"
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M20 21a8 8 0 0 0-16 0" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm font-semibold">{member.name}</div>
              <div className="text-xs text-red-600/80">{member.role}</div>
              <a
                className="mt-1 inline-block text-xs text-red-600/80 underline decoration-red-300 underline-offset-2 transition hover:text-red-800"
                href={`tel:${member.phone.replace(/\s+/g, "")}`}
                aria-label={`Call ${member.name} at ${member.phone}`}
              >
                {member.phone}
              </a>
              <div className="mt-3 flex gap-2">
                <a
                  className="rounded-full border border-red-300 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-red-800 transition hover:border-red-400"
                  href={member.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
                <a
                  className="rounded-full border border-red-300 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-red-800 transition hover:border-red-400"
                  href={member.facebook}
                  target="_blank"
                  rel="noreferrer"
                >
                  Facebook
                </a>
              </div>
              <p className="mt-3 text-xs text-red-600/80">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
              Market headlines
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl">
              Real estate news highlights.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(news.length ? news.slice(0, 6) : []).map((item, index) => (
              <a
                key={`${item.source}-${item.title}-${index}`}
                className="rounded-2xl border border-red-200/70 bg-red-50 p-4 text-sm text-red-800 transition hover:border-red-300"
                href={item.link}
                target="_blank"
                rel="noreferrer"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-red-500/70">
                  {item.source}
                </div>
                <div className="mt-2 font-semibold">{item.title}</div>
                <div className="mt-2 text-xs text-red-500/70">
                  {item.pubDate || "Recent"}
                </div>
              </a>
            ))}
            {!news.length ? (
              <div className="rounded-2xl border border-red-200/70 bg-red-50 p-4 text-sm text-red-700">
                Headlines are temporarily unavailable. Please check back soon.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-red-200 via-rose-100 to-white py-20 text-red-900">
        <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-red-200/50 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-red-100/60 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl space-y-6 px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-red-600">
            Ready when you are
          </div>
          <h2 className="font-[var(--font-display)] text-4xl">
            Let’s map your next move together.
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-red-700">
            Private tours, in-depth pricing intelligence, and access to upcoming
            inventory before it hits the market.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white"
              href="#team"
            >
              Start a consultation
            </a>
            <button className="rounded-full border border-red-300 px-6 py-3 text-sm font-semibold text-red-900">
              Download market report
            </button>
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl px-6 py-12 text-sm text-red-600/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="font-[var(--font-display)] text-lg text-red-900">
            Hamdard Estate
          </div>
          <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.2em] text-red-600">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Careers</span>
          </div>
        </div>
        <div className="mt-6 text-xs text-red-500/70">
          © 2026 Hamdard Estate. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
