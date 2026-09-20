"use client";
import { create } from "zustand";
import type { MCQQuestion } from "@/lib/types";

// A generated (or fallback) MCQ plus the difficulty it was produced at.
export type CachedQuestion = MCQQuestion & {
  difficulty: number;
  source: "ai" | "fallback";
};

const START_DIFFICULTY = 5;
const EXPECTED = 5;

type LessonStore = {
  topicId: string | null;
  cache: CachedQuestion[];      // generated questions, indexed by slot
  currentIndex: number;
  difficulty: number;           // difficulty for the NEXT question (1-10)
  expected: number;             // questions per lesson
  startedAt: number;
  startingHearts: number;
  startLesson: (topicId: string, hearts: number) => void;
  pushQuestion: (q: CachedQuestion) => void;
  recordAnswer: (correct: boolean) => void;   // adjusts difficulty, advances
  reset: () => void;
};

export const useLesson = create<LessonStore>((set, get) => ({
  topicId: null,
  cache: [],
  currentIndex: 0,
  difficulty: START_DIFFICULTY,
  expected: EXPECTED,
  startedAt: 0,
  startingHearts: 5,
  startLesson: (topicId, hearts) =>
    set({
      topicId,
      cache: [],
      currentIndex: 0,
      difficulty: START_DIFFICULTY,
      expected: EXPECTED,
      startedAt: Date.now(),
      startingHearts: hearts,
    }),
  pushQuestion: (q) => set({ cache: [...get().cache, q] }),
  recordAnswer: (correct) =>
    set((s) => ({
      difficulty: Math.min(10, Math.max(1, s.difficulty + (correct ? 1 : -1))),
      currentIndex: s.currentIndex + 1,
    })),
  reset: () =>
    set({ topicId: null, cache: [], currentIndex: 0, difficulty: START_DIFFICULTY }),
}));
