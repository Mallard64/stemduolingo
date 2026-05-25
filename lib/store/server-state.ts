// In-memory server-side store for the prototype. Replaces Supabase for demo.
// Persists for the lifetime of the dev server process.
import type { Profile } from "@/lib/types";

const DEMO_USER_ID = "demo-user";

type LessonCompletion = {
  user_id: string;
  topic_id: string;
  completed_at: string;
  xp_earned: number;
};

type PuzzleResult = {
  user_id: string;
  date: string;
  time_seconds: number;
  mistakes: number;
  completed: boolean;
};

type State = {
  demoProfile: Profile;
  completions: LessonCompletion[];
  puzzleResults: PuzzleResult[];
};

const g = globalThis as unknown as { __omnistemState?: State };

function init(): State {
  return {
    demoProfile: {
      id: DEMO_USER_ID,
      username: "you",
      created_at: new Date().toISOString(),
      current_streak: 0,
      last_active_date: null,
      total_xp: 0,
    },
    completions: [],
    puzzleResults: [],
  };
}

export function state(): State {
  if (!g.__omnistemState) g.__omnistemState = init();
  return g.__omnistemState;
}

export const DEMO_USER = DEMO_USER_ID;

export function completedTopicIds(userId: string): Set<string> {
  return new Set(state().completions.filter((c) => c.user_id === userId).map((c) => c.topic_id));
}

export function recordLessonCompletion(
  userId: string,
  topicId: string,
  xpEarned: number
): { newTotalXP: number; newStreak: number; streakExtended: boolean } {
  const s = state();
  const today = new Date().toISOString().slice(0, 10);
  s.completions.push({
    user_id: userId,
    topic_id: topicId,
    completed_at: new Date().toISOString(),
    xp_earned: xpEarned,
  });

  const p = s.demoProfile;
  p.total_xp += xpEarned;

  let streakExtended = false;
  if (p.last_active_date !== today) {
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    p.current_streak = p.last_active_date === y || p.current_streak === 0 ? p.current_streak + 1 : 1;
    p.last_active_date = today;
    streakExtended = true;
  }

  return { newTotalXP: p.total_xp, newStreak: p.current_streak, streakExtended };
}

export function puzzleAlreadyCompletedToday(userId: string, date: string): boolean {
  return state().puzzleResults.some((r) => r.user_id === userId && r.date === date);
}

export function recordPuzzleResult(
  userId: string,
  date: string,
  timeSeconds: number,
  mistakes: number,
  completed: boolean
) {
  state().puzzleResults.push({ user_id: userId, date, time_seconds: timeSeconds, mistakes, completed });
}
