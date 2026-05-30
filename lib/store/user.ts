"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateLessonXP } from "@/lib/scoring";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cloudChangePassword, cloudSignOut, loadUserState } from "@/lib/supabase/data";
import type { Profile } from "@/lib/types";

type LessonResult = {
  xpEarned: number;
  newTotalXP: number;
  newStreak: number;
  streakExtended: boolean;
};

export type FriendRequest = {
  id: string;
  from: string;
  sentAt: string;
};

export type StoreItemId = "heart-refill" | "streak-freeze" | "xp-boost";

type PurchaseResult = {
  purchased: boolean;
  spentXP: number;
  message: string;
};

// --- LOOTBOX CONFIGURATION ---
type Rarity = "common" | "uncommon" | "rare" | "legendary";

interface LootItem {
  id: "heart-refill" | "streak-freeze" | "xp-boost" | "xp-jackpot";
  name: string;
  weight: number;
  rarity: Rarity;
  xpAmount?: number;
}

const LOOTBOX_PRICE = 250;
const PITY_THRESHOLD = 10;

const LOOT_TABLE: LootItem[] = [
  { id: "heart-refill", name: "Heart Refill", weight: 50, rarity: "common" },
  { id: "streak-freeze", name: "Streak Freeze", weight: 30, rarity: "uncommon" },
  { id: "xp-boost", name: "2x XP Boost (12h)", weight: 15, rarity: "rare" },
  { id: "xp-jackpot", name: "1,000 XP Jackpot", weight: 5, rarity: "legendary", xpAmount: 1000 },
];
// -----------------------------

type UserStore = {
  profile: Profile | null;
  hearts: number;
  heartsDate: string | null;       // YYYY-MM-DD of last refill
  completedTopics: string[];       // topic ids the user has finished
  puzzleDoneDate: string | null;   // YYYY-MM-DD the daily Element Match was last completed
  themeMode: "light" | "dark";
  friendUsernames: string[];
  outgoingFriendRequests: FriendRequest[];
  incomingFriendRequests: FriendRequest[];
  streakFreezes: number;
  xpBoostUntil: string | null;
  lootboxPity: number;             // NEW: Tracks pulls without a Rare/Legendary
  hydrated: boolean;
  setProfile: (p: Profile) => void;
  hydrate: (force?: boolean) => Promise<void>; // load from cloud (or local) on app start
  resetLocal: () => void;           // clear all local state to a signed-out slate
  loseHeart: () => void;
  refillHearts: () => void;
  gainHeart: () => void;
  sendFriendRequest: (recipient: string) => void;
  acceptFriendRequest: (id: string) => void;
  declineFriendRequest: (id: string) => void;
  purchaseStoreItem: (itemId: StoreItemId) => PurchaseResult;
  openLootbox: () => { success: boolean; message: string }; // NEW: Lootbox handler
  useStreakFreeze: () => boolean;
  checkDaily: () => void;
  completeLesson: (topicId: string, heartsRemaining: number) => LessonResult;
  completePuzzle: () => void;
  isTopicCompleted: (topicId: string) => boolean;
  isPuzzleDoneToday: () => boolean;
  signIn: (username: string, email?: string) => void;
  signOut: () => Promise<void>;
  setThemeMode: (mode: "light" | "dark") => void;
  changePassword: (newPassword: string) => Promise<boolean>;
};

const today = () => new Date().toISOString().slice(0, 10);
const HEART_CAP = 5;
const DAY_MS = 86400000;
const XP_BOOST_MS = DAY_MS / 2;
const STORE_PRICES: Record<StoreItemId, number> = {
  "heart-refill": 100,
  "streak-freeze": 200,
  "xp-boost": 100,
};

// Whole calendar days between two YYYY-MM-DD strings (parsed as UTC midnight).
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86400000);

const localProfile = (username: string, email?: string): Profile => ({
  id: "demo-user",
  username,
  email: email || "",
  created_at: new Date().toISOString(),
  current_streak: 0,
  last_active_date: null,
  total_xp: 0,
});

