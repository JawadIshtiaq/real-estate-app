"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import LoadingOverlay from "@/components/loading-overlay";

const PRICE_UNITS = { Thousand: 1000, Lakh: 100000, Crore: 10000000 };

const inputClass =
  "h-12 w-full rounded-2xl border border-red-200 bg-white px-4 text-base text-red-900 placeholder:text-red-300 transition focus:border-red-400 focus:ring-2 focus:ring-red-200";
const textareaClass =
  "min-h-[150px] w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-base leading-7 text-red-900 placeholder:text-red-300 transition focus:border-red-400 focus:ring-2 focus:ring-red-200";
const labelClass = "text-sm font-semibold text-red-800";

export default function EditListingPage() {
  const supabase = getSupabase();
  const routeParams = useParams();
  const listingId = routeParams?.id;
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

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
          "id, title, description, price, beds, baths, sqft, area_unit, status, city, neighborhood, hero_image_url, contact_anonymous, contact_name, contact_phone"
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
        price: data.price ? (Number(data.price) / 1000).toString() : "",
        price_unit: "Thousand",
        beds: data.beds?.toString() ?? "0",
        baths: data.baths?.toString() ?? "0",
        sqft: data.sqft?.toString() ?? "0",
        area_unit: data.area_unit ?? "sq ft",
        contact_anonymous:
          typeof data.contact_anonymous === "boolean"
            ? data.contact_anonymous
            : true,
        contact_name: data.contact_name ?? "",
        contact_phone: data.contact_phone ?? "",
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
    if (!form.contact_phone) {
      setStatus("Phone number is required.");
      return;
    }
    setLoading(true);
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price) * PRICE_UNITS[form.price_unit],
      beds: Number(form.beds),
      baths: Number(form.baths),
      sqft: Number(form.sqft),
      area_unit: form.area_unit,
      status: form.status,
      city: form.city,
      neighborhood: form.neighborhood,
      hero_image_url: form.hero_image_url || null,
      contact_anonymous: form.contact_anonymous,
      contact_name: form.contact_anonymous ? null : form.contact_name,
      contact_phone: form.contact_phone,
    };

    const { error } = await supabase
      .from("listings")
      .update(payload)
      .eq("id", form.id);

    if (error) {
      setStatus(error.message);
      setLoading(false);
    } else {
      setStatus("Changes saved.");
      setLoading(false);
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
      <div className="min-h-screen bg-[#f7f5f0] text-[#17241f]">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 text-sm text-[#637069]">
          {status}
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#17241f]">
      <LoadingOverlay show={loading} label="Saving changes..." />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-6 py-10 lg:py-14">
        <div className="relative overflow-hidden rounded-[32px] bg-[#17291f] px-7 py-9 text-[#fffdf8] shadow-[0_20px_50px_rgba(29,43,35,0.15)] sm:px-10">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#b89b5e]/20 blur-3xl" />
          <div className="relative text-[10px] uppercase tracking-[0.28em] text-[#d7bd83]">
            Edit listing
          </div>
          <h1 className="relative mt-3 font-[var(--font-display)] text-4xl sm:text-5xl">
            Update your ad
          </h1>
          <p className="relative mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Keep your listing current with its latest price, details, location, and contact preferences.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="premium-surface grid gap-6 rounded-[30px] border border-[#ded8ca] bg-[#fffdf8] p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#ded8ca] pb-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#9a7b3d]">Listing details</div>
              <p className="mt-2 text-sm text-[#637069]">Your updates are saved directly to this property listing.</p>
            </div>
            <span className="rounded-full border border-[#d9d2c1] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#756039]">Editing</span>
          </div>
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
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="grid gap-2">
              <label className={labelClass} htmlFor="price">
                Price
              </label>
              <input
                className={inputClass}
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price: event.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <label className={labelClass} htmlFor="price_unit">Unit</label>
              <select
                className={inputClass}
                id="price_unit"
                value={form.price_unit}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price_unit: event.target.value }))
                }
              >
                <option value="Crore">Crore</option>
                <option value="Lakh">Lakh</option>
                <option value="Thousand">Thousand</option>
              </select>
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
                Area
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
              <label className={labelClass} htmlFor="area_unit">
                Area unit
              </label>
              <select
                className={inputClass}
                id="area_unit"
                value={form.area_unit}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    area_unit: event.target.value,
                  }))
                }
              >
                <option value="sq ft">sq ft</option>
                <option value="sq yards">sq yards</option>
                <option value="marla">marla</option>
                <option value="acre">acre</option>
              </select>
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
          <div className="grid gap-4 rounded-[22px] border border-[#ded8ca] bg-[#f7f5f0] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className={labelClass}>Ad poster</div>
                <div className="text-sm leading-6 text-red-500/70">
                  Toggle anonymous or show your name. Phone is always required.
                </div>
              </div>
              <button
                className={`relative h-8 w-14 rounded-full border transition ${
                  form.contact_anonymous
                    ? "border-red-200 bg-red-100"
                    : "border-red-500 bg-red-500/10"
                }`}
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    contact_anonymous: !prev.contact_anonymous,
                  }))
                }
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    form.contact_anonymous ? "left-1" : "left-7"
                  }`}
                />
              </button>
            </div>
              <div className="grid gap-4 sm:grid-cols-2">
              {!form.contact_anonymous ? (
                <div className="grid gap-2">
                  <label className={labelClass} htmlFor="contact_name">
                    Contact name
                  </label>
                  <input
                    className={inputClass}
                    id="contact_name"
                    value={form.contact_name}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        contact_name: event.target.value,
                      }))
                    }
                  />
                </div>
              ) : (
                <div className="text-sm leading-6 text-red-500/70">
                  This ad will show as anonymous.
                </div>
              )}
              <div className="grid gap-2">
                <label className={labelClass} htmlFor="contact_phone">
                  Phone number
                </label>
                <input
                  className={inputClass}
                  id="contact_phone"
                  value={form.contact_phone}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      contact_phone: event.target.value,
                    }))
                  }
                  required
                  />
                </div>
              </div>
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
            className="h-12 rounded-2xl bg-[#1d3328] text-sm font-semibold text-white transition hover:bg-[#30483b]"
            type="submit"
          >
            Save changes
          </button>
          <button
            className="h-12 rounded-2xl border border-red-400/60 text-sm font-semibold text-red-700 transition hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.35)]"
            type="button"
            onClick={handleDelete}
          >
            Delete listing
          </button>
          <div className="text-xs text-red-600/80">{status}</div>
        </form>
      </div>
    </div>
  );
}
