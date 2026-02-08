const listings = [
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
    name: "Marina Vista",
    homes: "214 listings",
    vibe: "Waterfront promenades and architectural icons.",
  },
  {
    name: "Northline Arts",
    homes: "128 listings",
    vibe: "Gallery blocks, artisan cafes, skyline views.",
  },
  {
    name: "Hudson Ridge",
    homes: "96 listings",
    vibe: "Tree-canopied lanes with modern estates.",
  },
];

const testimonials = [
  {
    quote:
      "Every showing felt curated. We found a home that fits our mornings and our weekends.",
    name: "Ariana & Theo",
    role: "Purchased in Marina Vista",
  },
  {
    quote:
      "The market data snapshots were the advantage we needed to move with confidence.",
    name: "Mila R.",
    role: "Investor, Northline Arts",
  },
  {
    quote:
      "From the first walkthrough to closing, the team stayed a step ahead.",
    name: "Jordan L.",
    role: "Seller, Hudson Ridge",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-emerald-500/30 via-cyan-400/20 to-transparent blur-3xl" />
        <div className="absolute left-0 top-32 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-amber-400/25 via-orange-500/10 to-transparent blur-3xl" />

        <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-200">
              Signature Real Estate
            </div>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Homes that feel curated for the life you want to live.
            </h1>
            <p className="max-w-xl text-base text-slate-200/80 sm:text-lg">
              Atria pairs architectural standouts with data-driven market
              intelligence, so every move feels intentional, confident, and
              exquisitely timed.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300">
                Explore listings
              </button>
              <a
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
                href="/marketplace"
              >
                Open marketplace
              </a>
              <button className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60">
                Talk to an advisor
              </button>
            </div>

            <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-slate-200/70">Average days</div>
                  <div className="text-2xl font-semibold">21</div>
                </div>
                <div>
                  <div className="text-sm text-slate-200/70">Yearly volume</div>
                  <div className="text-2xl font-semibold">$2.8B</div>
                </div>
                <div>
                  <div className="text-sm text-slate-200/70">Client return</div>
                  <div className="text-2xl font-semibold">68%</div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white placeholder:text-slate-400"
                  placeholder="City or neighborhood"
                />
                <input
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white placeholder:text-slate-400"
                  placeholder="Price range"
                />
                <button className="h-12 rounded-2xl bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-200/70">
                <span>Market pulse</span>
                <span>Live</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="text-sm text-slate-200/80">
                    Median list price
                  </div>
                  <div className="mt-2 text-3xl font-semibold">$1.32M</div>
                  <div className="mt-3 text-xs text-emerald-200">
                    +4.6% month-over-month
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="text-sm text-slate-200/80">
                    Inventory trend
                  </div>
                  <div className="mt-2 text-2xl font-semibold">Upward</div>
                  <div className="mt-3 text-xs text-amber-200">
                    143 new listings this week
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-200/70">
                Concierge
              </div>
              <p className="mt-4 text-sm text-slate-200/80">
                Curated tours, architectural insights, and bespoke relocation
                services designed around your calendar.
              </p>
              <button className="mt-6 rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:border-white/60">
                View services
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-6xl space-y-10 px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Featured listings
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl">
              Distinctive homes across the city.
            </h2>
          </div>
          <button className="rounded-full border border-white/20 px-4 py-2 text-sm">
            View all 312 listings
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {listings.map((listing) => (
            <article
              key={listing.id}
              className="rounded-[28px] border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-white/30"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-300/70">
                <span>{listing.location}</span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] text-emerald-200">
                  {listing.tag}
                </span>
              </div>
              <h3 className="mt-6 font-[var(--font-display)] text-xl">
                {listing.title}
              </h3>
              <div className="mt-2 text-2xl font-semibold text-emerald-200">
                {listing.price}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-200/80">
                <span>{listing.beds} beds</span>
                <span>{listing.baths} baths</span>
                <span>{listing.sqft} sq ft</span>
              </div>
              <button className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Schedule a viewing
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white/5 py-20">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Neighborhoods
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl">
              Curated districts with a distinct point of view.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {neighborhoods.map((hood) => (
              <div
                key={hood.name}
                className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6"
              >
                <h3 className="font-[var(--font-display)] text-xl">
                  {hood.name}
                </h3>
                <div className="mt-2 text-sm text-slate-200/70">
                  {hood.homes}
                </div>
                <p className="mt-4 text-sm text-slate-200/80">{hood.vibe}</p>
                <button className="mt-6 text-xs uppercase tracking-[0.2em] text-emerald-200">
                  Explore district
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-10 px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Client stories
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl">
              Guided by taste, anchored by strategy.
            </h2>
          </div>
          <button className="rounded-full border border-white/20 px-4 py-2 text-sm">
            Read more
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-[28px] border border-white/10 bg-white/5 p-6"
            >
              <p className="text-sm text-slate-100/80">“{item.quote}”</p>
              <div className="mt-6 text-sm font-semibold">{item.name}</div>
              <div className="text-xs text-slate-200/60">{item.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-300 via-teal-200 to-amber-200 py-20 text-slate-900">
        <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-white/50 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl space-y-6 px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-700">
            Ready when you are
          </div>
          <h2 className="font-[var(--font-display)] text-4xl">
            Let’s map your next move together.
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-700">
            Private tours, in-depth pricing intelligence, and access to upcoming
            inventory before it hits the market.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
              Start a consultation
            </button>
            <button className="rounded-full border border-slate-900/30 px-6 py-3 text-sm font-semibold text-slate-900">
              Download market report
            </button>
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl px-6 py-12 text-sm text-slate-200/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="font-[var(--font-display)] text-lg text-white">
            Hamdard Estate
          </div>
          <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.2em]">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Careers</span>
          </div>
        </div>
        <div className="mt-6 text-xs text-slate-400">
          © 2026 Hamdard Estate. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
