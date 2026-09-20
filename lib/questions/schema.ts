import { z } from "zod";

// The model is told to return plain strings, but it occasionally wraps a value
// as { text: "..." }. Unwrap that shape before validating so one stray format
// choice doesn't cost a retry.
const looseString = z.preprocess((v) => {
  if (typeof v === "string") return v.trim();
  if (v && typeof v === "object" && typeof (v as { text?: unknown }).text === "string") {
    return ((v as { text: string }).text).trim();
  }
  return v;
}, z.string().min(1));

/**
 * Shape we require back from the question generator. Anything that fails this
 * is discarded and retried — an invalid question is worse than a seeded one.
 */
export const GeneratedQuestionSchema = z
  .object({
    question_text: looseString.refine((s) => s.length >= 10, {
      message: "question_text is too short to be a real question",
    }),
    // Chain-of-thought the model works out before committing to an answer.
    // Not shown to the user; optional so a terse response still validates.
    reasoning: looseString.optional(),
    correct_answer: looseString,
    distractors: z.array(looseString).min(3),
    explanation: looseString.optional(),
  })
  .superRefine((val, ctx) => {
    // The four options must be mutually distinct, or the question has either
    // two correct answers or a duplicate choice.
    const seen = new Set<string>();
    for (const option of [val.correct_answer, ...val.distractors]) {
      const key = option.toLowerCase();
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["distractors"],
          message: `duplicate option: "${option}"`,
        });
        return;
      }
      seen.add(key);
    }

    // Letter-labelled choices inside the stem mean the model ignored the
    // instruction to keep options separate; the app renders them itself.
    if (/\n\s*[A-D][).]\s/.test(val.question_text)) {
      ctx.addIssue({
        code: "custom",
        path: ["question_text"],
        message: "question_text embeds its own lettered answer choices",
      });
    }
  });

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
