"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

function formatMoney(value) {
  if (!value && value !== 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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

  useEffect(() => {
    async function loadListing() {
      if (!supabase) {
        setStatus(
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, title, description, price, beds, baths, sqft, status, city, neighborhood, hero_image_url"
        )
        .eq("id", listingId)
        .maybeSingle();

      if (error) {
        setStatus(error.message);
        return;
      }

      if (!data) {
        setStatus("Listing not found.");
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
    }

    if (listingId) {
      loadListing();
    }
  }, [listingId, supabase]);

  if (status) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto w-full max-w-5xl px-6 py-16 text-sm text-slate-200/70">
          {status}
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-16">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-200">
            {listing.neighborhood || listing.city || "Citywide"}
          </div>
          <h1 className="mt-3 font-[var(--font-display)] text-4xl">
            {listing.title}
          </h1>
          <div className="mt-2 text-2xl font-semibold text-emerald-200">
            {formatMoney(listing.price)}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-200/80">
            <span>{listing.beds} beds</span>
            <span>{listing.baths} baths</span>
            <span>{listing.sqft} sq ft</span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]">
              {listing.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
              <div className="aspect-[16/10] w-full bg-slate-900/60">
                {listing.hero_image_url ? (
                  <img
                    alt={listing.title}
                    className="h-full w-full object-cover"
                    src={listing.hero_image_url}
                  />
                ) : null}
              </div>
            </div>
            {images.length ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                  >
                    <img
                      alt="Listing"
                      className="h-full w-full object-cover"
                      src={image.image_url}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80">
              <div className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                Overview
              </div>
              <p className="mt-4">
                {listing.description || "No description provided yet."}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80">
              <div className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                Next steps
              </div>
              <p className="mt-4">
                Contact the seller or schedule a tour using the inquiry form.
              </p>
              <a
                className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-900"
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