let hydrating = false;

export const useUser = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      hearts: HEART_CAP,
      heartsDate: null,
      completedTopics: [],
      puzzleDoneDate: null,
      themeMode: "light",
      friendUsernames: ["Avery", "Sam"],
      outgoingFriendRequests: [],
      incomingFriendRequests: [
        { id: "req-maya", from: "Maya", sentAt: new Date().toISOString() },
        { id: "req-jordan", from: "Jordan", sentAt: new Date().toISOString() },
      ],
      streakFreezes: 0,
      xpBoostUntil: null,
      lootboxPity: 0,
      hydrated: false,
      setProfile: (p) => set({ profile: p }),

      // Pulls authoritative state from Supabase (overwriting any stale local
      // copy). Runs once on initial app load; pass `force` to re-pull after a
      // login so the new account's data replaces the previous one's cache.
      hydrate: async (force = false) => {
        if (hydrating) return;
        if (!force && get().hydrated) return;
        hydrating = true;
        try {
          if (isSupabaseConfigured) {
            const state = await loadUserState();
            if (state) {
              set({
                profile: state.profile,
                completedTopics: state.completedTopics,
                puzzleDoneDate: state.puzzleDoneDate,
              });
            } else {
              set({ profile: null }); // configured but signed out
            }
          }
        } catch {
          // Network/Supabase hiccup — fall back to whatever is local.
        } finally {
          set({ hydrated: true });
          hydrating = false;
        }
      },

      // Wipe all local state back to a clean signed-out slate. Used on sign-out
      // and before loading a different account so no cache bleeds across users.
      resetLocal: () =>
        set({
          profile: null,
          hearts: HEART_CAP,
          heartsDate: today(),
          completedTopics: [],
          puzzleDoneDate: null,
          friendUsernames: ["Avery", "Sam"],
          outgoingFriendRequests: [],
          incomingFriendRequests: [
            { id: "req-maya", from: "Maya", sentAt: new Date().toISOString() },
            { id: "req-jordan", from: "Jordan", sentAt: new Date().toISOString() },
          ],
          streakFreezes: 0,
          xpBoostUntil: null,
          lootboxPity: 0,
          hydrated: true,
        }),

      loseHeart: () => set({ hearts: Math.max(0, get().hearts - 1) }),
      refillHearts: () => set({ hearts: HEART_CAP, heartsDate: today() }),
      gainHeart: () => set({ hearts: Math.min(HEART_CAP, get().hearts + 1) }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      sendFriendRequest: (recipient) => {
        const trimmed = recipient.trim();
        if (!trimmed) return;
        set({
          outgoingFriendRequests: [
            {
              id: `sent-${Date.now()}`,
              from: trimmed,
              sentAt: new Date().toISOString(),
            },
            ...get().outgoingFriendRequests,
          ],
        });
      },
      acceptFriendRequest: (id) => {
        const request = get().incomingFriendRequests.find((item) => item.id === id);
        if (!request) return;
        set({
          friendUsernames: get().friendUsernames.includes(request.from)
            ? get().friendUsernames
            : [request.from, ...get().friendUsernames],
          incomingFriendRequests: get().incomingFriendRequests.filter((item) => item.id !== id),
        });
      },
      declineFriendRequest: (id) =>
        set({ incomingFriendRequests: get().incomingFriendRequests.filter((request) => request.id !== id) }),
      
      purchaseStoreItem: (itemId) => {
        const p = get().profile;
        const price = STORE_PRICES[itemId];
        const canAfford = !!p && p.total_xp >= price;
        const spentXP = canAfford ? price : 0;

        if (itemId === "heart-refill") {
          get().refillHearts();
        }
        if (itemId === "streak-freeze") {
          set({ streakFreezes: get().streakFreezes + 1 });
        }
        if (itemId === "xp-boost") {
          set({ xpBoostUntil: new Date(Date.now() + XP_BOOST_MS).toISOString() });
        }

        if (p && canAfford) {
          set({ profile: { ...p, total_xp: p.total_xp - price } });
        }

        return {
          purchased: true,
          spentXP,
          message: canAfford
            ? `Purchased for ${price} XP.`
            : `Not enough XP for the ${price} XP price, but the demo granted it anyway.`,
        };
      },

      openLootbox: () => {
        const p = get().profile;
        if (!p) return { success: false, message: "You must be signed in to open a mystery box." };

        const canAfford = p.total_xp >= LOOTBOX_PRICE;
        const priceToDeduct = canAfford ? LOOTBOX_PRICE : 0; // Mirrors demo logic from purchaseStoreItem

        // 1. Determine Pity Status
        const currentPity = get().lootboxPity || 0;
        const isPityPull = currentPity >= PITY_THRESHOLD - 1;

        // Filter the loot table if Pity is active (guarantee Rare or Legendary)
        const activeTable = isPityPull
          ? LOOT_TABLE.filter((item) => item.rarity === "rare" || item.rarity === "legendary")
          : LOOT_TABLE;

        // 2. Roll weighted RNG
        const totalWeight = activeTable.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        let wonItem = activeTable[activeTable.length - 1]; // Fallback to last item

        for (const item of activeTable) {
          if (random < item.weight) {
            wonItem = item;
            break;
          }
          random -= item.weight;
        }

        // 3. Process Pity Reset/Increment
        const isRareOrBetter = wonItem.rarity === "rare" || wonItem.rarity === "legendary";
        const newPity = isRareOrBetter ? 0 : currentPity + 1;

        // 4. Grant Rewards using existing store actions where possible
        let xpWinnings = 0;

        if (wonItem.id === "heart-refill") {
          get().refillHearts();
        } else if (wonItem.id === "streak-freeze") {
          set({ streakFreezes: get().streakFreezes + 1 });
        } else if (wonItem.id === "xp-boost") {
          const now = Date.now();
          const existingBoost = get().xpBoostUntil;
          const currentBoost = existingBoost ? Date.parse(existingBoost) : now;
          const newBoost = Math.max(now, currentBoost) + XP_BOOST_MS;
          set({ xpBoostUntil: new Date(newBoost).toISOString() });
        } else if (wonItem.id === "xp-jackpot" && wonItem.xpAmount) {
          xpWinnings = wonItem.xpAmount;
        }

        // 5. Update XP and Pity
        set({
          lootboxPity: newPity,
          profile: { ...p, total_xp: p.total_xp - priceToDeduct + xpWinnings },
        });

        const rarityIcons = { common: "🤍", uncommon: "💚", rare: "💙", legendary: "💛" };
        const demoPrefix = canAfford ? "" : "(Demo freebie) ";

        return {
          success: true,
          message: `${demoPrefix}Opened Mystery Box! You got: ${wonItem.name} ${rarityIcons[wonItem.rarity]}`,
        };
      },

      useStreakFreeze: () => {
        const p = get().profile;
        if (!p || p.current_streak <= 0 || get().streakFreezes <= 0) return false;
        set({
          streakFreezes: get().streakFreezes - 1,
          profile: {
            ...p,
            last_active_date: today(),
          },
        });
        return true;
      },

      // Roll over anything that resets on a calendar boundary. Run on app load.
      checkDaily: () => {
        const t = today();
        if (get().heartsDate !== t) {
          set({ hearts: HEART_CAP, heartsDate: t });
        }
        // Streak breaks if a full day passed with no lesson (last active before yesterday).
        const p = get().profile;
        const gap = p?.last_active_date ? daysBetween(p.last_active_date, t) : 0;
        if (p?.last_active_date && p.current_streak > 0 && gap === 2 && get().streakFreezes > 0) {
          set({
            streakFreezes: get().streakFreezes - 1,
            profile: { ...p, last_active_date: new Date(Date.parse(t) - DAY_MS).toISOString().slice(0, 10) },
          });
          return;
        }
        if (p?.last_active_date && p.current_streak > 0 && gap > 1) {
          set({ profile: { ...p, current_streak: 0 } });
        }
      },

      completeLesson: (topicId, heartsRemaining) => {
        const t = today();
        const xpBoostUntil = get().xpBoostUntil;
        const xpMultiplier = xpBoostUntil && Date.parse(xpBoostUntil) > Date.now() ? 2 : 1;
        const xpEarned = calculateLessonXP(heartsRemaining) * xpMultiplier;
        const p = get().profile;
        if (!p) return { xpEarned, newTotalXP: 0, newStreak: 0, streakExtended: false };

        const completedTopics = get().completedTopics.includes(topicId)
          ? get().completedTopics
          : [...get().completedTopics, topicId];
        const newTotalXP = p.total_xp + xpEarned;

        let newStreak = p.current_streak;
        let streakExtended = false;
        if (p.last_active_date !== t) {
          const gap = p.last_active_date ? daysBetween(p.last_active_date, t) : Infinity;
          newStreak = gap === 1 ? p.current_streak + 1 : 1;
          streakExtended = true;
        }

        // Optimistic local update for instant UI.
        set({
          completedTopics,
          profile: { ...p, total_xp: newTotalXP, current_streak: newStreak, last_active_date: t },
        });

        // Persist to the cloud (server is authoritative; reconcile its numbers).
        if (isSupabaseConfigured) {
          fetch("/api/lessons/complete", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ topic_id: topicId, hearts_remaining: heartsRemaining, xp_earned: xpEarned, time_seconds: 0 }),
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (!data) return;
              const cur = get().profile;
              if (!cur) return;
              set({
                profile: {
                  ...cur,
                  total_xp: data.new_total_xp ?? cur.total_xp,
                  current_streak: data.new_streak ?? cur.current_streak,
                  last_active_date: t,
                },
              });
            })
            .catch(() => {});
        }

        return { xpEarned, newTotalXP, newStreak, streakExtended };
      },

      completePuzzle: () => set({ puzzleDoneDate: today() }),
      isTopicCompleted: (topicId) => get().completedTopics.includes(topicId),
      isPuzzleDoneToday: () => get().puzzleDoneDate === today(),

      // Local-only sign in (used when Supabase isn't configured). In cloud mode
      // the auth pages call Supabase directly and `hydrate()` loads the profile.
      signIn: (username, email?: string) =>
        set({
          profile: localProfile(username, email),
          hearts: HEART_CAP,
          heartsDate: today(),
          completedTopics: [],
          puzzleDoneDate: null,
          friendUsernames: ["Avery", "Sam"],
          outgoingFriendRequests: [],
          incomingFriendRequests: [
            { id: "req-maya", from: "Maya", sentAt: new Date().toISOString() },
            { id: "req-jordan", from: "Jordan", sentAt: new Date().toISOString() },
          ],
          streakFreezes: 0,
          xpBoostUntil: null,
          lootboxPity: 0, // Reset pity on new sign in
        }),
      signOut: async () => {
        await cloudSignOut();
        get().resetLocal();
      },
      changePassword: async (newPassword) => cloudChangePassword(newPassword),
    }),
    {
      name: "omnistem-user",
      // Never persist `hydrated` — it must start false each load so `hydrate()`
      // re-pulls the authoritative state from the cloud.
      partialize: (s) => ({
        profile: s.profile,
        hearts: s.hearts,
        heartsDate: s.heartsDate,
        completedTopics: s.completedTopics,
        puzzleDoneDate: s.puzzleDoneDate,
        themeMode: s.themeMode,
        friendUsernames: s.friendUsernames,
        outgoingFriendRequests: s.outgoingFriendRequests,
        incomingFriendRequests: s.incomingFriendRequests,
        streakFreezes: s.streakFreezes,
        xpBoostUntil: s.xpBoostUntil,
        lootboxPity: s.lootboxPity,
      }),
    }
  )
);