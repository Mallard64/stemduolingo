"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/lib/store/user";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const signIn = useUser((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      // Local-only fallback (no Supabase project configured).
      signIn(email.split("@")[0] || "you", email);
      router.push("/learn");
      return;
    }

    setLoading(true);
    const supabase = createClient()!;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // Clear any previous account's cache, then load this account's cloud data
    // BEFORE navigating so the app layout doesn't bounce on a null profile.
    const u = useUser.getState();
    u.resetLocal();
    await u.hydrate(true);
    setLoading(false);
    router.push("/learn");
  }

  async function google() {
    setError(null);
    if (!isSupabaseConfigured) {
      signIn("you", "user@gmail.com");
      router.push("/learn");
      return;
    }
    // Clear any previous account's cache before the OAuth round-trip.
    useUser.getState().resetLocal();
    const supabase = createClient()!;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/learn` },
    });
    if (error) setError(error.message);
    // On success the browser is redirected to Google.
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-ink-muted mb-6">Sign in to continue your streak.</p>
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <button className="btn-primary disabled:opacity-60" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="my-4 text-center text-xs text-ink-subtle">or</div>
        <button onClick={google} className="btn-secondary w-full">Continue with Google</button>
        <p className="text-xs text-ink-muted mt-4 text-center">
          New here? <Link className="text-primary font-medium" href="/signup">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
