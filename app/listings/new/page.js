"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

const defaultListing = {
  title: "",
  description: "",
  price: "",
  beds: 0,
  baths: 0,
  sqft: 0,
  status: "active",
  city: "",
  neighborhood: "",
  hero_image_url: "",
};

const inputClass =
  "h-12 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white placeholder:text-slate-400 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/30";
const textareaClass =
  "min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-400 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/30";
const labelClass = "text-xs uppercase tracking-[0.2em] text-slate-300/70";

export default function NewListingPage() {
  const supabase = getSupabase();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [form, setForm] = useState(defaultListing);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadUser() {
      if (!supabase) {
        setStatus(
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        return;
      }
      const { data } = await supabase.auth.getUser();
      const authUser = data?.user ?? null;
      setUser(authUser);
      if (authUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.id)
          .maybeSingle();
        setRole(profileData?.role ?? "buyer");
      }
    }
    loadUser();
  }, [supabase]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase) {
      setStatus(
        "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }
    setStatus("Creating listing...");
    let uploadedUrls = [];
    const limitedFiles = files.slice(0, 6);
    if (limitedFiles.length) {
      setStatus("Uploading images...");
      const uploads = await Promise.all(
        limitedFiles.map(async (file) => {
          const filePath = `${user.id}/${Date.now()}-${file.name}`;
          const { error } = await supabase.storage
            .from("listing-images")
            .upload(filePath, file, { upsert: false });
          if (error) {
            return { error };
          }
          const { data } = supabase.storage
            .from("listing-images")
            .getPublicUrl(filePath);
          return { url: data?.publicUrl };
        })
      );

      const failed = uploads.find((item) => item.error);
      if (failed?.error) {
        setStatus(failed.error.message);
        return;
      }
      uploadedUrls = uploads
        .map((item) => item.url)
        .filter((url) => Boolean(url));
    }

    const payload = {
      ...form,
      created_by: user?.id ?? null,
      hero_image_url: uploadedUrls[0] || form.hero_image_url || null,
      price: Number(form.price),
      beds: Number(form.beds),
      baths: Number(form.baths),
      sqft: Number(form.sqft),
    };
    const { data: listingData, error } = await supabase
      .from("listings")
      .insert(payload)
      .select("id")
      .single();
    if (error) {
      setStatus(error.message);
    } else {
      if (listingData?.id && uploadedUrls.length) {
        await supabase.from("listing_images").insert(
          uploadedUrls.map((url, index) => ({
            listing_id: listingData.id,
            image_url: url,
            sort_order: index,
          }))
        );
      }
      setStatus("Listing created.");
      setForm(defaultListing);
      setFiles([]);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
        <div>
          <a
            className="text-xs uppercase tracking-[0.3em] text-slate-300/70"
            href="/"
          >
            Back to home
          </a>
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-200">
            Sellers
          </div>
          <h1 className="mt-3 font-[var(--font-display)] text-3xl">
            Create a new listing
          </h1>
        </div>

        {!user ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80">
            Sign in at `/sign-in` before creating listings.
          </div>
        ) : role !== "seller" && role !== "admin" ? (
          <div className="rounded-3xl border border-amber-200/30 bg-amber-400/10 p-6 text-sm text-amber-100">
            Your account is set as a buyer. Create a new account as a seller if
            you want to post ads.
          </div>
        ) : (
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
                placeholder="Modern loft with skyline terrace"
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
                placeholder="Describe the property, highlights, and unique features."
                value={form.description}
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
                  placeholder="1250000"
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
                  placeholder="3"
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
                  placeholder="2"
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
                  placeholder="2100"
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
                  placeholder="Seattle"
                  value={form.city}
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
                  placeholder="Marina Vista"
                  value={form.neighborhood}
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
                Hero image URL (optional)
              </label>
              <input
                className={inputClass}
                id="hero_image_url"
                placeholder="https://images.unsplash.com/..."
                value={form.hero_image_url}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    hero_image_url: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <label className={labelClass} htmlFor="image_uploads">
                Upload listing images
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200/80 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.2em] file:text-slate-900 hover:file:bg-emerald-300"
                id="image_uploads"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  setFiles(Array.from(event.target.files || []))
                }
              />
              <div className="text-xs text-slate-400">
                Upload up to 6 images. The first image becomes the hero image.
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
              className="h-12 rounded-2xl bg-emerald-400 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.35)]"
              type="submit"
            >
              Create listing
            </button>
            <div className="text-xs text-slate-200/70">{status}</div>
          </form>
        )}
      </div>
    </div>
  );
}
