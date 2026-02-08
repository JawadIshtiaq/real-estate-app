"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

export default function SiteHeader() {
  const supabase = getSupabase();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadUser() {
      if (!supabase) return;
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

  async function switchRole(nextRole) {
    if (!supabase || !user) return;
    setStatus("Updating...");
    const { error } = await supabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", user.id);
    if (error) {
      setStatus(error.message);
    } else {
      setRole(nextRole);
      setStatus("");
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <a
            className="font-[var(--font-display)] text-2xl tracking-tight"
            href="/"
          >
          Hamdard Estate
          </a>
          {pathname && pathname !== "/" ? (
            <button
              className="rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white"
              onClick={() => window.history.back()}
            >
              Back
            </button>
          ) : null}
        </div>
        <div className="hidden items-center gap-6 text-xs uppercase tracking-[0.2em] text-slate-200/70 md:flex">
          <a className="hover:text-white" href="/marketplace">
            Listings
          </a>
          <a className="hover:text-white" href="/listings">
            My ads
          </a>
          <a className="hover:text-white" href="/account">
            Account
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em]">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  className={`rounded-full border px-3 py-1 ${
                    role === "buyer"
                      ? "border-emerald-300 bg-emerald-300/20 text-emerald-100"
                      : "border-white/20 text-slate-200/70"
                  }`}
                  onClick={() => switchRole("buyer")}
                >
                  Buyer
                </button>
                <button
                  className={`rounded-full border px-3 py-1 ${
                    role === "seller"
                      ? "border-emerald-300 bg-emerald-300/20 text-emerald-100"
                      : "border-white/20 text-slate-200/70"
                  }`}
                  onClick={() => switchRole("seller")}
                >
                  Seller
                </button>
              </div>
              <a
                className="rounded-full border border-white/20 px-3 py-1 text-white"
                href="/account"
              >
                Account
              </a>
              <button
                className="rounded-full border border-white/20 px-3 py-1 text-white"
                onClick={signOut}
              >
                Sign out
              </button>
              {status ? (
                <span className="text-[10px] text-slate-400">{status}</span>
              ) : null}
            </>
          ) : (
            <>
              <a
                className="rounded-full border border-white/20 px-3 py-1 text-white"
                href="/sign-in"
              >
                Sign in
              </a>
              <a
                className="rounded-full bg-white px-3 py-1 text-slate-900"
                href="/sign-up"
              >
                Sign up
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
