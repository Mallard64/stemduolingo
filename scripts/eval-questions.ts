/**
 * Offline eval for the AI question generator.
 *
 *   npx tsx scripts/eval-questions.ts            # 3 questions per topic
 *   npx tsx scripts/eval-questions.ts --n 5      # 5 per topic
 *   npx tsx scripts/eval-questions.ts --topics lo-1-1,lo-2-1
 *   npx tsx scripts/eval-questions.ts --json out.json
 *
 * Checks each generated question for:
 *   1. schema validity      — did it pass the zod contract (vs falling back)
 *   2. answer-key integrity — exactly one option is keyed, and the key resolves
 *   3. duplicates           — near-identical stems within a topic
 *   4. topic relevance      — LLM-as-judge: does it assess the CED objective,
 *                             and is the keyed answer actually correct
 *
 * Requires OPENAI_API_KEY. Reads .env.local if present.
 */
import { readFileSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { z } from "zod";
import { LEARNING_OBJECTIVES, learningObjectiveById } from "../lib/seed/ced";
import { generateQuestion } from "../lib/questions/generate";
import type { MCQQuestion } from "../lib/types";

// ---------------------------------------------------------------- env + args

/** Minimal .env.local reader so the script works without extra deps. */
function loadEnvLocal(): void {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local — rely on the ambient environment */
  }
}

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

// ---------------------------------------------------------------- the judge

const JudgeSchema = z.object({
  assesses_objective: z.boolean(),
  answer_is_correct: z.boolean(),
  exactly_one_correct: z.boolean(),
  note: z.string().default(""),
});
type Judgement = z.infer<typeof JudgeSchema>;

const JUDGE_MODEL = "gpt-4o";

/**
 * LLM-as-judge. Deliberately a separate call from generation, at temperature 0,
 * and told the keyed answer only after seeing the question — so it grades the
 * key rather than rationalising it.
 */
