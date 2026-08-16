"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import LoadingOverlay from "@/components/loading-overlay";

export default function SignUpPage() {
  const supabase = getSupabase();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase) {
      setStatus(
        "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }
    setLoading(true);
    setStatus("Creating account...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) {
      setStatus(error.message);
      setLoading(false);
    } else {
      if (data?.session) {
        setStatus("Account created. Redirecting...");
        router.replace("/marketplace");
      } else {
        setStatus("Account created. Check your email to confirm. Check spam as well.");
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#17241f]">
      <LoadingOverlay show={loading} label="Creating account..." />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-6 py-10 lg:py-16">
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
            Create an account
          </h1>
          <p className="relative mt-3 text-sm text-white/70">Begin your tailored property journey with Hamdard Estate.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="premium-surface mx-auto w-full max-w-lg space-y-4 rounded-[30px] border border-[#ded8ca] bg-[#fffdf8] p-7 sm:p-8"
        >
          <input
            className="h-12 w-full rounded-2xl border border-red-200 bg-white px-4 text-sm text-red-900 placeholder:text-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
            placeholder="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
          <div className="text-xs text-red-600/80">
            You can switch between buyer and seller after signing in.
          </div>
          <input
            className="h-12 w-full rounded-2xl border border-red-200 bg-white px-4 text-sm text-red-900 placeholder:text-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="h-12 w-full rounded-2xl border border-red-200 bg-white px-4 text-sm text-red-900 placeholder:text-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            className="h-12 w-full rounded-2xl bg-[#1d3328] text-sm font-semibold text-white transition hover:bg-[#30483b]"
            type="submit"
          >
            Create account
          </button>
          <div className="text-xs text-red-600/80">
            {status ===
            "Account created. Check your email to confirm. Check spam as well." ? (
              <>
                Account created. Check your email to confirm.{" "}
                <strong>Check spam as well.</strong>
              </>
            ) : (
              status
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
