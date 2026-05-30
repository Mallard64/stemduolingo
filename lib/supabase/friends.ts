"use client";
import { createClient } from "./client";

// A confirmed friend, shown in "Your circle" with live stats from their profile.
export type FriendProfile = {
  id: string;
  username: string;
  total_xp: number;
  current_streak: number;
};

// A pending request, identified by the friend_requests row id so it can be
// accepted/declined/cancelled. `username` is the other party.
export type PendingRequest = {
  id: string;
  username: string;
};

export type FriendsData = {
  friends: FriendProfile[];
  incoming: PendingRequest[]; // they requested you — accept/decline
  outgoing: PendingRequest[]; // you requested them — pending
};

type Row = {
  id: string;
  status: string;
  requester_id: string;
  addressee_id: string;
  requester: FriendProfile | null;
  addressee: FriendProfile | null;
};

const SELECT = `
  id, status, requester_id, addressee_id,
  requester:profiles!friend_requests_requester_id_fkey ( id, username, total_xp, current_streak ),
  addressee:profiles!friend_requests_addressee_id_fkey ( id, username, total_xp, current_streak )
`;

// Loads every friendship row involving the signed-in user and buckets them into
// confirmed friends / incoming / outgoing. Returns null in local-only mode or
// when signed out so callers can fall back to the local demo data.
export async function loadFriends(): Promise<FriendsData | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("friend_requests")
    .select(SELECT)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("loadFriends failed:", error.message);
    return { friends: [], incoming: [], outgoing: [] };
  }

  const rows = (data ?? []) as unknown as Row[];
  const friends: FriendProfile[] = [];
  const incoming: PendingRequest[] = [];
  const outgoing: PendingRequest[] = [];

  for (const row of rows) {
    const iAmRequester = row.requester_id === user.id;
    const other = iAmRequester ? row.addressee : row.requester;
    if (!other) continue;
    if (row.status === "accepted") {
      friends.push(other);
    } else if (row.status === "pending") {
      if (iAmRequester) outgoing.push({ id: row.id, username: other.username });
      else incoming.push({ id: row.id, username: other.username });
    }
  }

  return { friends, incoming, outgoing };
}

// Sends a friend request to the user with the given username (case-insensitive).
export async function sendFriendRequestByUsername(
  username: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = createClient();
  if (!supabase) return { ok: false, message: "Sign in to add friends." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sign in to add friends." };

  const handle = username.trim().replace(/^@/, "");
  if (!handle) return { ok: false, message: "Enter a username." };

  const { data: target } = await supabase
    .from("profiles")
    .select("id, username")
    .ilike("username", handle)
    .maybeSingle();

  if (!target) return { ok: false, message: `No user named “${handle}”.` };
  if (target.id === user.id) return { ok: false, message: "You can't add yourself." };

  // If they already sent YOU a pending request, accept it instead of creating
  // a mirrored one.
  const { data: reverse } = await supabase
    .from("friend_requests")
    .select("id, status")
    .eq("requester_id", target.id)
    .eq("addressee_id", user.id)
    .maybeSingle();
  if (reverse) {
    if (reverse.status === "accepted")
      return { ok: false, message: `You're already friends with ${target.username}.` };
    await supabase.from("friend_requests").update({ status: "accepted" }).eq("id", reverse.id);
    return { ok: true, message: `You're now friends with ${target.username}!` };
  }

  const { error } = await supabase
    .from("friend_requests")
    .insert({ requester_id: user.id, addressee_id: target.id });

  if (error) {
    if (error.code === "23505")
      return { ok: false, message: `Request to ${target.username} already exists.` };
    return { ok: false, message: error.message };
  }
  return { ok: true, message: `Friend request sent to ${target.username}.` };
}

// Accept (status → accepted) or decline (delete the row) an incoming request.
export async function respondToRequest(
  id: string,
  accept: boolean
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;
  if (accept) {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", id);
    return !error;
  }
  const { error } = await supabase.from("friend_requests").delete().eq("id", id);
  return !error;
}

// Cancel an outgoing request (delete the row).
export async function cancelRequest(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;
  const { error } = await supabase.from("friend_requests").delete().eq("id", id);
  return !error;
}
