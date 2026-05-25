# Workflow — Daily Code Review

Run this every evening, ~30 minutes. Rotate who leads it. The goal is catching structural rot before it ossifies, not gatekeeping.

## Before the review

- Pull `main` locally
- Run the app — does it still boot?
- Check Vercel deploys — any red?

## Review checklist

For each lane's day's commits:

### Contract drift
- [ ] Does API response shape still match `reference/api-contracts.md`?
- [ ] Does database access match `reference/schema.md`?
- [ ] Are types in `lib/types.ts` still the source of truth?

### Scope drift
- [ ] Any new features built that aren't in `reference/scope.md`?
- [ ] Any new dependencies added without team discussion?
- [ ] Any AI-generated "extras" left in (often disguised as utility files)?

### Technical health
- [ ] TypeScript builds without errors (`npm run build` or `tsc --noEmit`)
- [ ] No `any` types added without comment
- [ ] No commented-out code blocks left lying around
- [ ] No `console.log` debugging statements in production paths

### Demo readiness
- [ ] Happy path still works end-to-end
- [ ] No new console errors during normal flow
- [ ] Loading and empty states still render

## Output

A 5-line standup-style note in team chat:

```
EOD Review — Day {N}
✅ Working: {what got done}
⚠️ Risks: {what's flaky or behind}
🚫 Cut: {AI extras removed}
🔧 Tomorrow blockers: {what needs unblocking}
```

## When to escalate

- Day 3+ and lessons don't render end-to-end → backend or frontend behind, rebalance work
- Day 4+ and integration test (signup → lesson → puzzle) doesn't work → freeze new features, fix only
- Day 5+ and anyone is still adding features not in scope → hard stop, code freeze on new work

## Anti-patterns to watch for

- "I refactored X" — refactors mid-hackathon waste time and risk regressions. Discourage.
- "AI generated a cool thing" — if it's not in scope, remove it.
- "I added [library] because it was easier" — challenge every new dep.
- "I changed the schema slightly" — schema changes need team sync.
