export function calculateLessonXP(heartsRemaining: number): number {
  return 50 + heartsRemaining * 10;
}

export function normalizeFill(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}
