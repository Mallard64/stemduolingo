"use client";
import { useMemo } from "react";
import { useUser } from "@/lib/store/user";

const FRIENDS = [
  { username: "Maya", streak: 12, xp: 2420 },
  { username: "Jordan", streak: 8, xp: 1890 },
  { username: "Avery", streak: 5, xp: 1540 },
  { username: "Sam", streak: 3, xp: 980 },
];

export default function FriendsPage() {
  const profile = useUser((s) => s.profile);
  const friends = useMemo(
    () => [
      ...(profile
        ? [{ username: profile.username, streak: profile.current_streak, xp: profile.total_xp, isYou: true }]
        : []),
      ...FRIENDS,
    ],
    [profile]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Friends</h1>
      <p className="text-ink-muted text-sm mb-6">Compare progress and keep each other moving.</p>

      <div className="card mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Invite classmates</div>
            <p className="text-sm text-ink-muted">Friend invites are mocked for this prototype.</p>
          </div>
          <button className="btn-secondary px-4 py-2 text-sm" type="button">
            Invite
          </button>
        </div>
      </div>

      <ol className="flex flex-col gap-2">
        {friends.map((friend) => (
          <li key={friend.username} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
            <span className="size-10 rounded-full grid place-items-center bg-primary-light text-primary font-bold">
              {friend.username.slice(0, 1).toUpperCase()}
            </span>
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
