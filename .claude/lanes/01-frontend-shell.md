# Lane 01 — Frontend Shell

**Owner:** Person 1

You own the app's outer skin: landing, onboarding, app layout, navigation, skill tree UI, theming, PWA setup.

## Files in your lane

```
app/
  layout.tsx                       (root, fonts, theme)
  page.tsx                         (landing)
  (auth)/login/page.tsx
  (auth)/signup/page.tsx
  (onboarding)/welcome/page.tsx
  (onboarding)/pick-goal/page.tsx
  (onboarding)/ready/page.tsx
  (app)/layout.tsx                 (shared nav, auth guard)
  (app)/learn/page.tsx             (skill tree)

components/shared/
  nav.tsx
  bottom-nav.tsx                   (mobile)
  side-nav.tsx                     (desktop)
  streak-badge.tsx
  xp-bar.tsx
  hearts-display.tsx

public/
  manifest.json                    (PWA)
  icon-*.png                       (PWA icons)
```

## Required reading

- `.claude/reference/design-tokens.md` — visual contract
- `.claude/reference/scope.md` — what onboarding does and does NOT collect
- `.claude/reference/api-contracts.md` — `GET /api/topics` shape for skill tree

## Skill tree layout

Linear vertical path, mobile-friendly. Each topic is a circular node. Locked nodes are greyed out.

```
       ┌─────┐
       │  1  │ Atomic Structure ✓ (completed)
       └──┬──┘
          │
       ┌──┴──┐
       │  2  │ Periodic Trends (current)
       └──┬──┘
          │
       ┌──┴──┐
       │  3  │ Ionic & Covalent (locked)
       └─────┘
```

Don't use Duolingo's literal s-curve path — too obvious a clone. Use a clean vertical line or subtle zigzag.

## Onboarding flow

Keep it to 3 screens, no more:

1. **Welcome** — big logo, tagline, "Get started" CTA
2. **Pick goal** — "I'm in: AP Chem / High School Chem / Just exploring" (used only for tone, not curriculum)
3. **Ready** — "You're set. Let's start with [first topic]" → CTA to skill tree

Do NOT add: account preferences, notification opt-in, avatar picker, friend invite. Out of scope.

## PWA requirements

- Add `next-pwa` with default config
- `manifest.json` with name, short_name, icons, theme_color: `#DC2626`, background_color: `#FFFFFF`, display: `standalone`
- Test "Add to Home Screen" works on both iOS Safari and Chrome
- Don't bother with service worker caching strategy beyond defaults — too much complexity for the timeframe

## Auth integration

- Use Supabase client from `lib/supabase/client.ts` (Person 4 sets this up)
- Email/password and Google OAuth buttons on login + signup
- `(app)/layout.tsx` redirects to `/login` if no session
- After signup, redirect to `/welcome` (onboarding)
- After login (returning user), redirect to `/learn`

## Don't touch

- API routes (Person 4)
- Lesson player or question components (Person 2)
- Element Match game (Person 3)
- Database schema (Person 4)

If you need a backend change, ask Person 4.
