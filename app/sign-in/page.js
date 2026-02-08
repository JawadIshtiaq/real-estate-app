"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import LoadingOverlay from "@/components/loading-overlay";

export default function SignInPage() {
  const supabase = getSupabase();
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
    setStatus("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setStatus(error.message);
      setLoading(false);
    } else {
      setStatus("Signed in. You can now visit /account or /listings/new.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-red-950">
      <LoadingOverlay show={loading} label="Authenticating..." />
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
            Sign in
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-red-200/70 bg-red-50 p-6"
        >
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
            Sign in
          </button>
          <div className="text-xs text-red-600/80">{status}</div>
        </form>
      </div>
    </div>
  );
}
