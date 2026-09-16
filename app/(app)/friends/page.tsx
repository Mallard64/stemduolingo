"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useUser } from "@/lib/store/user";

const FRIEND_STATS: Record<string, { streak: number; xp: number }> = {
  Maya: { streak: 12, xp: 2420 },
  Jordan: { streak: 8, xp: 1890 },
  Avery: { streak: 5, xp: 1540 },
  Sam: { streak: 3, xp: 980 },
};

export default function FriendsPage() {
  const profile = useUser((s) => s.profile);
  const friendUsernames = useUser((s) => s.friendUsernames);
  const incomingFriendRequests = useUser((s) => s.incomingFriendRequests);
  const outgoingFriendRequests = useUser((s) => s.outgoingFriendRequests);
  const acceptFriendRequest = useUser((s) => s.acceptFriendRequest);
  const declineFriendRequest = useUser((s) => s.declineFriendRequest);
  const friends = useMemo(
    () => [
      ...(profile
        ? [
            {
              username: profile.username,
              streak: profile.current_streak,
              xp: profile.total_xp,
              imageUrl: profile.profile_image_url ?? null,
              isYou: true,
            },
          ]
        : []),
      ...friendUsernames.map((username) => ({
        username,
        streak: FRIEND_STATS[username]?.streak ?? 0,
        xp: FRIEND_STATS[username]?.xp ?? 0,
      })),
    ],
    [friendUsernames, profile]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Friends</h1>
      <p className="text-ink-muted text-sm mb-6">Compare progress and keep each other moving.</p>

      <div className="card mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Invite classmates</div>
            <p className="text-sm text-ink-muted">Send a request by username or email.</p>
          </div>
          <Link href="/friends/invite" className="btn-secondary px-4 py-2 text-sm">
            Invite
          </Link>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">Friend requests</h2>
        {incomingFriendRequests.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-ink-muted">
            No incoming requests right now.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {incomingFriendRequests.map((request) => (
              <li key={request.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <span className="size-10 rounded-full grid place-items-center bg-surface font-bold">
                  {request.from.slice(0, 1).toUpperCase()}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{request.from}</div>
                  <div className="text-xs text-ink-muted">Wants to add you as a friend</div>
                </div>
                <button
                  type="button"
                  onClick={() => acceptFriendRequest(request.id)}
                  className="btn-primary px-3 py-2 text-sm"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => declineFriendRequest(request.id)}
                  className="btn-secondary px-3 py-2 text-sm"
                >
                  Decline
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {outgoingFriendRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Sent requests</h2>
          <ul className="flex flex-col gap-2">
            {outgoingFriendRequests.map((request) => (
              <li key={request.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <span className="size-10 rounded-full grid place-items-center bg-primary-light text-primary font-bold">
                  {request.from.slice(0, 1).toUpperCase()}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{request.from}</div>
                  <div className="text-xs text-ink-muted">Request sent</div>
                </div>
                <span className="text-xs font-semibold text-ink-muted">Pending</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="text-lg font-bold mb-3">Your circle</h2>
      <ol className="flex flex-col gap-2">
        {friends.map((friend) => (
          <li key={friend.username} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <FriendAvatar username={friend.username} imageUrl={"imageUrl" in friend ? friend.imageUrl : null} />
            <span className="flex-1 font-medium">
              {friend.username}
              {"isYou" in friend && friend.isYou && <span className="ml-2 text-xs text-primary">(you)</span>}
            </span>
            <span className="text-streak font-semibold text-sm">🔥 {friend.streak}</span>
            <span className="font-bold tabular-nums">{friend.xp.toLocaleString()} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FriendAvatar({ username, imageUrl }: { username: string; imageUrl?: string | null }) {
  return (
    <span className="size-10 overflow-hidden rounded-full grid place-items-center bg-primary-light text-primary font-bold">
      {imageUrl ? <img src={imageUrl} alt="" className="size-full object-cover" /> : username.slice(0, 1).toUpperCase()}
    </span>
  );
}
