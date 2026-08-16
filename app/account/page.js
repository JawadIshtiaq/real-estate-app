"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function displayValue(value) {
  if (value == null) return "Not provided";
  const text = String(value).trim();
  return text ? text : "Not provided";
}

export default function AccountPage() {
  const supabase = getSupabase();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    agency: "",
  });
  const [listingStats, setListingStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    sold: 0,
  });
  const [lastListingContact, setLastListingContact] = useState(null);

  useEffect(() => {
    async function loadUser() {
      if (!supabase) {
        setStatus(
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        return;
      }
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setStatus(error.message);
      } else {
        const authUser = data?.user ?? null;
        setUser(authUser);

        if (authUser) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, role, created_at")
            .eq("id", authUser.id)
            .maybeSingle();
          setProfile(profileData ?? null);

          const { data: listingRows } = await supabase
            .from("listings")
            .select("status, contact_name, contact_phone, created_at")
            .eq("created_by", authUser.id)
            .order("created_at", { ascending: false });

          const rows = listingRows ?? [];
          setListingStats({
            total: rows.length,
            active: rows.filter((item) => item.status === "active").length,
            pending: rows.filter((item) => item.status === "pending").length,
            sold: rows.filter((item) => item.status === "sold").length,
          });
          const latestContact = rows.find((item) => item.contact_phone) ?? null;
          setLastListingContact(latestContact);
          setForm({
            fullName:
              profileData?.full_name || authUser?.user_metadata?.full_name || "",
            phone:
              authUser?.phone ||
              authUser?.user_metadata?.phone ||
              authUser?.user_metadata?.contact_phone ||
              latestContact?.contact_phone ||
              "",
            agency:
              authUser?.user_metadata?.agency ||
              authUser?.user_metadata?.real_estate_agency ||
              authUser?.user_metadata?.company ||
              "",
          });
        }
        setStatus("");
      }
    }

    loadUser();
  }, [supabase]);

  async function signOut() {
    if (!supabase) return;
    setStatus("Signing out...");
    await supabase.auth.signOut();
    setUser(null);
    setStatus("Signed out.");
  }

  async function saveProfile() {
    if (!supabase || !user || saving) return;

    const fullNameValue = form.fullName.trim();
    const phoneValue = form.phone.trim();
    const agencyValue = form.agency.trim();

    setSaving(true);
    setStatus("Saving profile...");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullNameValue || null })
      .eq("id", user.id);

    if (profileError) {
      setStatus(profileError.message);
      setSaving(false);
      return;
    }

    const metadata = { ...(user.user_metadata ?? {}) };
    if (fullNameValue) metadata.full_name = fullNameValue;
    else delete metadata.full_name;
    if (phoneValue) metadata.phone = phoneValue;
    else delete metadata.phone;
    if (agencyValue) metadata.agency = agencyValue;
    else delete metadata.agency;

    const { data: updatedAuth, error: authError } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (authError) {
      setStatus(authError.message);
      setSaving(false);
      return;
    }

    setProfile((prev) => ({ ...(prev ?? {}), full_name: fullNameValue || null }));
    setUser(updatedAuth?.user ?? { ...user, user_metadata: metadata });
    setStatus("Profile updated.");
    setIsEditing(false);
    setSaving(false);
  }

  function cancelEdit() {
    if (saving) return;
    setForm({
      fullName: rawFullName,
      phone: rawPhone,
      agency: rawAgency,
    });
    setIsEditing(false);
    setStatus("");
  }

  const rawFullName = profile?.full_name || user?.user_metadata?.full_name || "";
  const rawPhone =
    user?.phone ||
    user?.user_metadata?.phone ||
    user?.user_metadata?.contact_phone ||
    lastListingContact?.contact_phone ||
    "";
  const rawAgency =
    user?.user_metadata?.agency ||
    user?.user_metadata?.real_estate_agency ||
    user?.user_metadata?.company ||
    "";

  const fullName = displayValue(rawFullName);
  const email = displayValue(user?.email);
  const phone = displayValue(rawPhone);
  const agency = displayValue(rawAgency);
  const memberSince = formatDate(profile?.created_at || user?.created_at);
  const lastSignIn = formatDate(user?.last_sign_in_at);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#17241f]">
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
            Account
          </div>
          <h1 className="relative mt-3 font-[var(--font-display)] text-4xl sm:text-5xl">
            Your profile
          </h1>
          <p className="relative mt-3 text-sm text-white/70">Your details, account activity, and listing profile in one place.</p>
        </div>

        <div className="premium-surface rounded-[30px] border border-[#ded8ca] bg-[#fffdf8] p-6 text-sm text-[#536058] sm:p-8">
          {status ? <div>{status}</div> : null}
          {user ? (
            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-[#ded8ca] bg-[#f7f5f0] p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-red-500/70">
                    Full name
                  </div>
                  {isEditing ? (
                    <input
                      className="mt-2 h-10 w-full rounded-xl border border-red-200 bg-white px-3 text-sm text-red-900 placeholder:text-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      value={form.fullName}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, fullName: event.target.value }))
                      }
                      placeholder="Full name"
                    />
                  ) : (
                    <div className="mt-2 text-sm font-semibold text-red-900">
                      {fullName}
                    </div>
                  )}
                </div>
                  <div className="rounded-[20px] border border-[#ded8ca] bg-[#f7f5f0] p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-red-500/70">
                    Email
                  </div>
                  <div className="mt-2 text-sm font-semibold text-red-900">
                    {email}
                  </div>
                </div>
                  <div className="rounded-[20px] border border-[#ded8ca] bg-[#f7f5f0] p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-red-500/70">
                    Phone number
                  </div>
                  {isEditing ? (
                    <input
                      className="mt-2 h-10 w-full rounded-xl border border-red-200 bg-white px-3 text-sm text-red-900 placeholder:text-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      placeholder="Phone number"
                    />
                  ) : (
                    <div className="mt-2 text-sm font-semibold text-red-900">
                      {phone}
                    </div>
                  )}
                </div>
                  <div className="rounded-[20px] border border-[#ded8ca] bg-[#f7f5f0] p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-red-500/70">
                    Real estate agency
                  </div>
                  {isEditing ? (
                    <input
                      className="mt-2 h-10 w-full rounded-xl border border-red-200 bg-white px-3 text-sm text-red-900 placeholder:text-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      value={form.agency}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, agency: event.target.value }))
                      }
                      placeholder="Agency name"
                    />
                  ) : (
                    <div className="mt-2 text-sm font-semibold text-red-900">
                      {agency}
                    </div>
                  )}
                </div>
                  <div className="rounded-[20px] border border-[#ded8ca] bg-[#f7f5f0] p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-red-500/70">
                    Member since
                  </div>
                  <div className="mt-2 text-sm font-semibold text-red-900">
                    {memberSince}
                  </div>
                </div>
                  <div className="rounded-[20px] border border-[#ded8ca] bg-[#f7f5f0] p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-red-500/70">
                    Last sign in
                  </div>
                  <div className="mt-2 text-sm font-semibold text-red-900">
                    {lastSignIn}
                  </div>
                </div>
                  <div className="rounded-[20px] border border-[#ded8ca] bg-[#f7f5f0] p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-red-500/70">
                    Total listings
                  </div>
                  <div className="mt-2 text-sm font-semibold text-red-900">
                    {listingStats.total}
                  </div>
                </div>
                  <div className="rounded-[20px] border border-[#ded8ca] bg-[#f7f5f0] p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-red-500/70">
                    Active / Pending / Sold
                  </div>
                  <div className="mt-2 text-sm font-semibold text-red-900">
                    {listingStats.active} / {listingStats.pending} / {listingStats.sold}
                  </div>
                </div>
                  <div className="rounded-[20px] border border-[#ded8ca] bg-[#f7f5f0] p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-red-500/70">
                    Listing contact name
                  </div>
                  <div className="mt-2 text-sm font-semibold text-red-900">
                    {displayValue(lastListingContact?.contact_name || fullName)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {isEditing ? (
                  <>
                    <button
                      className="rounded-2xl bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={saveProfile}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save profile"}
                    </button>
                    <button
                      className="rounded-2xl border border-red-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="rounded-2xl border border-red-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-800"
                    onClick={() => {
                      setForm({
                        fullName: rawFullName,
                        phone: rawPhone,
                        agency: rawAgency,
                      });
                      setIsEditing(true);
                      setStatus("");
                    }}
                  >
                    Edit profile
                  </button>
                )}
                <button
                  className="rounded-2xl bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                  onClick={signOut}
                  disabled={saving}
                >
                  Sign out
                </button>
              </div>
              <div className="text-xs text-red-500/70">
                Visit <b>My Ads</b> to manage your ads.
              </div>
            </div>
          ) : (
            <div>
              Not signed in. <b>Sign-in</b> or <b>Sign-up</b> to continue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
