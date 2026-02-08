"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const supabase = getSupabase();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase) {
      setStatus(
        "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }
    setStatus("Creating account...");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Account created. Check your email to confirm.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-16">
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
            Create an account
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <input
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white placeholder:text-slate-400"
            placeholder="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
          <div className="text-xs text-slate-200/70">
            You can switch between buyer and seller after signing in.
          </div>
          <input
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white placeholder:text-slate-400"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white placeholder:text-slate-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            className="h-12 w-full rounded-2xl bg-emerald-400 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300"
            type="submit"
          >
            Create account
          </button>
          <div className="text-xs text-slate-200/70">{status}</div>
        </form>
      </div>
    </div>
  );
}