async function judge(
  apiKey: string,
  q: MCQQuestion,
  objective: string,
  topicLabel: string
): Promise<Judgement | null> {
  const keyed = q.options.find((o) => o.id === q.correct_answer.id);
  const body = {
    model: JUDGE_MODEL,
    temperature: 0,
    response_format: { type: "json_object" as const },
    messages: [
      {
        role: "system" as const,
        content:
          "You are a strict AP Chemistry exam reviewer. Grade the question you are given. " +
          "Solve it yourself before judging the provided answer key. Respond with ONLY a JSON object.",
      },
      {
        role: "user" as const,
        content: [
          `CED topic: ${topicLabel}`,
          `Learning objective: ${objective}`,
          ``,
          `Question: ${q.question_text}`,
          `Options:`,
          ...q.options.map((o) => `  ${o.id}) ${o.text}`),
          `Answer key says: ${keyed?.id}) ${keyed?.text}`,
          ``,
          `Return JSON:`,
          `{`,
          `  "assesses_objective": true if the question genuinely tests the learning objective above,`,
          `  "answer_is_correct": true if the answer key matches the answer you worked out,`,
          `  "exactly_one_correct": true if exactly one option is defensibly correct,`,
          `  "note": "short reason if any field is false, else empty string"`,
          `}`,
        ].join("\n"),
      },
    ],
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return null;
    const parsed = JudgeSchema.safeParse(JSON.parse(content));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- local checks

/** Structural check that the answer key points at exactly one real option. */
function answerKeyIsSound(q: MCQQuestion): boolean {
  const matches = q.options.filter((o) => o.id === q.correct_answer.id);
  return matches.length === 1 && matches[0].text.trim().length > 0 && q.options.length === 4;
}

function normaliseStem(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// ---------------------------------------------------------------- reporting

type Row = {
  topic: string;
  requested: number;
  generated: number;
  schemaOk: number;
  keyOk: number;
  unique: number;
  relevant: number;
  answerOk: number;
  judged: number;
  retries: number;
};

function pct(n: number, d: number): string {
  return d === 0 ? "  n/a" : `${Math.round((n / d) * 100).toString().padStart(3)}%`;
}

function renderTable(rows: Row[]): string {
  const head = ["topic", "n", "schema", "key", "uniq", "relevant", "answer"];
  const widths = [10, 3, 6, 6, 6, 8, 6];
  const line = (cells: string[]) =>
    "| " + cells.map((c, i) => c.padEnd(widths[i])).join(" | ") + " |";
  const sep = "|" + widths.map((w) => "-".repeat(w + 2)).join("|") + "|";

  const out = [line(head), sep];
  for (const r of rows) {
    out.push(
      line([
        r.topic,
        String(r.generated),
        pct(r.schemaOk, r.generated),
        pct(r.keyOk, r.generated),
        pct(r.unique, r.generated),
        pct(r.relevant, r.judged),
        pct(r.answerOk, r.judged),
      ])
    );
  }

  const tot = rows.reduce(
    (a, r) => ({
      generated: a.generated + r.generated,
      schemaOk: a.schemaOk + r.schemaOk,
      keyOk: a.keyOk + r.keyOk,
      unique: a.unique + r.unique,
      relevant: a.relevant + r.relevant,
      answerOk: a.answerOk + r.answerOk,
      judged: a.judged + r.judged,
    }),
    { generated: 0, schemaOk: 0, keyOk: 0, unique: 0, relevant: 0, answerOk: 0, judged: 0 }
  );

  out.push(sep);
  out.push(
    line([
      "TOTAL",
      String(tot.generated),
      pct(tot.schemaOk, tot.generated),
      pct(tot.keyOk, tot.generated),
      pct(tot.unique, tot.generated),
      pct(tot.relevant, tot.judged),
      pct(tot.answerOk, tot.judged),
    ])
  );
  return out.join("\n");
}

// ---------------------------------------------------------------- main

async function main() {
  loadEnvLocal();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set. Add it to .env.local or the environment.");
    process.exit(2);
  }

  const n = Number(arg("--n") ?? 3);
  if (!Number.isFinite(n) || n < 1) {
    console.error("--n must be a positive integer");
    process.exit(2);
  }

  const topicIds = (arg("--topics")?.split(",").map((s) => s.trim()).filter(Boolean)) ??
    LEARNING_OBJECTIVES.map((lo) => lo.id);

  console.log(`Evaluating ${n} question(s) each across ${topicIds.length} topic(s)...\n`);

  const rows: Row[] = [];
  const problems: string[] = [];

  for (const topicId of topicIds) {
    const lo = learningObjectiveById(topicId);
    if (!lo) {
      console.error(`  skipping unknown topic ${topicId}`);
      continue;
    }
    const topicLabel = `${lo.code} ${lo.topic} (Unit ${lo.unit}: ${lo.unitTitle})`;

    const row: Row = {
      topic: topicId, requested: n, generated: 0, schemaOk: 0,
      keyOk: 0, unique: 0, relevant: 0, answerOk: 0, judged: 0, retries: 0,
    };
    const stems: string[] = [];

    for (let i = 0; i < n; i++) {
      const result = await generateQuestion({ topicId, apiKey, maxAttempts: 3 });
      row.retries += Math.max(0, result.attempts - 1);

      if (!result.question) {
        problems.push(`${topicId}: no question produced (${result.failures.join("; ")})`);
        continue;
      }
      row.generated += 1;

      // A question served from the seed bank means every model attempt failed
      // the schema — that is the signal this check exists to surface.
      if (result.source === "ai") row.schemaOk += 1;
      else problems.push(`${topicId}: fell back to seed bank (${result.failures.join("; ")})`);

      const q = result.question as MCQQuestion;
      if (answerKeyIsSound(q)) row.keyOk += 1;
      else problems.push(`${topicId}: answer key does not resolve to exactly one option`);

      const stem = normaliseStem(q.question_text);
      if (!stems.includes(stem)) row.unique += 1;
      else problems.push(`${topicId}: duplicate stem — "${q.question_text.slice(0, 60)}..."`);
      stems.push(stem);

      const verdict = await judge(apiKey, q, lo.objective, topicLabel);
      if (verdict) {
        row.judged += 1;
        if (verdict.assesses_objective) row.relevant += 1;
        else problems.push(`${topicId}: off-objective — ${verdict.note}`);
        if (verdict.answer_is_correct && verdict.exactly_one_correct) row.answerOk += 1;
        else problems.push(`${topicId}: judge disputes answer key — ${verdict.note}`);
      }

      process.stdout.write(".");
    }

    rows.push(row);
    process.stdout.write(` ${topicId}\n`);
  }

  console.log("\n" + renderTable(rows) + "\n");
  console.log(`Retries spent on invalid model output: ${rows.reduce((a, r) => a + r.retries, 0)}`);

  if (problems.length > 0) {
    console.log(`\n${problems.length} issue(s):`);
    for (const p of problems.slice(0, 25)) console.log(`  - ${p}`);
    if (problems.length > 25) console.log(`  ... and ${problems.length - 25} more`);
  } else {
    console.log("\nNo issues found.");
  }

  const jsonPath = arg("--json");
  if (jsonPath) {
    writeFileSync(jsonPath, JSON.stringify({ model: JUDGE_MODEL, n, rows, problems }, null, 2));
    console.log(`\nWrote ${jsonPath}`);
  }

  // Non-zero exit when the generator is clearly unhealthy, so CI can gate on it.
  const totalGen = rows.reduce((a, r) => a + r.generated, 0);
  const totalKeyOk = rows.reduce((a, r) => a + r.keyOk, 0);
  process.exit(totalGen > 0 && totalKeyOk === totalGen ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
