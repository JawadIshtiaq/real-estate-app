"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

export default function AccountPage() {
  const supabase = getSupabase();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [profile, setProfile] = useState(null);

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
        setUser(data?.user ?? null);
        if (data?.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", data.user.id)
            .maybeSingle();
          setProfile(profileData ?? null);
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
            Account
          </div>
          <h1 className="mt-3 font-[var(--font-display)] text-3xl">
            Your profile
          </h1>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80">
          {status ? <div>{status}</div> : null}
          {user ? (
            <div className="space-y-2">
              <div>Signed in as {user.email}</div>
              <div>
                Role: {profile?.role ? profile.role : "buyer"}{" "}
                <span className="text-xs text-slate-400">
                  (set at sign-up)
                </span>
              </div>
              <button
                className="mt-4 rounded-2xl bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
                onClick={signOut}
              >
                Sign out
              </button>
              <div className="pt-4 text-xs text-slate-300/70">
                Visit `/listings` to manage your ads.
              </div>
            </div>
          ) : (
            <div>
              Not signed in. Visit `/sign-in` or `/sign-up` to continue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
