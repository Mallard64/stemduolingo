import { NextResponse } from "next/server";
import { learningObjectiveById } from "@/lib/seed/ced";
import { generateQuestion } from "@/lib/questions/generate";

export const runtime = "nodejs";

type Body = { topicId: string; difficulty?: number; excludeIds?: string[] };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!learningObjectiveById(body.topicId)) {
    return NextResponse.json({ error: "unknown topic" }, { status: 404 });
  }

  const result = await generateQuestion({
    topicId: body.topicId,
    difficulty: body.difficulty,
    excludeIds: body.excludeIds,
  });

  // Surface rejected generations in server logs; the user still gets a question.
  if (result.failures.length > 0) {
    console.warn(
      `[generate-question] ${body.topicId}: ${result.failures.length} rejected attempt(s) — ${result.failures.join(" | ")}`
    );
  }

  if (!result.question) {
    return NextResponse.json({ error: "no question available" }, { status: 500 });
  }

  return NextResponse.json({
    question: result.question,
    difficulty: result.difficulty,
    source: result.source,
  });
}
