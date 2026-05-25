"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/lib/types";

type UserStore = {
  profile: Profile | null;
  hearts: number;
  heartsDate: string | null;       // YYYY-MM-DD of last refill
  hydrated: boolean;
  setProfile: (p: Profile) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  gainHeart: () => void;
  maybeDailyRefill: () => void;
  addXP: (n: number) => void;
  setStreak: (n: number) => void;
  setTotalXP: (n: number) => void;
  signIn: (username: string) => void;
  signOut: () => void;
};

const today = () => new Date().toISOString().slice(0, 10);
const HEART_CAP = 5;

const localProfile = (username: string): Profile => ({
  id: "demo-user",
  username,
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
      hydrated: false,
      setProfile: (p) => set({ profile: p }),
      loseHeart: () => set({ hearts: Math.max(0, get().hearts - 1) }),
      refillHearts: () => set({ hearts: HEART_CAP, heartsDate: today() }),
      gainHeart: () => set({ hearts: Math.min(HEART_CAP, get().hearts + 1) }),
      maybeDailyRefill: () => {
        if (get().heartsDate !== today()) {
          set({ hearts: HEART_CAP, heartsDate: today() });
        }
      },
      addXP: (n) => set({ profile: get().profile ? { ...get().profile!, total_xp: get().profile!.total_xp + n } : null }),
      setStreak: (n) => set({ profile: get().profile ? { ...get().profile!, current_streak: n } : null }),
      setTotalXP: (n) => set({ profile: get().profile ? { ...get().profile!, total_xp: n } : null }),
      signIn: (username) => set({ profile: localProfile(username), hearts: HEART_CAP, heartsDate: today() }),
      signOut: () => set({ profile: null }),
    }),
    {
      name: "omnistem-user",
      onRehydrateStorage: () => (state) => {
        state?.hydrated && state;
        if (state) state.hydrated = true;
      },
    }
  )
);
