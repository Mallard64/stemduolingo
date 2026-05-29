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

type UserStore = {
  profile: Profile | null;
  hearts: number;
  heartsDate: string | null;       // YYYY-MM-DD of last refill
  completedTopics: string[];       // topic ids the user has finished
  puzzleDoneDate: string | null;   // YYYY-MM-DD the daily Element Match was last completed
  hydrated: boolean;
  setProfile: (p: Profile) => void;
  hydrate: () => Promise<void>;     // load from cloud (or local) on app start
  loseHeart: () => void;
  refillHearts: () => void;
  gainHeart: () => void;
  checkDaily: () => void;
  completeLesson: (topicId: string, heartsRemaining: number) => LessonResult;
  completePuzzle: () => void;
  isTopicCompleted: (topicId: string) => boolean;
  isPuzzleDoneToday: () => boolean;
  signIn: (username: string, email?: string) => void;
  signOut: () => Promise<void>;
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

let hydrating = false;

export const useUser = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      hearts: HEART_CAP,
      heartsDate: null,
      completedTopics: [],
      puzzleDoneDate: null,
      hydrated: false,
      setProfile: (p) => set({ profile: p }),

      // Runs once on app load. In cloud mode it pulls the authoritative state
      // from Supabase (overwriting any stale local copy). In local-only mode
      // the values rehydrated from localStorage by `persist` are kept as-is.
      hydrate: async () => {
        if (get().hydrated || hydrating) return;
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

      loseHeart: () => set({ hearts: Math.max(0, get().hearts - 1) }),
      refillHearts: () => set({ hearts: HEART_CAP, heartsDate: today() }),
      gainHeart: () => set({ hearts: Math.min(HEART_CAP, get().hearts + 1) }),

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
            body: JSON.stringify({ topic_id: topicId, hearts_remaining: heartsRemaining, time_seconds: 0 }),
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
        }),
      signOut: async () => {
        await cloudSignOut();
        set({ profile: null, completedTopics: [], puzzleDoneDate: null });
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
      }),
    }
  )
);
