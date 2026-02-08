"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import LoadingOverlay from "@/components/loading-overlay";

const inputClass =
  "h-12 w-full rounded-2xl border border-red-200 bg-white px-4 text-sm text-red-900 placeholder:text-red-300 transition focus:border-red-400 focus:ring-2 focus:ring-red-200";
const textareaClass =
  "min-h-[140px] w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-900 placeholder:text-red-300 transition focus:border-red-400 focus:ring-2 focus:ring-red-200";
const labelClass = "text-xs uppercase tracking-[0.2em] text-red-500/70";

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
          "id, title, description, price, beds, baths, sqft, status, city, neighborhood, hero_image_url, contact_anonymous, contact_name, contact_phone"
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
      price: Number(form.price),
      beds: Number(form.beds),
      baths: Number(form.baths),
      sqft: Number(form.sqft),
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
      <div className="min-h-screen bg-white text-red-950">
        <div className="mx-auto w-full max-w-2xl px-6 py-16 text-sm text-red-600/80">
          {status}
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen bg-white text-red-950">
      <LoadingOverlay show={loading} label="Saving changes..." />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
            Edit listing
          </div>
          <h1 className="mt-3 font-[var(--font-display)] text-3xl">
            Update your ad
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-3xl border border-red-200/70 bg-red-50 p-6"
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
                Price (PKR)
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
          <div className="grid gap-4 rounded-2xl border border-red-200/70 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className={labelClass}>Ad poster</div>
                <div className="text-xs text-red-500/70">
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
                <div className="text-xs text-red-500/70">
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
            className="h-12 rounded-2xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.35)]"
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
