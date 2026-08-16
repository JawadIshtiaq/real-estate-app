"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

export default function ListingsDashboard() {
  const supabase = getSupabase();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      if (!supabase) {
        setStatus(
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      const authUser = data?.user ?? null;
      setUser(authUser);

      if (!authUser) {
        setStatus("Sign in to see your listings.");
        setLoading(false);
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
        setLoading(false);
        return;
      }

      const { data: listingData, error } = await supabase
        .from("listings")
        .select("id, title, price, status, city, neighborhood, created_at")
        .eq("created_by", authUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        setStatus(error.message);
        setLoading(false);
        return;
      }

      setListings(listingData ?? []);
      setStatus("");
      setLoading(false);
    }

    loadDashboard();
  }, [supabase]);

  async function handleQuickDelete(listing) {
    if (!supabase || !user?.id || deletingId) return;

    const confirmed = window.confirm(
      "Delete this listing? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(listing.id);
    setStatus("Deleting listing...");

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id)
      .eq("created_by", user.id);

    if (error) {
      setStatus(error.message);
      setDeletingId(null);
      return;
    }

    setListings((prev) => prev.filter((item) => item.id !== listing.id));
    setStatus("");
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#17241f]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-6 py-10 lg:py-14">
        <div className="relative flex flex-wrap items-end justify-between gap-5 overflow-hidden rounded-[32px] bg-[#17291f] px-7 py-9 text-[#fffdf8] shadow-[0_20px_50px_rgba(29,43,35,0.15)] sm:px-10">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#b89b5e]/20 blur-3xl" />
          <div>
            <a
              className="relative text-[10px] uppercase tracking-[0.28em] text-[#d7bd83] hover:text-white"
              href="/"
            >
              Back to home
            </a>
            <div className="relative mt-5 text-[10px] uppercase tracking-[0.28em] text-[#d7bd83]">
              Listings
            </div>
            <h1 className="relative mt-3 font-[var(--font-display)] text-4xl sm:text-5xl">
              Your ads
            </h1>
          </div>
          <a
            className="relative rounded-full bg-[#b89b5e] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#17241f] hover:bg-[#d7bd83]"
            href="/listings/new"
          >
            Post a new ad
          </a>
        </div>

        {status ? (
          <div className="rounded-3xl border border-red-200/70 bg-red-50 p-6 text-sm text-red-600/80">
            {status}
          </div>
        ) : null}

        {user && role && (role === "seller" || role === "admin") ? (
          <div className="grid gap-4">
            {listings.length === 0 ? (
              <div className="rounded-3xl border border-red-200/70 bg-red-50 p-6 text-sm text-red-600/80">
                No listings yet. Post your first ad.
              </div>
            ) : (
              listings.map((listing) => {
                const isDeleting = deletingId === listing.id;

                return (
                  <div
                    key={listing.id}
                    className="rounded-[26px] border border-[#ded8ca] bg-[#fffdf8] p-6 shadow-[0_12px_35px_rgba(29,43,35,0.05)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-red-500/70">
                          {listing.neighborhood || listing.city || "Citywide"}
                        </div>
                        <div className="mt-2 text-lg font-semibold">
                          {listing.title}
                        </div>
                      </div>
                      <div className="text-sm text-red-700">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "PKR",
                          maximumFractionDigits: 0,
                        }).format(Number(listing.price))}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-red-500/70">
                      <span className="rounded-full border border-red-200 px-3 py-1">
                        {listing.status}
                      </span>
                      <a
                        className="rounded-full border border-red-300 px-3 py-1 text-red-800"
                        href={`/marketplace/${listing.id}`}
                      >
                        View details
                      </a>
                      <a
                        className="rounded-full border border-red-300 px-3 py-1 text-red-800"
                        href={`/listings/${listing.id}/edit`}
                      >
                        Edit
                      </a>
                      <button
                        className="rounded-full border border-red-600 bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={Boolean(deletingId)}
                        onClick={() => handleQuickDelete(listing)}
                        type="button"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

