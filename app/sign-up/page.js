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
        setStatus("Account created. Check your email to confirm.");
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-white text-red-950">
      <LoadingOverlay show={loading} label="Creating account..." />
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-16">
        <div>
          <a
            className="text-xs uppercase tracking-[0.3em] text-red-500/70"
            href="/"
          >
            Back to home
          </a>
          <div className="text-xs uppercase tracking-[0.3em] text-red-500/70">
            Account
          </div>
          <h1 className="mt-3 font-[var(--font-display)] text-3xl">
            Create an account
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-red-200/70 bg-red-50 p-6"
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
            className="h-12 w-full rounded-2xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-500"
            type="submit"
          >
            Create account
          </button>
          <div className="text-xs text-red-600/80">{status}</div>
        </form>
      </div>
    </div>
  );
}
