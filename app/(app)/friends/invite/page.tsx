"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/store/user";

export default function InviteFriendPage() {
  const router = useRouter();
  const sendFriendRequest = useUser((s) => s.sendFriendRequest);
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = recipient.trim();
    if (!trimmed) {
      setError("Enter a username or email.");
      return;
    }
    sendFriendRequest(trimmed);
    router.push("/friends");
  }

  return (
    <div>
      <Link href="/friends" className="text-sm font-medium text-ink-muted hover:text-ink">
        Back to friends
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-1">Invite a friend</h1>
      <p className="text-ink-muted text-sm mb-6">Send a friend request by username or email.</p>

      <form onSubmit={handleSubmit} className="card">
        <label htmlFor="recipient" className="block text-sm font-semibold mb-2">
          Username or email
        </label>
        <input
          id="recipient"
          value={recipient}
          onChange={(event) => {
            setRecipient(event.target.value);
            setError(null);
          }}
          className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary"
          placeholder="maya@example.com"
        />
        {error && <p className="text-sm text-primary mt-2">{error}</p>}
        <button type="submit" className="btn-primary w-full mt-5">
          Send request
        </button>
      </form>
    </div>
  );
}
