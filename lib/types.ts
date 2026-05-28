export type QuestionBase = {
  id: string;
  topic_id: string;
  question_text: string;
  explanation: string | null;
};

export type MCQQuestion = QuestionBase & {
  question_type: "mcq";
  options: { id: string; text: string }[];
  correct_answer: { id: string };
};

export type MultiQuestion = QuestionBase & {
  question_type: "multi";
  options: { id: string; text: string }[];
  correct_answer: { ids: string[] };
};

export type OrderQuestion = QuestionBase & {
  question_type: "order";
  options: { id: string; text: string }[];
  correct_answer: { ordered_ids: string[] };
};

export type FillQuestion = QuestionBase & {
  question_type: "fill";
  options: null;
  correct_answer: { accepted: string[] };
};

export type Question = MCQQuestion | MultiQuestion | OrderQuestion | FillQuestion;

export type ClientQuestion =
  | Omit<MCQQuestion, "correct_answer">
  | Omit<MultiQuestion, "correct_answer">
  | Omit<OrderQuestion, "correct_answer">
  | Omit<FillQuestion, "correct_answer">;

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

export type DailyPuzzle = {
  date: string;
  items: string[];
  groups: string[][];
  categories: string[];
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

export type Profile = {
  id: string;
  username: string;
  email: string;
  created_at: string;
  current_streak: number;
  last_active_date: string | null;
  total_xp: number;
};

export type LeaderboardEntry = {
  username: string;
  total_xp: number;
  current_streak: number;
  rank: number;
  is_current_user: boolean;
};
