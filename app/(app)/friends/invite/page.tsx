"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/store/user";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sendFriendRequestByUsername } from "@/lib/supabase/friends";

export default function InviteFriendPage() {
  const router = useRouter();
  const sendLocal = useUser((s) => s.sendFriendRequest);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = username.trim().replace(/^@/, "");
    if (!trimmed) {
      setError("Enter a username.");
      return;
    }

    if (!isSupabaseConfigured) {
      // Local-only demo fallback.
      sendLocal(trimmed);
      router.push("/friends");
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await sendFriendRequestByUsername(trimmed);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/friends");
  }

  return (
    <div>
      <Link href="/friends" className="text-sm font-medium text-ink-muted hover:text-ink">
        Back to friends
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-1">Add a friend</h1>
      <p className="text-ink-muted text-sm mb-6">Send a friend request by their username.</p>

      <form onSubmit={handleSubmit} className="card">
        <label htmlFor="username" className="block text-sm font-semibold mb-2">
          Username
        </label>
        <input
          id="username"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setError(null);
          }}
          className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary"
          placeholder="maya_chem"
          autoCapitalize="none"
          autoCorrect="off"
        />
        {error && <p className="text-sm text-primary mt-2">{error}</p>}
        <button type="submit" className="btn-primary w-full mt-5 disabled:opacity-60" disabled={submitting}>
          {submitting ? "Sending…" : "Send request"}
        </button>
      </form>
    </div>
  );
}
