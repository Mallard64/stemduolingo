import { NextResponse } from "next/server";
import { learningObjectiveById } from "@/lib/seed/ced";
import { fallbackQuestionForTopic } from "@/lib/seed/questions";
import type { MCQQuestion } from "@/lib/types";

export const runtime = "nodejs";

type Body = { topicId: string; difficulty?: number; excludeIds?: string[] };

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 12_000;

function clampDifficulty(d: unknown): number {
  const n = typeof d === "number" && Number.isFinite(d) ? d : 5;
  return Math.min(10, Math.max(1, Math.round(n)));
}

function difficultyGuidance(d: number): string {
  if (d <= 3) return "A direct recall fact or a single trivial step.";
  if (d <= 6) return "One quick conceptual step, or arithmetic with small, round numbers.";
  return "A slightly more subtle concept or a two-idea question — but still solvable in your head; never require a calculator or messy arithmetic.";
}

function buildPrompts(
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

function asTrimmedString(v: unknown): string {
  if (typeof v === "string") return v.trim();
  // tolerate { text: "..." }
  if (v && typeof v === "object" && typeof (v as Record<string, unknown>).text === "string") {
    return ((v as Record<string, unknown>).text as string).trim();
  }
  return "";
}

// The model supplies the correct answer and distractors as plain strings; we build
// and shuffle the four options here so the labeled correct option always matches
// the model's stated answer (it can't mislabel an index).
function parseMCQ(raw: unknown, topicId: string): MCQQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const questionText = asTrimmedString(obj.question_text);
  const correct = asTrimmedString(obj.correct_answer);
  if (!questionText || !correct) return null;

  if (!Array.isArray(obj.distractors)) return null;
  const seen = new Set<string>([correct.toLowerCase()]);
  const uniqueDistractors: string[] = [];
  for (const d of obj.distractors) {
    const text = asTrimmedString(d);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueDistractors.push(text);
  }
  if (uniqueDistractors.length < 3) return null;

  const ids = ["a", "b", "c", "d"];
  const texts = shuffle([correct, uniqueDistractors[0], uniqueDistractors[1], uniqueDistractors[2]]);
  const options = texts.map((text, i) => ({ id: ids[i], text }));
  const correctId = options.find((o) => o.text === correct)!.id;

  return {
    id: `ai-${topicId}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    topic_id: topicId,
    question_type: "mcq",
    question_text: questionText,
    options,
    correct_answer: { id: correctId },
    explanation: asTrimmedString(obj.explanation) || null,
  };
}

async function generateWithOpenAI(
  apiKey: string,
  topicLabel: string,
  objective: string,
  essentialKnowledge: string[],
  difficulty: number,
  topicId: string
): Promise<MCQQuestion | null> {
  const { system, user } = buildPrompts(topicLabel, objective, essentialKnowledge, difficulty);
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
    if (!res.ok) return null;
    const data = await res.json();
    const content: unknown = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return null;
    return parseMCQ(JSON.parse(content), topicId);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const lo = learningObjectiveById(body.topicId);
  if (!lo) {
    return NextResponse.json({ error: "unknown topic" }, { status: 404 });
  }

  const difficulty = clampDifficulty(body.difficulty);
  const excludeIds = Array.isArray(body.excludeIds) ? body.excludeIds : [];
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    const aiQuestion = await generateWithOpenAI(
      apiKey,
      `${lo.code} ${lo.topic} (Unit ${lo.unit}: ${lo.unitTitle})`,
      lo.objective,
      lo.essential_knowledge,
      difficulty,
      body.topicId
    );
    if (aiQuestion) {
      return NextResponse.json({ question: aiQuestion, difficulty, source: "ai" });
    }
  }

  // Fallback: serve a seeded question so the lesson never breaks.
  const fallback = fallbackQuestionForTopic(body.topicId, excludeIds);
  if (!fallback) {
    return NextResponse.json({ error: "no question available" }, { status: 500 });
  }
  return NextResponse.json({ question: fallback, difficulty, source: "fallback" });
}
