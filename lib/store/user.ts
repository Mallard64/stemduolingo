"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateLessonXP } from "@/lib/scoring";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  cloudChangePassword,
  cloudSignOut,
  loadUserState,
  syncProfileState,
} from "@/lib/supabase/data";
import {
  LOOTBOX_PRICE,
  STORE_PRICES,
  invCount,
  type Inventory,
  type StoreItemId,
} from "@/lib/store/items";
import type { Profile } from "@/lib/types";

export type { StoreItemId } from "@/lib/store/items";

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
  inventory: Inventory;            // itemId -> quantity owned (synced to Supabase)
  xpBoostUntil: string | null;
  lootboxPity: number;             // Tracks pulls without a Rare/Legendary
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
  useHeartRefill: () => boolean;   // consume a heart-refill from the inventory
  activateXpBoost: () => boolean;  // consume an xp-boost, starting/extending the 12h timer
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

// Fire-and-forget push of the current owned-state to Supabase. Call after any
// action that changes XP balance, inventory, the XP boost, or the pity counter.
function pushCloudSync(state: UserStore) {
  if (!isSupabaseConfigured || !state.profile) return;
  void syncProfileState({
    total_xp: state.profile.total_xp,
    xp_boost_until: state.xpBoostUntil,
    lootbox_pity: state.lootboxPity,
    inventory: state.inventory,
  });
}

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
      inventory: {},
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
                inventory: state.inventory,
                xpBoostUntil: state.xpBoostUntil,
                lootboxPity: state.lootboxPity,
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
          inventory: {},
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

        // Items go into the inventory rather than being consumed instantly; the
        // user applies them from the Inventory page.
        const inventory = { ...get().inventory, [itemId]: invCount(get().inventory, itemId) + 1 };
        set({
          inventory,
          profile: p && canAfford ? { ...p, total_xp: p.total_xp - price } : p,
        });
        pushCloudSync(get());

        return {
          purchased: true,
          spentXP,
          message: canAfford
            ? `Purchased for ${price} XP — added to your inventory.`
            : `Not enough XP for the ${price} XP price, but the demo added it to your inventory anyway.`,
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

        // 4. Grant Rewards. Consumables drop into the inventory (used later);
        //    the jackpot pays out XP directly.
        let xpWinnings = 0;
        const inventory = { ...get().inventory };

        if (
          wonItem.id === "heart-refill" ||
          wonItem.id === "streak-freeze" ||
          wonItem.id === "xp-boost"
        ) {
          inventory[wonItem.id] = invCount(inventory, wonItem.id) + 1;
        } else if (wonItem.id === "xp-jackpot" && wonItem.xpAmount) {
          xpWinnings = wonItem.xpAmount;
        }

        // 5. Update inventory, XP, and Pity, then sync to the cloud.
        set({
          inventory,
          lootboxPity: newPity,
          profile: { ...p, total_xp: p.total_xp - priceToDeduct + xpWinnings },
        });
        pushCloudSync(get());

        const rarityIcons = { common: "🤍", uncommon: "💚", rare: "💙", legendary: "💛" };
        const demoPrefix = canAfford ? "" : "(Demo freebie) ";

        return {
          success: true,
          message: `${demoPrefix}Opened Mystery Box! You got: ${wonItem.name} ${rarityIcons[wonItem.rarity]}`,
        };
      },

      useStreakFreeze: () => {
        const p = get().profile;
        const owned = invCount(get().inventory, "streak-freeze");
        if (!p || p.current_streak <= 0 || owned <= 0) return false;
        set({
          inventory: { ...get().inventory, "streak-freeze": owned - 1 },
          profile: { ...p, last_active_date: today() },
        });
        pushCloudSync(get());
        return true;
      },

      useHeartRefill: () => {
        const owned = invCount(get().inventory, "heart-refill");
        if (owned <= 0) return false;
        set({
          inventory: { ...get().inventory, "heart-refill": owned - 1 },
          hearts: HEART_CAP,
          heartsDate: today(),
        });
        pushCloudSync(get());
        return true;
      },

      activateXpBoost: () => {
        const owned = invCount(get().inventory, "xp-boost");
        if (owned <= 0) return false;
        // Stack onto any remaining boost time rather than overwriting it.
        const now = Date.now();
        const existing = get().xpBoostUntil;
        const base = existing ? Math.max(now, Date.parse(existing)) : now;
        set({
          inventory: { ...get().inventory, "xp-boost": owned - 1 },
          xpBoostUntil: new Date(base + XP_BOOST_MS).toISOString(),
        });
        pushCloudSync(get());
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
        const freezesOwned = invCount(get().inventory, "streak-freeze");
        if (p?.last_active_date && p.current_streak > 0 && gap === 2 && freezesOwned > 0) {
          set({
            inventory: { ...get().inventory, "streak-freeze": freezesOwned - 1 },
            profile: { ...p, last_active_date: new Date(Date.parse(t) - DAY_MS).toISOString().slice(0, 10) },
          });
          pushCloudSync(get());
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
          inventory: {},
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
        inventory: s.inventory,
        xpBoostUntil: s.xpBoostUntil,
        lootboxPity: s.lootboxPity,
      }),
    }
  )
);