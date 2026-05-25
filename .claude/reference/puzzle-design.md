# Element Match Puzzle Design

Designing 9 items that group into exactly 3 unambiguous categories is genuinely hard. Bad puzzles kill the demo. This file is the canonical guide.

## The format

- **9 items** total
- **3 groups of exactly 3 items**
- **3 category labels** (revealed only after solve)
- One puzzle per UTC date, same globally

## Difficulty principle

The category itself is part of the puzzle. Players don't see the categories upfront — they figure out the grouping logic. The "aha" moment is realizing what the 3 categories ARE.

## Good puzzle properties

- ✅ Each item belongs to **exactly one** of the 3 categories — no overlap
- ✅ Categories are **conceptually distinct** (different axes of chemistry)
- ✅ At least one item is a "red herring" — looks like it belongs to another group at first glance
- ✅ Solvable from AP Chem unit 1-3 knowledge
- ✅ Solve time for a prepared student: 30-45 seconds

## Bad puzzle properties (avoid)

- ❌ Items that could plausibly fit two groups (ambiguous)
- ❌ Categories that are degrees of the same property (e.g., "low IE / medium IE / high IE" — too fuzzy)
- ❌ Requires obscure trivia (e.g., specific bond enthalpies)
- ❌ Three categories that are just synonyms of each other
- ❌ Categories drawn from outside the MVP topic scope

## Category axis examples (use these)

Each puzzle picks ONE axis. The 3 categories are values along that axis.

**Axis: Bond type**
- Categories: Ionic / Polar covalent / Nonpolar covalent
- Items: 3 ionic compounds, 3 polar covalent molecules, 3 nonpolar covalent molecules

**Axis: Molecular geometry**
- Categories: Linear / Trigonal planar / Tetrahedral
- Items: 3 examples of each geometry

**Axis: Periodic group**
- Categories: Alkali metals / Halogens / Noble gases
- Items: 3 elements from each group

**Axis: Electron configuration ending**
- Categories: Ends in s² / Ends in p⁴ / Ends in d⁵
- Items: 3 elements matching each ending

**Axis: Compound type**
- Categories: Acids / Bases / Salts
- Items: 3 of each

**Axis: Reaction type** (advanced)
- Categories: Synthesis / Decomposition / Single replacement
- Items: 3 balanced equations of each type

## Example puzzle (good)

```yaml
date: 2026-05-26
axis: bond type
items:
  - NaCl       # ionic
  - MgO        # ionic
  - KBr        # ionic
  - H2O        # polar covalent
  - NH3        # polar covalent
  - HCl        # polar covalent
  - O2         # nonpolar covalent
  - N2         # nonpolar covalent
  - CH4        # nonpolar covalent
groups:
  - [NaCl, MgO, KBr]
  - [H2O, NH3, HCl]
  - [O2, N2, CH4]
categories:
  - "Ionic compounds"
  - "Polar covalent molecules"
  - "Nonpolar covalent molecules"
```

Red herring potential: HCl might look ionic to a beginner (it dissociates in water). Good — that's the educational hook.

## Example puzzle (bad — DO NOT USE)

```yaml
items: [Na, K, Li, F, Cl, Br, He, Ne, Ar]
categories: ["Group 1", "Group 17", "Group 18"]
```

Too easy. No red herring. No conceptual insight. Solvable in 5 seconds. Save this difficulty for tutorial only.

## Demo-day puzzle considerations

For the puzzle shown live in the demo:

- Pick one with a clear "aha" — Bond type or VSEPR work well
- Avoid edge cases the judge might second-guess
- Make sure the share-card output is visually clean (no super long compound names)

## Workflow

1. Generate **20 candidate puzzles** using the prompt below
2. Manually review each against the checklist
3. Pick the best **14** (covers 2 weeks of demo)
4. Commit to `scripts/seed-puzzles.ts`

## Generation prompt template

```
Generate {N} Element Match puzzles for an AP Chemistry app.

Format: JSON array of:
{
  "axis": "bond type" | "molecular geometry" | "periodic group" | "electron configuration" | "compound type",
  "items": [...9 items, mixed/shuffled...],
  "groups": [[3 items], [3 items], [3 items]],
  "categories": ["label 1", "label 2", "label 3"]
}

Constraints:
- Exactly 9 items per puzzle, exactly 3 groups of 3
- Each item belongs to exactly ONE group (no ambiguity)
- Items use standard chemistry notation (chemical formulas, element symbols)
- Categories must be drawn from AP Chem Units 1-3 only
- Include at least one "red herring" item per puzzle that beginners might misclassify
- No puzzle should require knowledge outside: atomic structure, periodic trends, ionic/covalent bonding, VSEPR, basic stoichiometry
- Vary the axis across puzzles (don't generate 10 bond-type puzzles)
```

After generation, **human review every puzzle**. Reject any with ambiguous items.
