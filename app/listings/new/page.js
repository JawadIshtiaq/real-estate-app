"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import LoadingOverlay from "@/components/loading-overlay";

const DIRECT_UPLOAD_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const HEIC_IMAGE_TYPES = ["image/heic", "image/heif"];
const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"];
const PRICE_UNITS = { Thousand: 1000, Lakh: 100000, Crore: 10000000 };

const defaultListing = {
  title: "",
  description: "",
  price: "",
  price_unit: "Crore",
  beds: 0,
  baths: 0,
  sqft: 0,
  area_unit: "sq ft",
  status: "active",
  city: "",
  neighborhood: "",
  hero_image_url: "",
  contact_anonymous: true,
  contact_name: "",
  contact_phone: "",
};

const inputClass =
  "h-12 w-full rounded-2xl border border-red-200 bg-white px-4 text-base text-red-900 placeholder:text-red-300 transition focus:border-red-400 focus:ring-2 focus:ring-red-200";
const textareaClass =
  "min-h-[150px] w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-base leading-7 text-red-900 placeholder:text-red-300 transition focus:border-red-400 focus:ring-2 focus:ring-red-200";
const labelClass = "text-sm font-semibold text-red-800";

export default function NewListingPage() {
  const supabase = getSupabase();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [form, setForm] = useState(defaultListing);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactDefaults, setContactDefaults] = useState({
    name: "",
    phone: "",
  });

  function hasSupportedExtension(fileName) {
    const lower = String(fileName || "").toLowerCase();
    return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  }

  function isHeicFile(file) {
    return (
      HEIC_IMAGE_TYPES.includes(file.type) ||
      /\.(heic|heif)$/i.test(String(file?.name || ""))
    );
  }

  function isSupportedSourceFile(file) {
    return (
      DIRECT_UPLOAD_IMAGE_TYPES.includes(file.type) ||
      isHeicFile(file) ||
      hasSupportedExtension(file?.name)
    );
  }

  function buildUploadName(file, suffix) {
    const original = file?.name ? String(file.name) : "";
    const safe = original
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const hasExt = /\.[a-z0-9]+$/.test(safe);
    const ext = hasExt ? "" : ".jpg";
    return `${suffix}-${safe || "listing-image"}${ext}`;
  }

  async function convertHeicToJpeg(file) {
    const { default: heic2any } = await import("heic2any");
    const result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    const convertedBlob = Array.isArray(result) ? result[0] : result;
    const baseName = String(file?.name || "listing-image").replace(
      /\.(heic|heif)$/i,
      ""
    );
    return new File([convertedBlob], `${baseName}.jpg`, {
      type: "image/jpeg",
    });
  }

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter((file) =>
      isSupportedSourceFile(file)
    );
    const rejectedCount = selectedFiles.length - validFiles.length;

    setFiles(validFiles.slice(0, 6));

    if (rejectedCount > 0) {
      setStatus(
        "Some images were skipped. Use JPG, PNG, WEBP, GIF, or HEIC/HEIF."
      );
    } else if (validFiles.length > 6) {
      setStatus("Only the first 6 images will be uploaded.");
    } else if (selectedFiles.length) {
      setStatus(`${Math.min(validFiles.length, 6)} image(s) selected.`);
    } else {
      setStatus("");
    }
  }

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
          .select("role, full_name")
          .eq("id", authUser.id)
          .maybeSingle();
        setRole(profileData?.role ?? "buyer");

        const { data: latestListing } = await supabase
          .from("listings")
          .select("contact_name, contact_phone")
          .eq("created_by", authUser.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const defaultName =
          profileData?.full_name ||
          authUser?.user_metadata?.full_name ||
          latestListing?.contact_name ||
          "";
        const defaultPhone =
          authUser?.phone ||
          authUser?.user_metadata?.phone ||
          authUser?.user_metadata?.contact_phone ||
          latestListing?.contact_phone ||
          "";

        setContactDefaults({
          name: defaultName,
          phone: defaultPhone,
        });
        setForm((prev) => ({
          ...prev,
          contact_name: prev.contact_name || defaultName,
          contact_phone: prev.contact_phone || defaultPhone,
        }));
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
      setStatus("Preparing images...");
      const preparedFiles = [];

      for (const file of limitedFiles) {
        if (isHeicFile(file)) {
          try {
            const converted = await convertHeicToJpeg(file);
            preparedFiles.push(converted);
          } catch (error) {
            setStatus("Failed to convert one HEIC image. Please try JPG/PNG for that file.");
            setLoading(false);
            return;
          }
        } else {
          preparedFiles.push(file);
        }
      }

      setStatus("Uploading images...");
      const uploads = await Promise.all(
        preparedFiles.map(async (file) => {
          const suffix =
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
          const fileName = buildUploadName(file, suffix);
          const filePath = `${user.id}/${fileName}`;
          const { error } = await supabase.storage
            .from("listing-images")
            .upload(filePath, file, {
              upsert: false,
              contentType: file.type || "image/jpeg",
            });
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

    const { price_unit, ...listingForm } = form;
    const payload = {
      ...listingForm,
      created_by: user?.id ?? null,
      hero_image_url: uploadedUrls[0] || form.hero_image_url || null,
      price: Number(form.price) * PRICE_UNITS[price_unit],
      beds: Number(form.beds),
      baths: Number(form.baths),
      sqft: Number(form.sqft),
      area_unit: form.area_unit,
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
    <div className="min-h-screen bg-[#f7f5f0] text-[#17241f]">
      <LoadingOverlay show={loading} label="Processing listing..." />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-6 py-10 lg:py-14">
        <div className="relative overflow-hidden rounded-[32px] bg-[#17291f] px-7 py-9 text-[#fffdf8] shadow-[0_20px_50px_rgba(29,43,35,0.15)] sm:px-10">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#b89b5e]/20 blur-3xl" />
          <a
            className="relative text-[10px] uppercase tracking-[0.28em] text-[#d7bd83] hover:text-white"
            href="/"
          >
            Back to home
          </a>
          <div className="relative mt-5 text-[10px] uppercase tracking-[0.28em] text-[#d7bd83]">
            Sellers
          </div>
          <h1 className="relative mt-3 font-[var(--font-display)] text-4xl sm:text-5xl">
            Create a new listing
          </h1>
          <p className="relative mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Present your property with the details buyers need to make a confident first impression.
          </p>
        </div>

        {!user ? (
          <div className="rounded-[28px] border border-[#ded8ca] bg-[#fffdf8] p-7 text-sm text-[#536058] shadow-[0_12px_35px_rgba(29,43,35,0.05)]">
            Sign in at `/sign-in` before creating listings.
          </div>
        ) : role !== "seller" && role !== "admin" ? (
          <div className="rounded-[28px] border border-[#ded8ca] bg-[#fffdf8] p-7 text-sm text-[#536058] shadow-[0_12px_35px_rgba(29,43,35,0.05)]">
            Your account is set as a buyer. Create a new account as a seller if
            you want to post ads.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="premium-surface grid gap-6 rounded-[30px] border border-[#ded8ca] bg-[#fffdf8] p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#ded8ca] pb-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#9a7b3d]">Property profile</div>
                <p className="mt-2 text-sm text-[#637069]">Add the essentials, location, imagery, and your preferred contact details.</p>
              </div>
              <span className="rounded-full border border-[#d9d2c1] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#756039]">New listing</span>
            </div>
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
                  placeholder="2.5"
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
                  Area
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
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
                multiple
                onChange={handleFileChange}
              />
                <div className="text-sm leading-6 text-red-500/70">
                Upload up to 6 images (JPG, PNG, WEBP, GIF, HEIC/HEIF). HEIC/HEIF files are converted to JPG automatically.
              </div>
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
                      placeholder={contactDefaults.name || "Hamdard Estate"}
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
                    placeholder={contactDefaults.phone || "+92 300 1234567"}
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
              Create listing
            </button>
            <div className="text-sm text-red-600/80">{status}</div>
          </form>
        )}
      </div>
    </div>
  );
}
