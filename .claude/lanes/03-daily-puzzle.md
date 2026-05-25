# Lane 03 — Daily Puzzle (Element Match)

**Owner:** Person 3

You own the daily Element Match game, share card generation, and puzzle content authoring.

## Files in your lane

```
app/(app)/daily/page.tsx                   (puzzle UI)
app/(app)/daily/result/page.tsx            (result + share)

components/element-match/
  puzzle-board.tsx                         (9-item grid)
  item-tile.tsx                            (individual draggable/selectable)
  group-zone.tsx                           (where items land)
  timer.tsx
  mistakes-tracker.tsx                     (Wordle-style row dots)
  share-card.tsx                           (copyable result)

lib/
  element-match/
    seed.ts                                (date → puzzle index)
    scoring.ts                             (time + mistakes → rank)
    share-format.ts                        (puzzle result → emoji text)

scripts/
  seed-puzzles.ts                          (generates ~14 days of puzzles)
```

## Required reading

- `.claude/reference/puzzle-design.md` — puzzle authoring rules
- `.claude/reference/data-shapes.md` — DailyPuzzle types
- `.claude/reference/api-contracts.md` — `/api/daily-puzzle` endpoints
- `.claude/reference/design-tokens.md`

## Game UX

```
[Timer: 0:45 ⏱]  [Mistakes: ⚪⚪⚪⚪]

┌─────────────────────────────┐
│  [item] [item] [item]       │
│  [item] [item] [item]       │
│  [item] [item] [item]       │
└─────────────────────────────┘

  [Submit Group of 3]
```

Player selects 3 items, taps Submit. If correct, group locks in and disappears (or moves to a "solved" row). If wrong, mistake counter ticks up.

4 mistakes = game over. Otherwise solve all 3 groups to win.

## Interaction model

**Recommended:** Tap-to-select. Player taps 3 items, they highlight, "Submit" enables. Tap again to deselect.

**Avoid:** Drag-and-drop. It's nicer on desktop but messy on mobile, and you don't have time to perfect it.

## Puzzle delivery

Player loads `/daily` → `GET /api/daily-puzzle` → receives 9 items, no groups/categories.

On submit, `POST /api/daily-puzzle/submit` with their groupings array. Server validates and returns groups + categories + rank.

## Share card

After solve, generate a copyable text block. Match the Wordle/Connections aesthetic.

```
OmniSTEM Element Match #042 ⚗️
🟢🟢🟡🟢 → 0:38
Streak: 🔥 7
omnistem.app
```

Where:
- 🟢 = group solved without mistake
- 🟡 = group solved with 1 mistake
- 🟠 = group solved with 2+ mistakes
- 🔴 = game over (didn't solve)

"Copy" button → `navigator.clipboard.writeText(...)`. Toast confirmation.

## Demo-day puzzle

Make sure day-of-demo puzzle is **the good one** you picked. Don't let the date roll to a bad puzzle accidentally. Have the seed table set up so demo day = your hand-picked best puzzle.

## Puzzle content authoring (do this Day 1-2)

1. Run `scripts/seed-puzzles.ts` to generate 20 candidates via Claude API.
2. Manually review each puzzle against `puzzle-design.md` checklist.
3. Pick the 14 best. Commit to `scripts/seed-puzzles.ts` as a static array.
4. Insert into Supabase `daily_puzzles` table on a 14-day schedule starting today.

## Don't touch

- Lesson player (Person 2)
- Skill tree (Person 1)
- Auth, schema (Person 4)
- API route internals (Person 4 — but you can suggest contract tweaks)

## Note on real-time leaderboard for the puzzle

Tempting to add live "X people solved it today" — **don't**. Out of scope. Static rank percentile based on completion time is enough.
