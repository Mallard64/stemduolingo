# CLAUDE.md — OmniSTEM (root context)

This is the always-on context. It is intentionally short. Detailed context lives in `.claude/` and is loaded on demand based on the task.

## What we're building (one line)

A gamified AP Chemistry web app — Duolingo-style lesson loop + Wordle-style daily puzzle, shipped as a PWA in 7 days by a 4-person team.

## How to use this file

1. Always read this file first.
2. Identify the task type from **Task Router** below.
3. Read the linked context files **only for your task**. Do not load everything.
4. If your task spans multiple lanes, read the relevant lane files for each.

Loading the wrong context is worse than loading no context — it dilutes attention. Be surgical.

## Task Router

| If you're working on... | Read these files |
|---|---|
| Auth, onboarding, landing, app shell, skill tree UI | `.claude/lanes/01-frontend-shell.md` + `.claude/reference/design-tokens.md` |
| Lesson player, question components, XP/hearts/streak | `.claude/lanes/02-lesson-engine.md` + `.claude/reference/data-shapes.md` |
| Element Match game, daily puzzle, share card | `.claude/lanes/03-daily-puzzle.md` + `.claude/reference/data-shapes.md` |
| API routes, Supabase, schema, seed scripts | `.claude/lanes/04-backend.md` + `.claude/reference/schema.md` + `.claude/reference/api-contracts.md` |
| Writing or reviewing chem questions | `.claude/reference/chem-content-rules.md` |
| Designing Element Match puzzles | `.claude/reference/puzzle-design.md` |
| Pitch deck, demo script, video | `.claude/workflows/pitch-and-demo.md` |
| End-of-day code review | `.claude/workflows/daily-review.md` |
| Resolving a scope dispute | `.claude/reference/scope.md` |

## Always-on rules (apply to every task)

1. **Stack is locked:** Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel + Zustand. No substitutions without team sync.
2. **Scope is locked:** AP Chemistry only, 5 topics, 1 lesson each. See `scope.md` for the full in/out list before suggesting anything new.
3. **Schema and API contracts are locked:** see `reference/schema.md` and `reference/api-contracts.md`. Do not invent new shapes.
4. **No new dependencies** without justification in chat.
5. **TypeScript strict.** Server components by default.
6. **Demo > production.** Every tradeoff favors a working, polished demo over long-term code health.
7. **If you're about to generate something that contradicts a referenced file, stop and ask.**

## Day-of-week context

Update this line daily so AI sessions know where we are:

```
CURRENT DAY: [Day 1 of 7 — spec lockdown + scaffolding]
```

## Decision log

Append-only. One line per decision with date and reason.

- `2026-05-25` — Stack: Next.js PWA over Expo/RN — mixed RN experience on team, AI tooling stronger for Next.js.
- `2026-05-25` — Subject: AP Chem (not CSA/Algebra) — team preference.
- `2026-05-25` — Tier-2 feature: Element Match (not Formula Climb) — pairs with chem subject.
- `2026-05-25` — Question content: cached only, no live AI in user flows — demo reliability.
