"use client";

import { useEffect, useMemo, useState } from "react";
import { assertSupabase } from "@/lib/supabaseClient";

const defaultFilters = {
  query: "",
  minPrice: "",
  maxPrice: "",
  beds: "Any",
  status: "active",
};

function formatMoney(value) {
  if (!value && value !== 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MarketplacePage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const supabase = useMemo(() => {
    try {
      return assertSupabase();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    }

    loadUser();

    async function loadListings() {
      setLoading(true);
      setError("");

      let query = supabase
        .from("listings")
        .select(
          "id, title, price, beds, baths, sqft, area_unit, status, city, neighborhood, hero_image_url"
        )
        .order("created_at", { ascending: false });

      if (filters.status !== "Any") {
        query = query.eq("status", filters.status);
      }
      if (filters.beds !== "Any") {
        query = query.gte("beds", Number(filters.beds));
      }
      if (filters.minPrice) {
        query = query.gte("price", Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte("price", Number(filters.maxPrice));
      }
      if (filters.query) {
        const value = `%${filters.query}%`;
        query = query.or(
          `title.ilike.${value},city.ilike.${value},neighborhood.ilike.${value}`
        );
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        setError(queryError.message);
        setListings([]);
      } else {
        setListings(data || []);
      }
      setLoading(false);
    }

    loadListings();
  }, [filters, supabase]);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#17241f]">
      <header className="border-b border-[#d9d2c1] bg-[#fffdf8]">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-7">
          <div>
            <a
              className="text-[10px] uppercase tracking-[0.28em] text-[#9a7b3d]"
              href="/"
            >
              Back to home
            </a>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#9a7b3d]">
              Marketplace
            </div>
            <h1 className="mt-2 font-[var(--font-display)] text-4xl">
              Explore the collection.
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#637069]">
            {!user ? (
              <>
                <a
                  className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white"
                  href="/sign-in"
                >
                  Sign in
                </a>
                <a
                  className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white"
                  href="/sign-up"
                >
                  Sign up
                </a>
              </>
            ) : null}
            <a
              className="rounded-full border border-[#d9d2c1] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#314137] hover:border-[#b89b5e]"
              href="/listings"
            >
              My ads
            </a>
            <a
              className="rounded-full bg-[#1d3328] px-3 py-1 text-xs uppercase tracking-[0.16em] text-white hover:bg-[#30483b]"
              href="/listings/new"
            >
              Post an ad
            </a>
            <span>{loading ? "Loading..." : `${listings.length} listings`}</span>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-6 py-12">
        <div className="grid gap-4 rounded-[28px] border border-[#ded8ca] bg-[#fffdf8] p-5 shadow-[0_12px_35px_rgba(29,43,35,0.05)] lg:grid-cols-[1.5fr_0.7fr_0.7fr_0.6fr_0.6fr]">
          <input
            className="h-12 rounded-2xl border border-[#ded8ca] bg-[#f7f5f0] px-4 text-sm text-[#17241f] placeholder:text-[#9aa39b]"
            placeholder="Search by city, neighborhood, or listing"
            value={filters.query}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, query: event.target.value }))
            }
          />
          <input
            className="h-12 rounded-2xl border border-[#ded8ca] bg-[#f7f5f0] px-4 text-sm text-[#17241f] placeholder:text-[#9aa39b]"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, minPrice: event.target.value }))
            }
          />
          <input
            className="h-12 rounded-2xl border border-[#ded8ca] bg-[#f7f5f0] px-4 text-sm text-[#17241f] placeholder:text-[#9aa39b]"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))
            }
          />
          <select
            className="h-12 rounded-2xl border border-[#ded8ca] bg-[#f7f5f0] px-4 text-sm text-[#17241f]"
            value={filters.beds}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, beds: event.target.value }))
            }
          >
            <option value="Any">Beds</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
          <select
            className="h-12 rounded-2xl border border-[#ded8ca] bg-[#f7f5f0] px-4 text-sm text-[#17241f]"
            value={filters.status}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, status: event.target.value }))
            }
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="Any">Any</option>
          </select>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-300/60 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-3xl border border-red-200/70 bg-red-50 p-10 text-center text-sm text-red-600/80">
              Loading marketplace data...
            </div>
          ) : listings.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-red-200/70 bg-red-50 p-10 text-center text-sm text-red-600/80">
              No listings found. Adjust the filters or seed the database.
            </div>
          ) : (
            listings.map((listing) => (
              <article
                key={listing.id}
                className="group flex h-full flex-col rounded-[28px] border border-[#ded8ca] bg-[#fffdf8] p-4 shadow-[0_10px_32px_rgba(29,43,35,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(29,43,35,0.12)]"
              >
                <div className="h-52 overflow-hidden rounded-[20px] bg-[#e8e5dc]">
                  {listing.hero_image_url ? (
                    <img
                      alt={listing.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      src={listing.hero_image_url}
                    />
                  ) : null}
                </div>
                <div className="mt-5 text-[10px] uppercase tracking-[0.2em] text-[#7a8278]">
                  {listing.neighborhood || listing.city || "Citywide"}
                </div>
                <h2 className="mt-2 font-[var(--font-display)] text-xl">
                  {listing.title}
                </h2>
                <div className="mt-2 text-2xl font-semibold text-[#1d3328]">
                  {formatMoney(listing.price)}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#59645d]">
                  <span>{listing.beds} beds</span>
                  <span>{listing.baths} baths</span>
                  <span>{listing.sqft} {listing.area_unit || "sq ft"}</span>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-[10px] uppercase tracking-[0.16em] text-[#7a8278]">
                  <span className="rounded-full border border-[#d9d2c1] px-3 py-1">
                    {listing.status}
                  </span>
                  <a
                    className="rounded-full border border-[#b89b5e] px-3 py-1 text-[#564728] hover:bg-[#f4eedf]"
                    href={`/marketplace/${listing.id}`}
                  >
                    View details
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
