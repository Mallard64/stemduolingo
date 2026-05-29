"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateLessonXP } from "@/lib/scoring";
import type { Profile } from "@/lib/types";

type LessonResult = {
  xpEarned: number;
  newTotalXP: number;
  newStreak: number;
  streakExtended: boolean;
};

type UserStore = {
  profile: Profile | null;
  hearts: number;
  heartsDate: string | null;       // YYYY-MM-DD of last refill
  completedTopics: string[];       // topic ids the user has finished
  puzzleDoneDate: string | null;   // YYYY-MM-DD the daily Element Match was last completed
  themeMode: "light" | "dark";
  hydrated: boolean;
  setProfile: (p: Profile) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  gainHeart: () => void;
  checkDaily: () => void;
  completeLesson: (topicId: string, heartsRemaining: number) => LessonResult;
  completePuzzle: () => void;
  isTopicCompleted: (topicId: string) => boolean;
  isPuzzleDoneToday: () => boolean;
  signIn: (username: string, email?: string) => void;
  signOut: () => void;
  setThemeMode: (mode: "light" | "dark") => void;
  changePassword: (newPassword: string) => Promise<boolean>;
};

const today = () => new Date().toISOString().slice(0, 10);
const HEART_CAP = 5;

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
      themeMode: "light",
      hydrated: false,
      setProfile: (p) => set({ profile: p }),
      loseHeart: () => set({ hearts: Math.max(0, get().hearts - 1) }),
      refillHearts: () => set({ hearts: HEART_CAP, heartsDate: today() }),
      gainHeart: () => set({ hearts: Math.min(HEART_CAP, get().hearts + 1) }),
      setThemeMode: (mode) => set({ themeMode: mode }),

      // Roll over anything that resets on a calendar boundary. Run on app load.
      checkDaily: () => {
        const t = today();
        if (get().heartsDate !== t) {
          set({ hearts: HEART_CAP, heartsDate: t });
        }
        // Streak breaks if a full day passed with no lesson (last active before yesterday).
        const p = get().profile;
        if (p?.last_active_date && p.current_streak > 0 && daysBetween(p.last_active_date, t) > 1) {
          set({ profile: { ...p, current_streak: 0 } });
        }
      },

      completeLesson: (topicId, heartsRemaining) => {
        const t = today();
        const xpEarned = calculateLessonXP(heartsRemaining);
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

      completePuzzle: () => set({ puzzleDoneDate: today() }),
      isTopicCompleted: (topicId) => get().completedTopics.includes(topicId),
      isPuzzleDoneToday: () => get().puzzleDoneDate === today(),

      signIn: (username, email?: string) =>
        set({
          profile: localProfile(username, email),
          hearts: HEART_CAP,
          heartsDate: today(),
          completedTopics: [],
          puzzleDoneDate: null,
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
