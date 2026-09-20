import { learningObjectiveById } from "@/lib/seed/ced";
import { fallbackQuestionForTopic } from "@/lib/seed/questions";
import { GeneratedQuestionSchema, type GeneratedQuestion } from "@/lib/questions/schema";
import type { MCQQuestion } from "@/lib/types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 12_000;
const DEFAULT_ATTEMPTS = 3;

export type QuestionSource = "ai" | "fallback";

export type GenerateResult = {
  question: MCQQuestion | null;
  source: QuestionSource;
  difficulty: number;
  /** How many model calls were made (0 when no API key is configured). */
  attempts: number;
  /** One entry per rejected attempt, for logging and the eval harness. */
  failures: string[];
};

export function clampDifficulty(d: unknown): number {
  const n = typeof d === "number" && Number.isFinite(d) ? d : 5;
  return Math.min(10, Math.max(1, Math.round(n)));
}

function difficultyGuidance(d: number): string {
  if (d <= 3) return "A direct recall fact or a single trivial step.";
  if (d <= 6) return "One quick conceptual step, or arithmetic with small, round numbers.";
  return "A slightly more subtle concept or a two-idea question — but still solvable in your head; never require a calculator or messy arithmetic.";
}

export function buildPrompts(
  topicLabel: string,
  objective: string,
  essentialKnowledge: string[],
  difficulty: number
): { system: string; user: string } {
  const system =
    "You are an expert AP Chemistry teacher writing a single multiple-choice question for a study app. " +
    "Stay strictly within mainstream AP Chemistry content aligned to the College Board CED. " +
    "Avoid trick questions, obscure exceptions, and ambiguous comparisons — exactly one option must be unambiguously correct. " +
    "CRITICAL: the question must be solvable mentally in a few seconds with NO calculator — use small, clean, round numbers and at most one easy arithmetic step. " +
    "Work out the answer yourself first, then make sure the value you put in 'correct_answer' is exactly the result of that work. " +
    "Every quantitative answer must include units. Respond with ONLY a JSON object.";

  const user = [
    `CED topic: ${topicLabel}`,
    `Learning objective (write a question that assesses ONLY this objective):`,
    `- ${objective}`,
    `Essential knowledge for this objective:`,
    ...essentialKnowledge.map((o) => `- ${o}`),
    ``,
    `Difficulty: ${difficulty} out of 10. ${difficultyGuidance(difficulty)}`,
    `Keep it easy enough to do in your head on the go.`,
    ``,
    `Put ONLY the question itself in "question_text" — do NOT list the answer choices or use letter labels (A, B, C, D) inside it. The four options are shown separately by the app.`,
    ``,
    `Return a JSON object with EXACTLY these fields:`,
    `{`,
    `  "question_text": "string",`,
    `  "reasoning": "briefly work out the answer step by step",`,
    `  "correct_answer": "the single correct answer as a short string (include units if numeric)",`,
    `  "distractors": ["wrong answer 1", "wrong answer 2", "wrong answer 3"],`,
    `  "explanation": "one or two sentences explaining why the correct answer is right"`,
    `}`,
    `The three distractors must be plausible common mistakes, each different from the correct answer and from each other, and in the same format/units as the correct answer.`,
    `Do not include any text outside the JSON object.`,
  ].join("\n");

  return { system, user };
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The model supplies the correct answer and distractors as plain strings; we build
// and shuffle the four options here so the labeled correct option always matches
// the model's stated answer (it can't mislabel an index).
export function toMCQQuestion(parsed: GeneratedQuestion, topicId: string): MCQQuestion {
  const ids = ["a", "b", "c", "d"];
  const texts = shuffle([parsed.correct_answer, ...parsed.distractors.slice(0, 3)]);
  const options = texts.map((text, i) => ({ id: ids[i], text }));
  const correctId = options.find((o) => o.text === parsed.correct_answer)!.id;

  return {
    id: `ai-${topicId}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    topic_id: topicId,
    question_type: "mcq",
    question_text: parsed.question_text,
    options,
    correct_answer: { id: correctId },
    explanation: parsed.explanation ?? null,
  };
}

/** One model call. Returns the validated payload, or a reason it was rejected. */
async function attemptOnce(
  apiKey: string,
  system: string,
  user: string
): Promise<{ ok: true; value: GeneratedQuestion } | { ok: false; reason: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) return { ok: false, reason: `http ${res.status}` };

    const data = await res.json();
    const content: unknown = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return { ok: false, reason: "no message content" };

    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      return { ok: false, reason: "content was not valid JSON" };
    }

    const parsed = GeneratedQuestionSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("; ");
      return { ok: false, reason: `schema: ${detail}` };
    }
    return { ok: true, value: parsed.data };
  } catch (err) {
    const reason = err instanceof Error && err.name === "AbortError" ? "timeout" : "network error";
    return { ok: false, reason };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generate one MCQ for a topic. Retries when the model returns output that
 * fails the schema, then falls back to the seeded bank so a lesson never
 * breaks on a bad generation.
 */
export async function generateQuestion(opts: {
  topicId: string;
  difficulty?: number;
  excludeIds?: string[];
  apiKey?: string;
  maxAttempts?: number;
}): Promise<GenerateResult> {
  const difficulty = clampDifficulty(opts.difficulty);
  const excludeIds = opts.excludeIds ?? [];
  const maxAttempts = opts.maxAttempts ?? DEFAULT_ATTEMPTS;
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY;
  const failures: string[] = [];

  const lo = learningObjectiveById(opts.topicId);
  if (!lo) return { question: null, source: "fallback", difficulty, attempts: 0, failures };

  if (apiKey) {
    const { system, user } = buildPrompts(
      `${lo.code} ${lo.topic} (Unit ${lo.unit}: ${lo.unitTitle})`,
      lo.objective,
      lo.essential_knowledge,
      difficulty
    );

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await attemptOnce(apiKey, system, user);
      if (result.ok) {
        return {
          question: toMCQQuestion(result.value, opts.topicId),
          source: "ai",
          difficulty,
          attempts: attempt,
          failures,
        };
      }
      failures.push(`attempt ${attempt}: ${result.reason}`);
    }
  }

  return {
    question: fallbackQuestionForTopic(opts.topicId, excludeIds),
    source: "fallback",
    difficulty,
    attempts: failures.length,
    failures,
  };
}
