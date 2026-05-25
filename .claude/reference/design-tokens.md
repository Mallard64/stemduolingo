# Design Tokens

The visual contract. Use these everywhere — do not invent new colors or radii.

## Theme

Panda-inspired: clean white surfaces, bold red accents, dark text. Modern, friendly, not childish.

## Color tokens

Add to `tailwind.config.ts`:

```ts
colors: {
  primary: {
    DEFAULT: '#DC2626',    // red-600, panda red
    dark: '#991B1B',       // red-800, hover/pressed
    light: '#FEE2E2',      // red-100, subtle backgrounds
  },
  bg: '#FFFFFF',           // page background
  surface: '#FAFAFA',      // card/elevated surfaces
  border: '#E5E5E5',       // subtle borders
  ink: {
    DEFAULT: '#18181B',    // primary text
    muted: '#71717A',      // secondary text
    subtle: '#A1A1AA',     // tertiary text
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  streak: '#F97316',       // flame orange
}
```

## Typography

- **Font:** Inter or Geist (whichever loads cleanly). Use `next/font/google`.
- **Display sizes:** `text-4xl` headings, `text-2xl` subheads, `text-base` body, `text-sm` meta.
- **Weight:** `font-semibold` for emphasis, `font-bold` for primary CTAs and big numbers (XP, streak).
- **Line height:** Tailwind defaults (`leading-tight` for headings).

## Spacing & radius

- Border radius: `rounded-xl` (12px) for cards, `rounded-lg` (8px) for inputs, `rounded-full` for badges and avatars.
- Padding: card interiors `p-6`, tight UI `p-4`, list items `p-3`.
- Gap: vertical stacks `gap-4` default, tight `gap-2`, loose `gap-6`.

## Shadows

- Cards: `shadow-sm` default, `shadow-md` on hover/elevated.
- Modals: `shadow-2xl`.
- Avoid heavy shadows — keep the look crisp and flat-ish.

## Mobile-first

- Design at **375px** width first.
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`.
- Touch targets min 44px tall.
- Bottom-nav for mobile, side-nav for desktop.

## Component patterns

- **Primary CTA:** `bg-primary text-white rounded-xl px-6 py-3 font-semibold hover:bg-primary-dark`
- **Secondary CTA:** `bg-white border border-border rounded-xl px-6 py-3 font-medium hover:bg-surface`
- **Card:** `bg-white rounded-xl p-6 shadow-sm border border-border`
- **Badge:** `bg-primary-light text-primary-dark rounded-full px-3 py-1 text-sm font-medium`
- **Streak indicator:** flame emoji 🔥 + number, `text-streak font-bold`

## Microinteractions (cheap but high-impact)

- Lesson question reveal: `animate-in fade-in slide-in-from-bottom-2 duration-200`
- Correct answer: green flash + checkmark, 300ms
- Wrong answer: shake (apply `animate-shake` keyframes), red border
- Lesson complete: confetti or XP count-up animation
- Streak extend: flame scales briefly with `animate-bounce`

Use `tailwindcss-animate` for these.

## Don't

- No gradients except very subtle (e.g., red→red-dark on primary CTAs).
- No emoji-heavy UI (judges read it as unserious). Emojis for streak, share card, completion only.
- No neon or "gamer" aesthetic from the original PRD. Clean and modern, like Duolingo Plus or Notion.
- No purple, blue, or non-red accent colors. Stay on theme.
