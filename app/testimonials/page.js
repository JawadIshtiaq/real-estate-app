const testimonials = [
  {
    quote:
      "Hamdard Estate made a major decision feel calm and clear. Every viewing was relevant, and their pricing guidance was exactly right.",
    name: "Sana A.",
    detail: "Homeowner, DHA Karachi",
  },
  {
    quote:
      "We needed a family home on a tight timeline. The team understood our priorities immediately and negotiated with real care.",
    name: "Omar R.",
    detail: "Buyer, Clifton",
  },
  {
    quote:
      "From photography to viewings and the final agreement, the process was considered, responsive, and refreshingly straightforward.",
    name: "Areeba K.",
    detail: "Seller, Bahria Town Karachi",
  },
  {
    quote:
      "Their local knowledge helped us see the long-term value in the right location, not simply the most attractive listing.",
    name: "Fahad M.",
    detail: "Investor, Karachi",
  },
  {
    quote:
      "I appreciated the discretion and the attention to detail. It felt like a genuinely tailored property search.",
    name: "Maham S.",
    detail: "Buyer, DHA City",
  },
  {
    quote:
      "Professional, well-connected, and always available when it mattered. I would confidently work with Hamdard Estate again.",
    name: "Haris N.",
    detail: "Landlord, Karachi",
  },
];

export const metadata = {
  title: "Client Testimonials | Hamdard Estate",
  description: "What clients say about working with Hamdard Estate.",
};

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#17241f]">
      <section className="relative overflow-hidden bg-[#17291f] text-[#fffdf8]">
        <div className="premium-grid absolute inset-0 opacity-30" />
        <div className="absolute -right-20 -top-16 h-80 w-80 rounded-full bg-[#b89b5e]/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-[#d7bd83]">
              <span className="h-px w-10 bg-[#b89b5e]" />
              Client stories
            </div>
            <h1 className="mt-6 font-[var(--font-display)] text-5xl leading-[0.95] sm:text-6xl">
              Trusted with meaningful moves.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              Buying, selling, or investing in a home is personal. Here is what our clients say about the experience of doing it with Hamdard Estate.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#9a7b3d]">A considered service</div>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl sm:text-4xl">Words from our clients.</h2>
          </div>
          <a className="rounded-full border border-[#b89b5e] px-5 py-2.5 text-sm font-medium text-[#564728] hover:bg-[#fffdf8]" href="/marketplace">
            Explore properties
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className={`flex min-h-72 flex-col rounded-[28px] border p-7 shadow-[0_12px_35px_rgba(29,43,35,0.05)] ${
                index === 0
                  ? "border-[#1d3328] bg-[#1d3328] text-[#fffdf8]"
                  : "border-[#ded8ca] bg-[#fffdf8]"
              }`}
            >
              <div className={`font-[var(--font-display)] text-5xl leading-none ${index === 0 ? "text-[#d7bd83]" : "text-[#b89b5e]"}`}>
                “
              </div>
              <blockquote className={`mt-4 text-lg leading-8 ${index === 0 ? "text-white/85" : "text-[#30483b]"}`}>
                {testimonial.quote}
              </blockquote>
              <footer className={`mt-auto border-t pt-5 ${index === 0 ? "border-white/15" : "border-[#ded8ca]"}`}>
                <div className="text-sm font-semibold">{testimonial.name}</div>
                <div className={`mt-1 text-[10px] uppercase tracking-[0.16em] ${index === 0 ? "text-[#d7bd83]" : "text-[#7a8278]"}`}>
                  {testimonial.detail}
                </div>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[#ded8ca] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-12">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#9a7b3d]">Ready when you are</div>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl">Let’s make your next move considered.</h2>
          </div>
          <a className="rounded-full bg-[#1d3328] px-6 py-3 text-sm font-semibold text-white hover:bg-[#30483b]" href="/marketplace">
            View the collection
          </a>
        </div>
      </section>
    </main>
  );
}
