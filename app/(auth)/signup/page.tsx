"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/lib/store/user";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Usernames are how friends find each other, so keep them clean + URL-safe.
function normalizeUsername(raw: string) {
  return raw.trim().replace(/^@/, "").toLowerCase().replace(/[^a-z0-9_]+/g, "_");
}

export default function SignupPage() {
  const router = useRouter();
  const signIn = useUser((s) => s.signIn);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const handle = normalizeUsername(username);
    if (handle.length < 3) {
      setError("Username must be at least 3 characters (letters, numbers, _).");
      return;
    }

    if (!isSupabaseConfigured) {
      // Local-only fallback (no Supabase project configured).
      signIn(handle, email);
      router.push("/welcome");
      return;
    }

    setLoading(true);
    const supabase = createClient()!;

    // Pre-check so friends can reliably find this exact username (the DB trigger
    // would otherwise silently append a number on a clash).
    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", handle)
      .maybeSingle();
    if (taken) {
      setLoading(false);
      setError("That username is taken — try another.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: handle },
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

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-sm text-ink-muted mb-6">Start your AP Chem journey.</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            placeholder="Username (friends find you by this)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            className="rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
        <p className="text-xs text-ink-muted mt-4 text-center">
          Already have an account? <Link className="text-primary font-medium" href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
