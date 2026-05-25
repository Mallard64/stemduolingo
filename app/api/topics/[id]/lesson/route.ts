import { NextResponse } from "next/server";
import { questionsForTopic } from "@/lib/seed/questions";
import type { ClientQuestion } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const full = questionsForTopic(params.id, 5);
  if (full.length === 0) {
    return NextResponse.json({ error: "topic not found" }, { status: 404 });
  }

  // Strip correct_answer for prototype demo, the lesson player checks client-side
  // using a separate /api/lessons/check endpoint pattern would be cleaner; for hackathon
  // we ship the answers (documented shortcut in lane 02).
  const questions: (ClientQuestion & { correct_answer: unknown })[] = full.map((q) => ({
    ...q,
  }));

  return NextResponse.json({ topic_id: params.id, questions });
}
