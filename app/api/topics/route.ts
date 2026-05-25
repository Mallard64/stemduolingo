import { NextResponse } from "next/server";
import { TOPICS } from "@/lib/seed/topics";
import { DEMO_USER, completedTopicIds } from "@/lib/store/server-state";

export async function GET() {
  const completed = completedTopicIds(DEMO_USER);
  const topics = TOPICS.map((t) => ({
    ...t,
    completed: completed.has(t.id),
    locked: t.unlock_requires.some((req) => !completed.has(req)),
  }));
  return NextResponse.json({ topics });
}
