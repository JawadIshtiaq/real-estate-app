"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

function formatMoney(value) {
  if (!value && value !== 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function phoneToTel(phone) {
  const value = String(phone || "").trim();
  if (!value) return "";
  const cleaned = value.replace(/[^+\d]/g, "");
  return cleaned.startsWith("+") ? cleaned : cleaned.replace(/\+/g, "");
}

function phoneToWhatsapp(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  return digits;
}

export default function ListingDetailPage() {
  const supabase = getSupabase();
  const routeParams = useParams();
  const listingId = routeParams?.id;
  const [listing, setListing] = useState(null);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListing() {
      if (!supabase) {
        setStatus(
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, title, description, price, beds, baths, sqft, area_unit, status, city, neighborhood, hero_image_url, contact_anonymous, contact_name, contact_phone"
        )
        .eq("id", listingId)
        .maybeSingle();

      if (error) {
        setStatus(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setStatus("Listing not found.");
        setLoading(false);
        return;
      }

      setListing(data);
      setStatus("");

      const { data: imageData } = await supabase
        .from("listing_images")
        .select("id, image_url, sort_order")
        .eq("listing_id", data.id)
        .order("sort_order", { ascending: true });

      setImages(imageData ?? []);
      setLoading(false);
    }

    if (listingId) {
      loadListing();
    }
  }, [listingId, supabase]);

  useEffect(() => {
    function handleKey(event) {
      if (!images.length) return;
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % images.length);
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1
        );
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length]);

  if (status) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] text-[#17241f]">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 text-sm text-[#637069]">
          {status}
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const allImages = [
    ...(listing.hero_image_url ? [{ id: "hero", image_url: listing.hero_image_url }] : []),
    ...images,
  ].filter(
    (item, index, array) =>
      array.findIndex((entry) => entry.image_url === item.image_url) === index
  );

  const currentImage =
    allImages.length > 0 ? allImages[activeIndex % allImages.length] : null;
  const telHref = phoneToTel(listing.contact_phone);
  const whatsappNumber = phoneToWhatsapp(listing.contact_phone);
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hello, I am interested in ${listing.title}. Is it still available?`
      )}`
    : "";

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#17241f]">
      <div className="mx-auto w-full max-w-7xl space-y-9 px-6 py-12 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#d9d2c1] pb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#9a7b3d]">
              {listing.neighborhood || listing.city || "Citywide"}
            </div>
            <h1 className="mt-3 max-w-3xl font-sans text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
              {listing.title}
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <div className="font-sans text-3xl font-semibold tracking-[-0.025em] text-[#1d3328]">
              {formatMoney(listing.price)}
            </div>
            <span className="mt-2 inline-block rounded-full border border-[#c9bea8] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#756039]">
              {listing.status}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[30px] border border-[#ded8ca] bg-[#e8e5dc] shadow-[0_18px_50px_rgba(29,43,35,0.10)]">
              <div className="aspect-[16/10] w-full bg-[#e8e5dc]">
                {currentImage?.image_url ? (
                  <img
                    alt={listing.title}
                    className="h-full w-full object-cover"
                    src={currentImage.image_url}
                  />
                ) : null}
              </div>
            </div>
            {allImages.length ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#7a8278]">
                  <span>
                    {activeIndex + 1} / {allImages.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-full border border-[#d9d2c1] px-3 py-1 text-[#314137] hover:border-[#b89b5e]"
                      onClick={() =>
                        setActiveIndex((prev) =>
                          prev === 0 ? allImages.length - 1 : prev - 1
                        )
                      }
                    >
                      Prev
                    </button>
                    <button
                      className="rounded-full border border-[#d9d2c1] px-3 py-1 text-[#314137] hover:border-[#b89b5e]"
                      onClick={() =>
                        setActiveIndex((prev) =>
                          (prev + 1) % allImages.length
                        )
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {allImages.map((image, index) => (
                    <button
                      key={`${image.id}-${index}`}
                      className={`aspect-[4/3] overflow-hidden rounded-2xl border ${
                        index === activeIndex
                          ? "border-[#b89b5e]"
                          : "border-[#ded8ca]"
                      } bg-[#fffdf8]`}
                      onClick={() => setActiveIndex(index)}
                    >
                      <img
                        alt="Listing"
                        className="h-full w-full object-cover"
                        src={image.image_url}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs text-[#7a8278]">
                  Tip: use left/right arrow keys to browse photos.
                </div>
              </div>
            ) : null}
          </div>
          <div className="space-y-5">
            <div className="rounded-[28px] border border-[#ded8ca] bg-[#fffdf8] p-7 text-base leading-8 text-[#435149] shadow-[0_12px_35px_rgba(29,43,35,0.05)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#756039]">
                Overview
              </div>
              <p className="mt-4">
                {listing.description || "No description provided yet."}
              </p>
            </div>
            <div className="rounded-[28px] bg-[#1d3328] p-7 text-base leading-8 text-[#ecf0ec] shadow-[0_18px_45px_rgba(29,43,35,0.16)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d7bd83]">
                Private viewing
              </div>
              <p className="mt-4">
                Contact the seller or schedule a tour using the inquiry form.
              </p>
              <div className="mt-5 border-t border-white/15 pt-5 text-sm font-medium text-[#ecf0ec]/85">
                {listing.contact_anonymous ? (
                  <>
                    Contact:{" "}
                    {telHref ? (
                      <a className="underline" href={`tel:${telHref}`}>
                        {listing.contact_phone}
                      </a>
                    ) : (
                      listing.contact_phone
                    )}
                  </>
                ) : (
                  <>
                    Contact: {listing.contact_name} ·{" "}
                    {telHref ? (
                      <a className="underline" href={`tel:${telHref}`}>
                        {listing.contact_phone}
                      </a>
                    ) : (
                      listing.contact_phone
                    )}
                  </>
                )}
              </div>
              <a
                className="mt-7 inline-flex rounded-full bg-[#b89b5e] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#17241f] hover:bg-[#d7bd83]"
                href="/marketplace"
              >
                Back to marketplace
              </a>
              {whatsappHref ? (
                <a
                  className="mt-3 inline-flex rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-[#d7bd83] hover:text-[#d7bd83]"
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp the seller
                </a>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid gap-3 border-t border-[#d9d2c1] pt-6 text-base text-[#536058] sm:grid-cols-3">
          <div className="rounded-2xl bg-[#fffdf8] px-4 py-3"><strong className="font-semibold text-[#1d3328]">{listing.beds}</strong> bedrooms</div>
          <div className="rounded-2xl bg-[#fffdf8] px-4 py-3"><strong className="font-semibold text-[#1d3328]">{listing.baths}</strong> bathrooms</div>
          <div className="rounded-2xl bg-[#fffdf8] px-4 py-3"><strong className="font-semibold text-[#1d3328]">{listing.sqft}</strong> {listing.area_unit || "sq ft"}</div>
        </div>
      </div>
    </div>
  );
}
