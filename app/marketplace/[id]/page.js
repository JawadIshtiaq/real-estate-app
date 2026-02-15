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
      <div className="min-h-screen bg-white text-red-950">
        <div className="mx-auto w-full max-w-5xl px-6 py-16 text-sm text-red-600/80">
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

  return (
    <div className="min-h-screen bg-white text-red-950">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-16">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
            {listing.neighborhood || listing.city || "Citywide"}
          </div>
          <h1 className="mt-3 font-[var(--font-display)] text-4xl">
            {listing.title}
          </h1>
          <div className="mt-2 text-2xl font-semibold text-red-700">
            {formatMoney(listing.price)}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-red-700/80">
            <span>{listing.beds} beds</span>
            <span>{listing.baths} baths</span>
            <span>{listing.sqft} {listing.area_unit || "sq ft"}</span>
            <span className="rounded-full border border-red-200 px-3 py-1 text-xs uppercase tracking-[0.2em]">
              {listing.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[28px] border border-red-200/70 bg-white">
              <div className="aspect-[16/10] w-full bg-red-50">
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
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-red-500/70">
                  <span>
                    {activeIndex + 1} / {allImages.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-full border border-red-300 px-3 py-1 text-red-800"
                      onClick={() =>
                        setActiveIndex((prev) =>
                          prev === 0 ? allImages.length - 1 : prev - 1
                        )
                      }
                    >
                      Prev
                    </button>
                    <button
                      className="rounded-full border border-red-300 px-3 py-1 text-red-800"
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
                          ? "border-red-500"
                          : "border-red-200"
                      } bg-white`}
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
                <div className="text-xs text-red-500/70">
                  Tip: use left/right arrow keys to browse photos.
                </div>
              </div>
            ) : null}
          </div>
          <div className="space-y-4">
            <div className="rounded-[28px] border border-red-200/70 bg-red-50 p-6 text-sm text-red-700/80">
              <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
                Overview
              </div>
              <p className="mt-4">
                {listing.description || "No description provided yet."}
              </p>
            </div>
            <div className="rounded-[28px] border border-red-200/70 bg-red-50 p-6 text-sm text-red-700/80">
              <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
                Next steps
              </div>
              <p className="mt-4">
                Contact the seller or schedule a tour using the inquiry form.
              </p>
              <div className="mt-4 text-xs text-red-600/80">
                {listing.contact_anonymous
                  ? `Contact: ${listing.contact_phone}`
                  : `Contact: ${listing.contact_name} · ${listing.contact_phone}`}
              </div>
              <a
                className="mt-6 inline-flex rounded-full bg-red-600 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
                href="/marketplace"
              >
                Back to marketplace
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
