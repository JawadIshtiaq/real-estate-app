"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

const inputClass =
  "h-12 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white placeholder:text-slate-400 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/30";
const textareaClass =
  "min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-400 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/30";
const labelClass = "text-xs uppercase tracking-[0.2em] text-slate-300/70";

export default function EditListingPage() {
  const supabase = getSupabase();
  const routeParams = useParams();
  const listingId = routeParams?.id;
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [role, setRole] = useState(null);

  useEffect(() => {
    async function loadListing() {
      if (!supabase) {
        setStatus(
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user ?? null;
      if (!authUser) {
        setStatus("Sign in to edit listings.");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .maybeSingle();
      setRole(profileData?.role ?? "buyer");

      if (profileData?.role !== "seller" && profileData?.role !== "admin") {
        setStatus("Buyer accounts cannot edit listings.");
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
        setStatus("Listing not found or not accessible.");
        return;
      }

      setForm({
        ...data,
        price: data.price?.toString() ?? "",
        beds: data.beds?.toString() ?? "0",
        baths: data.baths?.toString() ?? "0",
        sqft: data.sqft?.toString() ?? "0",
      });
      setStatus("");
    }

    if (listingId) {
      loadListing();
    }
  }, [listingId, supabase]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase || !form) return;
    setStatus("Saving changes...");
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      beds: Number(form.beds),
      baths: Number(form.baths),
      sqft: Number(form.sqft),
      status: form.status,
      city: form.city,
      neighborhood: form.neighborhood,
      hero_image_url: form.hero_image_url || null,
    };

    const { error } = await supabase
      .from("listings")
      .update(payload)
      .eq("id", form.id);

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Changes saved.");
    }
  }

  async function handleDelete() {
    if (!supabase || !form) return;
    const confirmed = window.confirm(
      "Delete this listing? This action cannot be undone."
    );
    if (!confirmed) return;
    setStatus("Deleting listing...");
    const { error } = await supabase.from("listings").delete().eq("id", form.id);
    if (error) {
      setStatus(error.message);
    } else {
      window.location.href = "/listings";
    }
  }

  if (status && !form) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto w-full max-w-2xl px-6 py-16 text-sm text-slate-200/70">
          {status}
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-200">
            Edit listing
          </div>
          <h1 className="mt-3 font-[var(--font-display)] text-3xl">
            Update your ad
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="title">
              Listing title
            </label>
            <input
              className={inputClass}
              id="title"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="description">
              Description
            </label>
            <textarea
              className={textareaClass}
              id="description"
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <label className={labelClass} htmlFor="price">
                Price (USD)
              </label>
              <input
                className={inputClass}
                id="price"
                value={form.price}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price: event.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <label className={labelClass} htmlFor="beds">
                Bedrooms
              </label>
              <input
                className={inputClass}
                id="beds"
                value={form.beds}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, beds: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <label className={labelClass} htmlFor="baths">
                Bathrooms
              </label>
              <input
                className={inputClass}
                id="baths"
                value={form.baths}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, baths: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <label className={labelClass} htmlFor="sqft">
                Square feet
              </label>
              <input
                className={inputClass}
                id="sqft"
                value={form.sqft}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sqft: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <label className={labelClass} htmlFor="city">
                City
              </label>
              <input
                className={inputClass}
                id="city"
                value={form.city ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, city: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <label className={labelClass} htmlFor="neighborhood">
                Neighborhood
              </label>
              <input
                className={inputClass}
                id="neighborhood"
                value={form.neighborhood ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    neighborhood: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="hero_image_url">
              Hero image URL
            </label>
            <input
              className={inputClass}
              id="hero_image_url"
              value={form.hero_image_url ?? ""}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  hero_image_url: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select
              className={inputClass}
              id="status"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value }))
              }
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <button
            className="h-12 rounded-2xl bg-emerald-400 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.35)]"
            type="submit"
          >
            Save changes
          </button>
          <button
            className="h-12 rounded-2xl border border-rose-400/40 text-sm font-semibold text-rose-100 transition hover:border-rose-300 hover:shadow-[0_0_30px_rgba(248,113,113,0.35)]"
            type="button"
            onClick={handleDelete}
          >
            Delete listing
          </button>
          <div className="text-xs text-slate-200/70">{status}</div>
        </form>
      </div>
    </div>
  );
}
