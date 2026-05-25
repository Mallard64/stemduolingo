# Lane 02 — Lesson Engine

**Owner:** Person 2

You own the core learning loop: lesson player, all question components, hearts/XP/streak client logic, lesson completion screen.

## Files in your lane

```
app/(app)/learn/[topicId]/page.tsx        (lesson player)
app/(app)/learn/[topicId]/complete/page.tsx (completion screen)

components/questions/
  mcq.tsx
  multi.tsx
  order.tsx
  fill.tsx
  question-shell.tsx                       (wrapper, progress bar, hearts)
  answer-feedback.tsx                      (correct/wrong visual)

components/lesson/
  lesson-progress.tsx
  hearts-counter.tsx
  xp-celebration.tsx

stores/
  user.ts                                  (Zustand, hearts/XP)
  lesson.ts                                (Zustand, lesson state)

lib/
  scoring.ts                               (XP math, streak math)
```

## Required reading

- `.claude/reference/data-shapes.md` — Question type discriminated union
- `.claude/reference/api-contracts.md` — `/api/topics/[id]/lesson` and `/api/lessons/complete`
- `.claude/reference/design-tokens.md` — animations, colors

## Lesson flow

```
Load → /api/topics/[id]/lesson
  ↓
Q1 → answer → check → feedback (300ms) → next
  ↓
Q2 → answer → check → feedback → next
  ↓ (repeat for 5 questions)
  ↓
Lesson complete → /api/lessons/complete (POST)
  ↓
Completion screen: XP earned, hearts remaining, streak updated
  ↓
"Continue" → back to skill tree
```

## Hearts mechanic

- User starts with 5 hearts
- Wrong answer: -1 heart
- 0 hearts: lesson fails, go back to skill tree (no XP)
- Hearts refill: daily reset OR on lesson completion bonus
- Display hearts in lesson header: `❤❤❤❤❤`

## XP formula

In `lib/scoring.ts`:

```ts
export function calculateLessonXP(heartsRemaining: number): number {
  return 50 + (heartsRemaining * 10);  // 50 base, +10 per remaining heart, max 100
}
```

## Question components

Each question type is its own component with a consistent prop shape:

```tsx
type QuestionProps<T extends Question> = {
  question: ClientQuestion;  // no correct_answer
  onAnswer: (answer: unknown) => void;
  disabled: boolean;
};
```

Submit answer to a server-side check OR (for demo speed) include `correct_answer` in the lesson fetch and check client-side. **For hackathon, client-side check is fine** — judges won't be cheating. Mark this as a known shortcut.

## Feedback animations

- **Correct:** green border flash, checkmark icon, 300ms hold, auto-advance
- **Wrong:** red shake, X icon, show explanation, "Continue" button to advance
- Use `tailwindcss-animate` utilities

## Completion screen

Must include:
- Big "Lesson complete!" with check icon
- XP earned (animated count-up from 0)
- Streak status (with flame animation if extended)
- Total XP (new total)
- "Continue" CTA

This is the dopamine moment. Make it feel good. ~3-4 second animation budget.

## Streak logic (client side)

Show optimistic update immediately. Server confirms via API response. If they conflict, server wins.

Streak rules:
- Increments when user completes any lesson today and hadn't yet today
- Resets to 0 if user misses a calendar day
- Display: `🔥 7` in nav and on completion screen

## Don't touch

- Skill tree UI (Person 1)
- Question content (Person 4 seeds the bank)
- Element Match (Person 3)
- API route implementations (Person 4)

You consume the API contracts — Person 4 implements them. If a contract change is needed, sync first.
