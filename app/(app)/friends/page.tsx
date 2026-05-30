"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@/lib/store/user";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  loadFriends,
  respondToRequest,
  cancelRequest,
  type FriendsData,
} from "@/lib/supabase/friends";

// Stats for the demo (local-only) friends when Supabase isn't configured.
const FRIEND_STATS: Record<string, { streak: number; xp: number }> = {
  Maya: { streak: 12, xp: 2420 },
  Jordan: { streak: 8, xp: 1890 },
  Avery: { streak: 5, xp: 1540 },
  Sam: { streak: 3, xp: 980 },
};

export default function FriendsPage() {
  const profile = useUser((s) => s.profile);

  // ── Local-only (demo) fallback state from the zustand store ──
  const friendUsernames = useUser((s) => s.friendUsernames);
  const localIncoming = useUser((s) => s.incomingFriendRequests);
  const localOutgoing = useUser((s) => s.outgoingFriendRequests);
  const acceptLocal = useUser((s) => s.acceptFriendRequest);
  const declineLocal = useUser((s) => s.declineFriendRequest);

  // ── Cloud state ──
  const [cloud, setCloud] = useState<FriendsData | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const data = await loadFriends();
    setCloud(data ?? { friends: [], incoming: [], outgoing: [] });
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function accept(id: string) {
    await respondToRequest(id, true);
    await refresh();
  }
  async function decline(id: string) {
    await respondToRequest(id, false);
    await refresh();
  }
  async function cancel(id: string) {
    await cancelRequest(id);
    await refresh();
  }

  // ── Build the view model for whichever mode we're in ──
  const me = profile
    ? { username: profile.username, streak: profile.current_streak, xp: profile.total_xp, isYou: true }
    : null;

  const localFriends = useMemo(
    () => [
      ...(me ? [me] : []),
      ...friendUsernames.map((username) => ({
        username,
        streak: FRIEND_STATS[username]?.streak ?? 0,
        xp: FRIEND_STATS[username]?.xp ?? 0,
        isYou: false,
      })),
    ],
    [friendUsernames, me]
  );

  const friends = isSupabaseConfigured
    ? [
        ...(me ? [me] : []),
        ...(cloud?.friends ?? []).map((f) => ({
          username: f.username,
          streak: f.current_streak,
          xp: f.total_xp,
          isYou: false,
        })),
      ]
    : localFriends;

  const incoming = isSupabaseConfigured
    ? (cloud?.incoming ?? []).map((r) => ({ id: r.id, from: r.username }))
    : localIncoming.map((r) => ({ id: r.id, from: r.from }));

  const outgoing = isSupabaseConfigured
    ? (cloud?.outgoing ?? []).map((r) => ({ id: r.id, from: r.username }))
    : localOutgoing.map((r) => ({ id: r.id, from: r.from }));

  const onAccept = isSupabaseConfigured ? accept : (id: string) => acceptLocal(id);
  const onDecline = isSupabaseConfigured ? decline : (id: string) => declineLocal(id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Friends</h1>
      <p className="text-ink-muted text-sm mb-6">Compare progress and keep each other moving.</p>

      <div className="card mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Invite classmates</div>
            <p className="text-sm text-ink-muted">Add a friend by their username.</p>
          </div>
          <Link href="/friends/invite" className="btn-secondary px-4 py-2 text-sm">
            Add friend
          </Link>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">Friend requests</h2>
        {loading ? (
          <div className="rounded-xl border border-border bg-white p-4 text-sm text-ink-muted">
            Loading…
          </div>
        ) : incoming.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-4 text-sm text-ink-muted">
            No incoming requests right now.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {incoming.map((request) => (
              <li key={request.id} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
                <span className="size-10 rounded-full grid place-items-center bg-surface font-bold">
                  {request.from.slice(0, 1).toUpperCase()}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{request.from}</div>
                  <div className="text-xs text-ink-muted">Wants to add you as a friend</div>
                </div>
                <button
                  type="button"
                  onClick={() => onAccept(request.id)}
                  className="btn-primary px-3 py-2 text-sm"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => onDecline(request.id)}
                  className="btn-secondary px-3 py-2 text-sm"
                >
                  Decline
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {outgoing.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Sent requests</h2>
          <ul className="flex flex-col gap-2">
            {outgoing.map((request) => (
              <li key={request.id} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
                <span className="size-10 rounded-full grid place-items-center bg-primary-light text-primary font-bold">
                  {request.from.slice(0, 1).toUpperCase()}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{request.from}</div>
                  <div className="text-xs text-ink-muted">Request sent</div>
                </div>
                {isSupabaseConfigured ? (
                  <button
                    type="button"
                    onClick={() => cancel(request.id)}
                    className="text-xs font-semibold text-ink-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-ink-muted">Pending</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="text-lg font-bold mb-3">Your circle</h2>
      <ol className="flex flex-col gap-2">
        {friends.map((friend) => (
          <li key={friend.username} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
            <span className="size-10 rounded-full grid place-items-center bg-primary-light text-primary font-bold">
              {friend.username.slice(0, 1).toUpperCase()}
            </span>
            <span className="flex-1 font-medium">
              {friend.username}
              {friend.isYou && <span className="ml-2 text-xs text-primary">(you)</span>}
            </span>
            <span className="text-streak font-semibold text-sm">🔥 {friend.streak}</span>
            <span className="font-bold tabular-nums">{friend.xp.toLocaleString()} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
