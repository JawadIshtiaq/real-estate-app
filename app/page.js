import { getMarketSnapshot } from "@/lib/marketData";
import { getSupabaseServer } from "@/lib/supabaseServer";
import ishtiaqPhoto from "@/components/ishtiaq-new.jpeg";
import AmjadPhoto from "@/components/Amjad.png";
import FawadPhoto from "@/public/Fawad.png";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    photoPosition: "center top",
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
    photo: AmjadPhoto.src,
    photoPosition: "center top",
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
    <div className="min-h-screen bg-[#f7f5f0] text-[#17241f]">
      <div className="relative overflow-hidden bg-[#17291f] text-[#fffdf8]">
        <div className="premium-grid absolute inset-0 opacity-30" />
        <div className="absolute -right-24 top-0 h-[440px] w-[440px] rounded-full bg-[#b89b5e]/20 blur-3xl" />
        <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-[#d7bd83]">
              <span className="h-px w-10 bg-[#b89b5e]" />
              Karachi's private property desk
            </div>
            <h1 className="max-w-3xl font-[var(--font-display)] text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              A more considered way to find your next address.
            </h1>
            <p className="max-w-xl text-base leading-7 text-[#d9e0d8]/80 sm:text-lg">
              Exceptional homes, meaningful market intelligence, and personal advice from the first viewing to the final signature.
            </p>
            <div className="flex flex-wrap gap-3">
              <a className="rounded-full bg-[#b89b5e] px-6 py-3 text-sm font-semibold text-[#17241f] hover:bg-[#d7bd83]" href="/marketplace">Explore the collection</a>
              <a className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white hover:border-[#d7bd83]" href="#team">Speak with an advisor</a>
            </div>
          </div>
          <div className="rounded-[32px] border border-white/15 bg-[#243a2f]/90 p-7 text-white shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-9">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#d7bd83]">Find your place</div>
            <p className="mt-3 font-[var(--font-display)] text-3xl leading-tight text-white">A tailored search begins here.</p>
            <div className="mt-7 grid gap-3">
              <input className="h-12 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/45" placeholder="City or neighbourhood" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="h-12 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/45" placeholder="Property type" />
                <input className="h-12 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/45" placeholder="Budget" />
              </div>
              <a className="mt-2 rounded-2xl bg-[#fffdf8] px-5 py-3 text-center text-sm font-semibold text-[#17241f] hover:bg-[#d7bd83]" href="/marketplace">Search properties</a>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-7xl space-y-10 px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
              The collection
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl">
              Selected homes, exceptional locations.
            </h2>
          </div>
          <a
            className="rounded-full border border-[#b89b5e] px-4 py-2 text-sm text-[#564728] hover:bg-[#fffdf8]"
            href="/marketplace"
          >
            View all listings
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {featuredListings.map((listing) => (
            <article
              key={listing.id}
                className="group flex h-full flex-col rounded-[28px] border border-[#e2ddd1] bg-[#fffdf8] p-4 shadow-[0_10px_35px_rgba(29,43,35,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(29,43,35,0.12)]"
            >
              <div className="h-52 overflow-hidden rounded-[20px] bg-[#e9e6dc]">
                {listing.hero_image_url ? (
                  <img
                    alt={listing.title}
                    className="h-full w-full origin-top object-cover transition duration-500 group-hover:scale-105"
                    src={listing.hero_image_url}
                  />
                ) : null}
              </div>
              <div className="mt-5 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#7a8278]">
                <span>
                  {listing.neighborhood || listing.city || listing.location}
                </span>
                <span className="rounded-full border border-[#d9d2c1] px-3 py-1 text-[10px] text-[#756039]">
                  {listing.status || listing.tag || "Featured"}
                </span>
              </div>
              <h3 className="mt-6 font-[var(--font-display)] text-xl">
                {listing.title}
              </h3>
              <div className="mt-2 text-2xl font-semibold text-[#1d3328]">
                {formatMoney(listing.price)}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#59645d]">
                <span>{listing.beds} beds</span>
                <span>{listing.baths} baths</span>
                <span>{listing.sqft} {listing.area_unit || "sq ft"}</span>
              </div>
              <a
                className="mt-auto block w-full rounded-2xl bg-[#1d3328] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#30483b]"
                href={`/marketplace/${listing.id}`}
              >
                View details
              </a>
            </article>
          ))}
        </div>
      </section>

      <div className="relative hidden overflow-hidden">
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

      <section className="border-y border-[#ded8ca] bg-[#ece8df] py-20">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#9a7b3d]">
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
                className="rounded-[28px] border border-[#ded8ca] bg-[#fffdf8] p-7 shadow-[0_12px_35px_rgba(29,43,35,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(29,43,35,0.10)]"
              >
                <h3 className="font-[var(--font-display)] text-xl">
                  {hood.name}
                </h3>
                <div className="mt-2 text-sm text-[#756039]">
                  {hood.homes}
                </div>
                <p className="mt-4 text-sm leading-6 text-[#59645d]">{hood.vibe}</p>
                <button className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#9a7b3d]">
                  Explore district
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="mx-auto w-full max-w-7xl space-y-10 px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#9a7b3d]">
              Leadership
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl">
              The people guiding Hamdard Estate.
            </h2>
          </div>
          <button className="rounded-full border border-[#b89b5e] px-4 py-2 text-sm text-[#564728] hover:bg-[#fffdf8]">
            Meet the team
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {team.map((member) => (
            <div
              key={member.name}
              className="group rounded-[28px] border border-[#ded8ca] bg-[#fffdf8] p-5 shadow-[0_12px_35px_rgba(29,43,35,0.05)]"
            >
              <div className="aspect-square w-full overflow-hidden rounded-[20px] bg-[#e8e5dc]">
                {member.photo ? (
                  <img
                    alt={member.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    src={member.photo}
                    style={{ objectPosition: member.photoPosition || "center" }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#9a7b3d]">
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
              <div className="text-xs text-[#756039]">{member.role}</div>
              <a
                className="mt-1 inline-block text-xs text-[#637069] underline decoration-[#b89b5e] underline-offset-2 transition hover:text-[#1d3328]"
                href={`tel:${member.phone.replace(/\s+/g, "")}`}
                aria-label={`Call ${member.name} at ${member.phone}`}
              >
                {member.phone}
              </a>
              <div className="mt-3 flex gap-2">
                <a
                  className="rounded-full border border-[#d9d2c1] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#564728] transition hover:border-[#b89b5e]"
                  href={member.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
                <a
                  className="rounded-full border border-[#d9d2c1] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#564728] transition hover:border-[#b89b5e]"
                  href={member.facebook}
                  target="_blank"
                  rel="noreferrer"
                >
                  Facebook
                </a>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#637069]">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#ded8ca] bg-[#fffdf8] py-16">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#9a7b3d]">
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
                className="rounded-[20px] border border-[#ded8ca] bg-[#f7f5f0] p-5 text-sm text-[#30483b] transition hover:border-[#b89b5e]"
                href={item.link}
                target="_blank"
                rel="noreferrer"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#9a7b3d]">
                  {item.source}
                </div>
                <div className="mt-2 font-semibold">{item.title}</div>
                <div className="mt-2 text-xs text-[#7a8278]">
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

      <section className="relative overflow-hidden bg-[#17291f] py-20 text-[#fffdf8]">
        <div className="premium-grid absolute inset-0 opacity-30" />
        <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-[#b89b5e]/25 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#6b8a73]/20 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl space-y-6 px-6 text-center">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#d7bd83]">
            Ready when you are
          </div>
          <h2 className="font-[var(--font-display)] text-4xl">
            Let’s map your next move together.
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-white/70">
            Private tours, in-depth pricing intelligence, and access to upcoming
            inventory before it hits the market.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              className="rounded-full bg-[#b89b5e] px-6 py-3 text-sm font-semibold text-[#17241f] hover:bg-[#d7bd83]"
              href="#team"
            >
              Start a consultation
            </a>
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-6 py-12 text-sm text-[#637069]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="font-[var(--font-display)] text-lg text-[#17291f]">
            Hamdard Estate
          </div>
          <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.18em] text-[#7a8278]">
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
