"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import LoadingOverlay from "@/components/loading-overlay";

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
  contact_anonymous: true,
  contact_name: "",
  contact_phone: "",
};

const inputClass =
  "h-12 w-full rounded-2xl border border-red-200 bg-white px-4 text-sm text-red-900 placeholder:text-red-300 transition focus:border-red-400 focus:ring-2 focus:ring-red-200";
const textareaClass =
  "min-h-[140px] w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-900 placeholder:text-red-300 transition focus:border-red-400 focus:ring-2 focus:ring-red-200";
const labelClass = "text-xs uppercase tracking-[0.2em] text-red-500/70";

export default function NewListingPage() {
  const supabase = getSupabase();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [form, setForm] = useState(defaultListing);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setStatus("Creating listing...");
    if (!form.contact_phone) {
      setStatus("Phone number is required.");
      setLoading(false);
      return;
    }
    let uploadedUrls = [];
    const limitedFiles = files.slice(0, 6);
    if (limitedFiles.length) {
      setStatus("Uploading images...");
      const uploads = await Promise.all(
        limitedFiles.map(async (file) => {
          const suffix =
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
          const filePath = `${user.id}/${suffix}-${file.name}`;
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
        setLoading(false);
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
      contact_anonymous: form.contact_anonymous,
      contact_name: form.contact_anonymous ? null : form.contact_name,
      contact_phone: form.contact_phone,
    };
    const { data: listingData, error } = await supabase
      .from("listings")
      .insert(payload)
      .select("id")
      .single();
    if (error) {
      setStatus(error.message);
      setLoading(false);
    } else {
      if (listingData?.id && uploadedUrls.length) {
        const { error: imageError } = await supabase
          .from("listing_images")
          .insert(
            uploadedUrls.map((url, index) => ({
              listing_id: listingData.id,
              image_url: url,
              sort_order: index,
            }))
          );
        if (imageError) {
          setStatus(`Listing created, but images failed: ${imageError.message}`);
          setLoading(false);
          return;
        }
      }
      setStatus("Listing created. Redirecting...");
      setForm(defaultListing);
      setFiles([]);
      window.location.href = "/listings";
    }
  }

  return (
    <div className="min-h-screen bg-white text-red-950">
      <LoadingOverlay show={loading} label="Processing listing..." />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
        <div>
          <a
            className="text-xs uppercase tracking-[0.3em] text-red-500/70"
            href="/"
          >
            Back to home
          </a>
          <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
            Sellers
          </div>
          <h1 className="mt-3 font-[var(--font-display)] text-3xl">
            Create a new listing
          </h1>
        </div>

        {!user ? (
          <div className="rounded-3xl border border-red-200/70 bg-red-50 p-6 text-sm text-red-700">
            Sign in at `/sign-in` before creating listings.
          </div>
        ) : role !== "seller" && role !== "admin" ? (
          <div className="rounded-3xl border border-red-200/70 bg-red-50 p-6 text-sm text-red-700">
            Your account is set as a buyer. Create a new account as a seller if
            you want to post ads.
          </div>
        ) : (
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
                  Price (PKR)
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
                className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-900 file:mr-4 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.2em] file:text-white hover:file:bg-red-500"
                id="image_uploads"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  setFiles(Array.from(event.target.files || []))
                }
              />
              <div className="text-xs text-red-500/70">
                Upload up to 6 images. The first image becomes the hero image.
              </div>
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
                      placeholder="Hamdard Estate"
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
                    placeholder="+92 300 1234567"
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
              Create listing
            </button>
            <div className="text-xs text-red-600/80">{status}</div>
          </form>
        )}
      </div>
    </div>
  );
}
