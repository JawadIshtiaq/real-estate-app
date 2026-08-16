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
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <nav className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[#d9d2c1]/90 bg-[#fffdf8]/95 px-4 py-3 shadow-[0_12px_35px_rgba(29,43,35,0.10)] backdrop-blur-xl sm:px-5">
        <div className="flex items-center gap-3">
          <a
            className="flex items-center gap-3 font-[var(--font-display)] text-xl font-medium tracking-[-0.03em] text-[#18271f] sm:text-2xl"
            href="/"
            aria-label="Property marketplace home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d3328] font-sans text-sm font-semibold tracking-[0.08em] text-[#d7bd83] shadow-[0_4px_12px_rgba(29,43,35,0.18)]">
              HE
            </span>
            <span className="hidden sm:block">Hamdard Estate</span>
          </a>
          {pathname && pathname !== "/" ? (
            <button
              className="rounded-full border border-[#b89b5e]/50 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#6a5730]"
              onClick={() => window.history.back()}
            >
              Back
            </button>
          ) : null}
        </div>
        <div className="hidden items-center gap-1 rounded-full border border-[#e2ddd1] bg-[#f7f5f0] p-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#536058] lg:flex">
          <a className="rounded-full px-3 py-2 hover:bg-white hover:text-[#9a7b3d]" href="/marketplace">
            Listings
          </a>
          <a className="rounded-full px-3 py-2 hover:bg-white hover:text-[#9a7b3d]" href="/testimonials">
            Testimonials
          </a>
          <a className="rounded-full px-3 py-2 hover:bg-white hover:text-[#9a7b3d]" href="/listings">
            My ads
          </a>
          <a className="rounded-full px-3 py-2 hover:bg-white hover:text-[#9a7b3d]" href="/account">
            Account
          </a>
        </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em]">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    className={`rounded-full border px-3 py-2 ${
                      role === "buyer"
                        ? "border-[#a88442] bg-[#b89b5e]/15 text-[#47391e]"
                        : "border-[#d9d2c1] text-[#536058]"
                    }`}
                    onClick={() => switchRole("buyer")}
                    disabled={switchingRole}
                  >
                    Buyer
                  </button>
                  <button
                    className={`rounded-full border px-3 py-2 ${
                      role === "seller"
                        ? "border-[#a88442] bg-[#b89b5e]/15 text-[#47391e]"
                        : "border-[#d9d2c1] text-[#536058]"
                    }`}
                    onClick={() => switchRole("seller")}
                    disabled={switchingRole}
                  >
                    Seller
                  </button>
                </div>
                <a
                  className="rounded-full border border-[#d9d2c1] px-3 py-2 text-[#314137] hover:border-[#b89b5e]"
                  href="/account"
                >
                  Account
                </a>
                <button
                  className="rounded-full border border-[#d9d2c1] px-3 py-2 text-[#314137] hover:border-[#b89b5e]"
                  onClick={signOut}
                  disabled={switchingRole}
                >
                  Sign out
                </button>
                {status ? (
                  <span className="text-[10px] text-[#9a7b3d]">{status}</span>
                ) : null}
                {switchingRole ? (
                  <span className="text-[10px] text-[#9a7b3d]">Updating...</span>
                ) : null}
              </>
            ) : (
              <>
                <a
                  className="rounded-full border border-[#d9d2c1] px-3 py-2 text-[#314137] hover:border-[#b89b5e]"
                  href="/sign-in"
                >
                  Sign in
                </a>
                <a
                  className="rounded-full bg-[#1d3328] px-4 py-2 text-white shadow-[0_5px_14px_rgba(29,43,35,0.18)] hover:bg-[#30483b]"
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
