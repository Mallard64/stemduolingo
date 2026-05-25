# Scope

The single source of truth for what is in and out. When in doubt, this file wins.

## In scope (build these)

- Landing page
- 3-screen onboarding (welcome → goal → ready)
- Supabase auth: email + Google OAuth
- Skill tree: 5 AP Chem topics, linear unlock
- Lesson player: 5 questions per lesson
- Question types: MCQ, multi-select, drag-to-order, fill-in
- Hearts (lives), XP, streak (single tier, number + flame)
- Lesson completion screen
- Daily Element Match puzzle (globally synchronized by UTC date)
- Shareable result card (copyable emoji text)
- Friend leaderboard (top 30, seeded with fake users)
- Mobile-responsive PWA, installable
- Deployed on Vercel at a real URL

## Out of scope (do not build, do not suggest)

- Any subject other than AP Chem
- More than 5 topics
- 1v1 battles, live multiplayer, sabotage items
- Gems, in-app currency, lootboxes, trading
- Payment, subscriptions, paywalls, ads
- Inter-school cup, school registration, geographic features
- Live AI generation in user-facing flows (cached only)
- Capstones, long-form projects, file uploads
- Multi-tier streak cosmetics (Vanity Fire, Dark Matter Vortex)
- Galaxy/constellation cosmic visual — use a clean skill tree
- Push notifications
- Native app wrappers (Capacitor, Expo)
- Custom backend beyond Supabase
- User-generated content
- Comments, chat, DMs
- Admin dashboard

## Scope dispute resolution

If a teammate proposes something not on the "in" list:

1. Ask: "Is this needed to complete the demo Definition of Done?" (see `workflows/pitch-and-demo.md`)
2. If no, it's out. Add to a `BACKLOG.md` for post-hackathon if it's a good idea.
3. If yes, the scope changes — update this file in the same PR, note the change in the root decision log.

## Common temptations to refuse

- "What if we added Physics too?" — One subject.
- "Let's make streaks fancy like the original PRD." — Number + flame.
- "Real-time multiplayer would be cool." — Cut.
- "Let's switch to React Native." — PWA.
- "AI generates questions live!" — Cached only.
- "Payment flow for completeness." — Out.
- "Just one more topic?" — No.
