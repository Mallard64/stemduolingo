import { NextResponse } from "next/server";
import { TOPICS } from "@/lib/seed/topics";

// Completion/lock status is computed client-side from localStorage progress.
export async function GET() {
  return NextResponse.json({ topics: TOPICS });
}
