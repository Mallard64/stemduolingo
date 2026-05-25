"use client";
import { create } from "zustand";
import type { Question } from "@/lib/types";

type LessonStore = {
  topicId: string | null;
  questions: Question[];
  currentIndex: number;
  startedAt: number;
  startingHearts: number;
  startLesson: (topicId: string, qs: Question[], hearts: number) => void;
  next: () => void;
  reset: () => void;
};

export const useLesson = create<LessonStore>((set, get) => ({
  topicId: null,
  questions: [],
  currentIndex: 0,
  startedAt: 0,
  startingHearts: 5,
  startLesson: (topicId, questions, hearts) =>
    set({ topicId, questions, currentIndex: 0, startedAt: Date.now(), startingHearts: hearts }),
  next: () => set({ currentIndex: get().currentIndex + 1 }),
  reset: () => set({ topicId: null, questions: [], currentIndex: 0 }),
}));
