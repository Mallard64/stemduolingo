# Chemistry Content Rules

Read this before generating, writing, or reviewing any chemistry question. Wrong chem on stage = dead demo.

## Hard rules

1. **Every AI-generated question must be human-reviewed** before being committed to the question bank. No exceptions.
2. **No "trick" questions** that rely on rare exceptions (e.g., chromium electron config) — judges may not know AP Chem deeply but they will google answers. Stick to mainstream content.
3. **Numerical answers must be checkable** — show the work in the `explanation` field.
4. **Units required** for any quantitative answer. "0.5" is wrong, "0.5 mol" is right.
5. **No ambiguous wording.** If two interpretations are possible, rewrite.

## Topic scope (do not stray outside)

### 1. atomic-structure
- Subatomic particles (protons, neutrons, electrons)
- Isotopes, mass number, atomic number
- Electron configuration (Aufbau, Hund's rule, Pauli) for elements up to Z=36 (krypton)
- Orbital diagrams (s, p, d)
- Effective nuclear charge — conceptual only

### 2. periodic-trends
- Atomic radius, ionic radius
- Ionization energy (first IE only — skip successive)
- Electronegativity
- Metallic character
- Trends across periods and down groups

### 3. ionic-covalent
- Ionic vs covalent bond identification by electronegativity difference
- Lewis structures for simple molecules (≤4 heavy atoms)
- Formal charge (simple cases)
- Polar vs nonpolar covalent
- Properties of ionic vs covalent compounds

### 4. vsepr
- Electron and molecular geometry up to 4 electron domains
- Linear, trigonal planar, bent, tetrahedral, trigonal pyramidal
- Bond angles (180°, 120°, 109.5°, ~107°, ~104.5°)
- Polarity of molecules based on shape

### 5. stoichiometry
- Balancing equations (simple, no redox half-reactions)
- Mole-to-mole conversions
- Mass-to-mole, mole-to-mass
- Limiting reactant (basic — give clear numbers)
- Percent yield (basic)

## Difficulty calibration

- **Easy (1):** Direct recall or one-step calculation. ~40% of bank.
- **Medium (2):** Two-step reasoning or applying a concept to a new example. ~50% of bank.
- **Hard (3):** Multi-step problems, edge cases within the topic scope. ~10%.

Hackathon demo lessons should be Easy + Medium. Save Hard for "depth" demonstration.

## Question writing checklist

For each question, verify:

- [ ] Question is unambiguous (one correct interpretation)
- [ ] Correct answer is verifiably correct via a textbook or AP source
- [ ] Distractors are plausible but clearly wrong on inspection
- [ ] Explanation walks through the reasoning, not just states the answer
- [ ] Vocabulary matches AP CED terminology
- [ ] No questions requiring a calculator beyond basic arithmetic
- [ ] No questions that depend on memorizing specific values (e.g., "what is the IE of sodium in kJ/mol")

## Distractor design

Good distractors come from common student errors:

- For electron config: skipping 4s before 3d, miscounting electrons
- For VSEPR: confusing electron geometry vs molecular geometry
- For stoichiometry: forgetting to balance, wrong mole ratio direction
- For periodic trends: reversing the trend direction

## Forbidden topic territory

These are real AP Chem topics but **out of scope** for this MVP:

- Equilibrium, Ksp, Ka/Kb, pH calculations
- Thermodynamics, Gibbs free energy, entropy
- Kinetics, rate laws, integrated rate equations
- Electrochemistry, redox half-reactions
- Organic chemistry, functional groups
- Nuclear chemistry, half-life

If you're tempted to generate a question on these, don't. Out of scope.

## Generation prompt template

When using Claude/GPT to generate questions, use this template:

```
You are writing AP Chemistry questions for an educational app. Generate {N} questions on the topic of {TOPIC_NAME}, scoped to: {TOPIC_SCOPE_FROM_ABOVE}.

Output format: JSON array. Each question:
{
  "question_text": "...",
  "question_type": "mcq" | "multi" | "order" | "fill",
  "options": [...],  // see schema
  "correct_answer": {...},
  "explanation": "...",  // 1-2 sentence reasoning
  "difficulty": 1 | 2 | 3
}

Constraints:
- All quantitative answers include units.
- Distractors must be plausible mistakes, not random.
- No exception cases (e.g., Cr/Cu electron configs).
- No topics outside the listed scope.
- Mix of difficulties: 40% diff 1, 50% diff 2, 10% diff 3.

Topic: {TOPIC_NAME}
Scope: {SCOPED_DESCRIPTION}
```

After generation, **review every question**. Reject any that violate the checklist above.
