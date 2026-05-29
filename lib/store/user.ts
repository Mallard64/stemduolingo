"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateLessonXP } from "@/lib/scoring";
import type { DailyGameId, Profile } from "@/lib/types";

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

type UserStore = {
  profile: Profile | null;
  hearts: number;
  heartsDate: string | null;       // YYYY-MM-DD of last refill
  completedTopics: string[];       // topic ids the user has finished
  puzzleDoneDate: string | null;   // YYYY-MM-DD the daily Element Match was last completed
  dailyGameDoneDates: Partial<Record<DailyGameId, string>>;
  themeMode: "light" | "dark";
  friendUsernames: string[];
  outgoingFriendRequests: FriendRequest[];
  incomingFriendRequests: FriendRequest[];
  streakFreezes: number;
  xpBoostUntil: string | null;
  hydrated: boolean;
  setProfile: (p: Profile) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  gainHeart: () => void;
  sendFriendRequest: (recipient: string) => void;
  acceptFriendRequest: (id: string) => void;
  declineFriendRequest: (id: string) => void;
  purchaseStoreItem: (itemId: StoreItemId) => PurchaseResult;
  useStreakFreeze: () => boolean;
  checkDaily: () => void;
  completeLesson: (topicId: string, heartsRemaining: number) => LessonResult;
  completePuzzle: (gameId?: DailyGameId) => void;
  isTopicCompleted: (topicId: string) => boolean;
  isPuzzleDoneToday: () => boolean;
  isDailyGameDoneToday: (gameId: DailyGameId) => boolean;
  signIn: (username: string, email?: string) => void;
  signOut: () => void;
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
  "xp-boost": 300,
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

export const useUser = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      hearts: HEART_CAP,
      heartsDate: null,
      completedTopics: [],
      puzzleDoneDate: null,
      dailyGameDoneDates: {},
      themeMode: "light",
      friendUsernames: ["Avery", "Sam"],
      outgoingFriendRequests: [],
      incomingFriendRequests: [
        { id: "req-maya", from: "Maya", sentAt: new Date().toISOString() },
        { id: "req-jordan", from: "Jordan", sentAt: new Date().toISOString() },
      ],
      streakFreezes: 0,
      xpBoostUntil: null,
      hydrated: false,
      setProfile: (p) => set({ profile: p }),
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

        set({
          completedTopics,
          profile: { ...p, total_xp: newTotalXP, current_streak: newStreak, last_active_date: t },
        });
        return { xpEarned, newTotalXP, newStreak, streakExtended };
      },

      completePuzzle: (gameId = "element-match") => {
        const t = today();
        set({
          puzzleDoneDate: gameId === "element-match" ? t : get().puzzleDoneDate,
          dailyGameDoneDates: { ...(get().dailyGameDoneDates ?? {}), [gameId]: t },
        });
      },
      isTopicCompleted: (topicId) => get().completedTopics.includes(topicId),
      isPuzzleDoneToday: () => get().puzzleDoneDate === today(),
      isDailyGameDoneToday: (gameId) =>
        get().dailyGameDoneDates?.[gameId] === today() ||
        (gameId === "element-match" && get().puzzleDoneDate === today()),

      signIn: (username, email?: string) =>
        set({
          profile: localProfile(username, email),
          hearts: HEART_CAP,
          heartsDate: today(),
          completedTopics: [],
          puzzleDoneDate: null,
          dailyGameDoneDates: {},
          friendUsernames: ["Avery", "Sam"],
          outgoingFriendRequests: [],
          incomingFriendRequests: [
            { id: "req-maya", from: "Maya", sentAt: new Date().toISOString() },
            { id: "req-jordan", from: "Jordan", sentAt: new Date().toISOString() },
          ],
          streakFreezes: 0,
          xpBoostUntil: null,
        }),
      signOut: () => set({ profile: null }),
      changePassword: async (newPassword) => {
        // Mock implementation - in real app would call Supabase auth
        return true;
      },
    }),
    {
      name: "omnistem-user",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
