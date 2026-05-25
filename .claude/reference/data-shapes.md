# Data Shapes (TypeScript)

The canonical TS types. Put these in `lib/types.ts` and import everywhere — do not redefine inline.

## Question types

```ts
export type QuestionBase = {
  id: string;
  topic_id: string;
  question_text: string;
  explanation: string | null;
};

// MCQ — single correct answer
export type MCQQuestion = QuestionBase & {
  question_type: 'mcq';
  options: { id: string; text: string }[];
  correct_answer: { id: string };
};

// Multi-select — multiple correct answers
export type MultiQuestion = QuestionBase & {
  question_type: 'multi';
  options: { id: string; text: string }[];
  correct_answer: { ids: string[] };
};

// Order — drag to reorder
export type OrderQuestion = QuestionBase & {
  question_type: 'order';
  options: { id: string; text: string }[];     // shuffled by server
  correct_answer: { ordered_ids: string[] };
};

// Fill-in — short text answer
export type FillQuestion = QuestionBase & {
  question_type: 'fill';
  options: null;
  correct_answer: { accepted: string[] };       // case-insensitive match
};

export type Question = MCQQuestion | MultiQuestion | OrderQuestion | FillQuestion;

// Client-side version: no correct_answer exposed
export type ClientQuestion = Omit<Question, 'correct_answer'>;
```

## Topic

```ts
export type Topic = {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  unlock_requires: string[];
};

export type TopicWithStatus = Topic & {
  locked: boolean;
  completed: boolean;
};
```

## Daily Puzzle (Element Match)

```ts
export type DailyPuzzle = {
  date: string;              // 'YYYY-MM-DD'
  items: string[];           // 9 items, shuffled
  groups: string[][];        // 3x3, server-only
  categories: string[];      // 3 labels, server-only
};

export type ClientDailyPuzzle = {
  date: string;
  items: string[];
  already_completed: boolean;
};

export type PuzzleResult = {
  correct: boolean;
  groups: string[][];
  categories: string[];
  rank_percentile: number;
  share_text: string;
};
```

## Profile

```ts
export type Profile = {
  id: string;
  username: string;
  created_at: string;
  current_streak: number;
  last_active_date: string | null;
  total_xp: number;
};
```

## Leaderboard entry

```ts
export type LeaderboardEntry = {
  username: string;
  total_xp: number;
  current_streak: number;
  rank: number;
  is_current_user: boolean;
};
```

## Client state (Zustand)

```ts
// stores/user.ts
type UserStore = {
  profile: Profile | null;
  hearts: number;            // resets daily, max 5
  setProfile: (p: Profile) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  addXP: (n: number) => void;
};

// stores/lesson.ts
type LessonStore = {
  currentTopicId: string | null;
  questions: ClientQuestion[];
  currentIndex: number;
  startedAt: number;          // timestamp
  answers: Record<string, unknown>;
  startLesson: (topicId: string, questions: ClientQuestion[]) => void;
  answerCurrent: (answer: unknown) => void;
  nextQuestion: () => void;
  reset: () => void;
};
```
