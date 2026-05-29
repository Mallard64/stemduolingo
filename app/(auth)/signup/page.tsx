"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/lib/store/user";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SignupPage() {
  const router = useRouter();
  const signIn = useUser((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!isSupabaseConfigured) {
      // Local-only fallback (no Supabase project configured).
      signIn(email.split("@")[0] || "you", email);
      router.push("/welcome");
      return;
    }

    setLoading(true);
    const supabase = createClient()!;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: email.split("@")[0] },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/welcome`,
      },
    });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    if (data.session) {
      // Email confirmation is off — we're signed in immediately. Clear any
      // previous cache and load this account before navigating.
      const u = useUser.getState();
      u.resetLocal();
      await u.hydrate(true);
      setLoading(false);
      router.push("/welcome");
    } else {
      setLoading(false);
      setNotice("Check your email to confirm your account, then sign in.");
    }
  }

  async function google() {
    setError(null);
    if (!isSupabaseConfigured) {
      signIn("you", "user@gmail.com");
      router.push("/welcome");
      return;
    }
    useUser.getState().resetLocal();
    const supabase = createClient()!;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/welcome` },
    });
    if (error) setError(error.message);
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-sm text-ink-muted mb-6">Start your AP Chem journey.</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            required
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          {notice && <p className="text-sm text-success">{notice}</p>}
          <button className="btn-primary disabled:opacity-60" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <div className="my-4 text-center text-xs text-ink-subtle">or</div>
        <button onClick={google} className="btn-secondary w-full">Continue with Google</button>
        <p className="text-xs text-ink-muted mt-4 text-center">
          Already have an account? <Link className="text-primary font-medium" href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
