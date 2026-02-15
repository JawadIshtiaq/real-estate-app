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
  const [switchingRole, setSwitchingRole] = useState(false);

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
    if (nextRole === role) return;
    setSwitchingRole(true);
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
      if (pathname && pathname.startsWith("/listings")) {
        window.location.reload();
      }
    }
    setSwitchingRole(false);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-red-200/70 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <a
            className="flex items-center gap-2 font-[var(--font-display)] text-2xl tracking-tight"
            href="/"
          >
            <img
              src="/house-svgrepo-com.svg"
              alt="Hamdard Estate"
              className="h-8 w-8 rounded-md object-contain"
            />
            <span>Hamdard Estate</span>
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
        <div className="hidden items-center gap-6 text-xs uppercase tracking-[0.2em] text-red-700/70 md:flex">
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
                        ? "border-red-500 bg-red-500/10 text-red-800"
                        : "border-red-200 text-red-700/70"
                    }`}
                    onClick={() => switchRole("buyer")}
                    disabled={switchingRole}
                  >
                    Buyer
                  </button>
                  <button
                    className={`rounded-full border px-3 py-1 ${
                      role === "seller"
                        ? "border-red-500 bg-red-500/10 text-red-800"
                        : "border-red-200 text-red-700/70"
                    }`}
                    onClick={() => switchRole("seller")}
                    disabled={switchingRole}
                  >
                    Seller
                  </button>
                </div>
                <a
                  className="rounded-full border border-red-300 px-3 py-1 text-red-800"
                  href="/account"
                >
                  Account
                </a>
                <button
                  className="rounded-full border border-red-300 px-3 py-1 text-red-800"
                  onClick={signOut}
                  disabled={switchingRole}
                >
                  Sign out
                </button>
                {status ? (
                  <span className="text-[10px] text-red-500">{status}</span>
                ) : null}
                {switchingRole ? (
                  <span className="text-[10px] text-red-500">Updating...</span>
                ) : null}
              </>
            ) : (
              <>
                <a
                  className="rounded-full border border-red-300 px-3 py-1 text-red-800"
                  href="/sign-in"
                >
                  Sign in
                </a>
                <a
                  className="rounded-full bg-red-600 px-3 py-1 text-white"
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
