# Workflow — Pitch and Demo

Read this when working on the deck, demo script, or video. Owner: Person 4 from Day 5.

## The win condition

Judges remember 3 things from any hackathon pitch: the **hook**, the **demo**, and the **vibe**. Optimize for those.

## 90-second pitch structure

```
0:00 - 0:10  HOOK
  "Duolingo built a $10B company on streaks and gamification — but their
   math product is terrible and they don't touch high school STEM at all."

0:10 - 0:25  PROBLEM
  "Students struggling in AP Chem don't lack content — there's textbooks
   and Khan Academy. They lack a daily habit. They lack the dopamine that
   gets them to open the app every day."

0:25 - 0:50  PRODUCT (live demo here)
  Show: skill tree → lesson → completion → daily puzzle → share card
  Narrate the loop: "AP-aligned content, gamified, with a daily Wordle-
  style puzzle that turns chem into a social ritual."

0:50 - 1:10  WHAT'S NOVEL
  "Three things make this work where others haven't:
   1. AP CED alignment, not generic 'fun math'
   2. The daily puzzle is shareable — it spreads organically
   3. AI generates questions, so we scale content without writing 10,000
      questions by hand."

1:10 - 1:25  TRACTION / VISION
  "Built in a week by 4 people. Live, deployed, installable on your phone
   right now. Next: more subjects, school partnerships, leaderboards by
   class."

1:25 - 1:30  CLOSE
  "OmniSTEM. STEM as a daily ritual. Try it at omnistem.app."
```

Rehearse this **10+ times**. Time it. Cut anything that doesn't earn its seconds.

## Deck structure (5-7 slides max)

1. **Title** — name, tagline, team
2. **Hook** — Duolingo's gap, big bold visual
3. **Product overview** — 3 screenshots (skill tree, lesson, daily puzzle)
4. **Demo** (live or video)
5. **What's novel** — the 3 bullets
6. **Vision / next** — what 6 months looks like
7. **Thanks** — links, QR to demo

Don't make a 20-slide deck. Judges glaze.

## Demo script (memorize)

```
[Open the deployed app on phone, mirrored to screen]

"Let me show you. I'm a high schooler taking AP Chem. I open OmniSTEM."
  → Tap home, show skill tree

"I'm on a 7-day streak. I open my next lesson — periodic trends."
  → Tap topic

"5 questions, AP-aligned, instant feedback."
  → Answer 1-2 questions live

"Done. XP earned, streak extended."
  → Show completion screen

"But here's the magic — every day, there's a global puzzle."
  → Navigate to Daily

"45 seconds, 9 items, find the 3 groups. Same puzzle for everyone today."
  → Solve quickly

"And the result is shareable."
  → Show share card, copy to clipboard

"That's the loop. AP-aligned learning + daily shareable challenge."
```

## Demo failure modes (prepare backups)

1. **Wifi dies** → backup video on phone (record Day 6)
2. **Vercel goes down** → backup video
3. **Account doesn't persist** → use a pre-created demo account
4. **Audio doesn't work** → memorize the script, don't read from cards on stage

## Recording the backup video

End of Day 6. Use QuickTime or Loom. Record on a real phone, screen-mirrored. Include voiceover. 60-90 seconds.

This video is your insurance policy. Don't skip it.

## What to NOT do in the pitch

- Don't explain the tech stack (judges don't care)
- Don't show code on screen
- Don't apologize for what's missing
- Don't say "this is a hackathon project, so..."
- Don't read from the slides
- Don't use jargon (CED, VSEPR, etc.) without immediate plain-English follow
- Don't promise features that aren't built ("we plan to add...")

## Judge Q&A prep

Have answers ready:

- "How is this different from Duolingo?" → Subject specificity + daily competitive layer + AP alignment
- "How do you make money?" → Freemium like Duolingo: subscription removes ads/adds hearts. (Don't pitch this hard, hackathon judges don't care)
- "How accurate are the AI-generated questions?" → Cached + human-reviewed. Live AI is a future feature, not the core.
- "What about more subjects?" → Built for expansion — schema is subject-agnostic, content layer plugs in.
- "Is this on the App Store?" → Installable PWA today, native is the path forward.
