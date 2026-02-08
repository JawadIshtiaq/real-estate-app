"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

export default function ListingsDashboard() {
  const supabase = getSupabase();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    async function loadDashboard() {
      if (!supabase) {
        setStatus(
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        return;
      }

      const { data } = await supabase.auth.getUser();
      const authUser = data?.user ?? null;
      setUser(authUser);

      if (!authUser) {
        setStatus("Sign in to see your listings.");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .maybeSingle();

      const currentRole = profileData?.role ?? "buyer";
      setRole(currentRole);

      if (currentRole !== "seller" && currentRole !== "admin") {
        setStatus("Buyer accounts do not have listings.");
        return;
      }

      const { data: listingData, error } = await supabase
        .from("listings")
        .select("id, title, price, status, city, neighborhood, created_at")
        .eq("created_by", authUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        setStatus(error.message);
        return;
      }

      setListings(listingData ?? []);
      setStatus("");
    }

    loadDashboard();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <a
              className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
              href="/"
            >
              Back to home
            </a>
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Listings
            </div>
            <h1 className="mt-3 font-[var(--font-display)] text-3xl">
              Your ads
            </h1>
          </div>
          <a
            className="rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
            href="/listings/new"
          >
            Post a new ad
          </a>
        </div>

        {status ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/70">
            {status}
          </div>
        ) : null}

        {user && role && (role === "seller" || role === "admin") ? (
          <div className="grid gap-4">
            {listings.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/70">
                No listings yet. Post your first ad.
              </div>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-300/70">
                        {listing.neighborhood || listing.city || "Citywide"}
                      </div>
                      <div className="mt-2 text-lg font-semibold">
                        {listing.title}
                      </div>
                    </div>
                    <div className="text-sm text-emerald-200">
                      ${Number(listing.price).toLocaleString("en-US")}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-300/70">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {listing.status}
                    </span>
                    <a
                      className="rounded-full border border-white/20 px-3 py-1 text-white"
                      href={`/marketplace/${listing.id}`}
                    >
                      View details
                    </a>
                    <a
                      className="rounded-full border border-white/20 px-3 py-1 text-white"
                      href={`/listings/${listing.id}/edit`}
                    >
                      Edit
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
