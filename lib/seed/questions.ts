import type { MCQQuestion } from "@/lib/types";

// MCQ-only fallback bank, keyed by learning-target id (see lib/seed/ced.ts).
// Served when live AI generation is unavailable so a lesson never breaks.
// Kept to mainstream, verifiable content focused on the specific objective.
export const FALLBACK_QUESTIONS: MCQQuestion[] = [
  // ────────── 1.1 Moles and Molar Mass
  {
    id: "fb-1-1-a",
    topic_id: "lo-1-1",
    question_type: "mcq",
    question_text: "How many atoms are present in 2.0 mol of helium gas?",
    options: [
      { id: "a", text: "6.0 × 10²³ atoms" },
      { id: "b", text: "1.2 × 10²⁴ atoms" },
      { id: "c", text: "3.0 × 10²³ atoms" },
      { id: "d", text: "2.0 atoms" },
    ],
    correct_answer: { id: "b" },
    explanation: "2.0 mol × 6.022 × 10²³ atoms/mol ≈ 1.2 × 10²⁴ atoms.",
  },
  {
    id: "fb-1-1-b",
    topic_id: "lo-1-1",
    question_type: "mcq",
    question_text: "What is the molar mass of carbon dioxide (CO₂)?",
    options: [
      { id: "a", text: "28 g/mol" },
      { id: "b", text: "32 g/mol" },
      { id: "c", text: "44 g/mol" },
      { id: "d", text: "12 g/mol" },
    ],
    correct_answer: { id: "c" },
    explanation: "12 g/mol (C) + 2 × 16 g/mol (O) = 44 g/mol.",
  },

  // ────────── 1.2 Mass Spectroscopy of Elements
  {
    id: "fb-1-2-a",
    topic_id: "lo-1-2",
    question_type: "mcq",
    question_text:
      "Chlorine has two isotopes: ³⁵Cl (~75%) and ³⁷Cl (~25%). Which value is closest to its average atomic mass?",
    options: [
      { id: "a", text: "35.0 amu" },
      { id: "b", text: "35.5 amu" },
      { id: "c", text: "36.0 amu" },
      { id: "d", text: "37.0 amu" },
    ],
    correct_answer: { id: "b" },
    explanation: "Weighted average: (0.75 × 35) + (0.25 × 37) = 35.5 amu.",
  },
  {
    id: "fb-1-2-b",
    topic_id: "lo-1-2",
    question_type: "mcq",
    question_text: "In the mass spectrum of an element, the height of each peak represents…",
    options: [
      { id: "a", text: "The mass of the isotope" },
      { id: "b", text: "The relative abundance of the isotope" },
      { id: "c", text: "The number of protons" },
      { id: "d", text: "The ionization energy" },
    ],
    correct_answer: { id: "b" },
    explanation: "Peak height (the y-axis) shows the relative abundance of each isotope.",
  },

  // ────────── 1.3 Elemental Composition of Pure Substances
  {
    id: "fb-1-3-a",
    topic_id: "lo-1-3",
    question_type: "mcq",
    question_text:
      "A compound is 40.0% C, 6.7% H, and 53.3% O by mass. What is its empirical formula?",
    options: [
      { id: "a", text: "CHO" },
      { id: "b", text: "CH₂O" },
      { id: "c", text: "C₂H₄O₂" },
      { id: "d", text: "CH₄O" },
    ],
    correct_answer: { id: "b" },
    explanation: "Mole ratio: 40/12 : 6.7/1 : 53.3/16 ≈ 3.33 : 6.7 : 3.33 = 1 : 2 : 1, so CH₂O.",
  },
  {
    id: "fb-1-3-b",
    topic_id: "lo-1-3",
    question_type: "mcq",
    question_text: "What is the empirical formula of glucose, C₆H₁₂O₆?",
    options: [
      { id: "a", text: "CHO" },
      { id: "b", text: "CH₂O" },
      { id: "c", text: "C₂H₄O₂" },
      { id: "d", text: "C₃H₆O₃" },
    ],
    correct_answer: { id: "b" },
    explanation: "Dividing the subscripts 6:12:6 by 6 gives the simplest ratio 1:2:1, or CH₂O.",
  },

  // ────────── 1.4 Composition of Mixtures
  {
    id: "fb-1-4-a",
    topic_id: "lo-1-4",
    question_type: "mcq",
    question_text: "Which of the following is a mixture rather than a pure substance?",
    options: [
      { id: "a", text: "Distilled water" },
      { id: "b", text: "Oxygen gas (O₂)" },
      { id: "c", text: "Air" },
      { id: "d", text: "Table salt (NaCl)" },
    ],
    correct_answer: { id: "c" },
    explanation: "Air is a mixture of gases (N₂, O₂, Ar, …); the others are single pure substances.",
  },
  {
    id: "fb-1-4-b",
    topic_id: "lo-1-4",
    question_type: "mcq",
    question_text: "A solution is made by dissolving 10. g of NaCl in 90. g of water. What is the mass percent of NaCl?",
    options: [
      { id: "a", text: "5%" },
      { id: "b", text: "10%" },
      { id: "c", text: "11%" },
      { id: "d", text: "90%" },
    ],
    correct_answer: { id: "b" },
    explanation: "Mass percent = 10 g / (10 g + 90 g) × 100% = 10%.",
  },

  // ────────── 1.5 Atomic Structure and Electron Configuration
  {
    id: "fb-1-5-a",
    topic_id: "lo-1-5",
    question_type: "mcq",
    question_text: "What is the ground-state electron configuration of nitrogen (Z = 7)?",
    options: [
      { id: "a", text: "1s² 2s² 2p²" },
      { id: "b", text: "1s² 2s² 2p³" },
      { id: "c", text: "1s² 2s¹ 2p⁴" },
      { id: "d", text: "1s² 2p⁵" },
    ],
    correct_answer: { id: "b" },
    explanation: "Nitrogen's 7 electrons fill 1s² 2s² 2p³ (one electron per p orbital by Hund's rule).",
  },
  {
    id: "fb-1-5-b",
    topic_id: "lo-1-5",
    question_type: "mcq",
    question_text: "What is the electron configuration of the Mg²⁺ ion?",
    options: [
      { id: "a", text: "1s² 2s² 2p⁶ 3s²" },
      { id: "b", text: "1s² 2s² 2p⁶" },
      { id: "c", text: "1s² 2s² 2p⁶ 3s¹" },
      { id: "d", text: "1s² 2s² 2p⁴" },
    ],
    correct_answer: { id: "b" },
    explanation: "Neutral Mg is 1s² 2s² 2p⁶ 3s²; losing its two 3s electrons gives 1s² 2s² 2p⁶ (like Ne).",
  },

  // ────────── 1.6 Photoelectron Spectroscopy
  {
    id: "fb-1-6-a",
    topic_id: "lo-1-6",
    question_type: "mcq",
    question_text: "In a photoelectron spectrum, electrons with the highest binding energy come from…",
    options: [
      { id: "a", text: "The valence shell" },
      { id: "b", text: "The subshell closest to the nucleus (e.g., 1s)" },
      { id: "c", text: "The outermost p subshell" },
      { id: "d", text: "Outside the atom" },
    ],
    correct_answer: { id: "b" },
    explanation: "Core electrons closest to the nucleus are held most tightly, giving the highest binding energy.",
  },
  {
    id: "fb-1-6-b",
    topic_id: "lo-1-6",
    question_type: "mcq",
    question_text: "In a PES, the relative height of a peak is proportional to…",
    options: [
      { id: "a", text: "The binding energy of the electrons" },
      { id: "b", text: "The number of electrons in that subshell" },
      { id: "c", text: "The atomic radius" },
      { id: "d", text: "The number of protons" },
    ],
    correct_answer: { id: "b" },
    explanation: "Peak height reflects how many electrons occupy that subshell.",
  },

  // ────────── 1.7 Periodic Trends
  {
    id: "fb-1-7-a",
    topic_id: "lo-1-7",
    question_type: "mcq",
    question_text: "Which element has the largest atomic radius?",
    options: [
      { id: "a", text: "Li" },
      { id: "b", text: "Na" },
      { id: "c", text: "K" },
      { id: "d", text: "Rb" },
    ],
    correct_answer: { id: "d" },
    explanation: "Atomic radius increases down a group, so Rb (lowest here) is largest.",
  },
  {
    id: "fb-1-7-b",
    topic_id: "lo-1-7",
    question_type: "mcq",
    question_text: "Which element has the highest first ionization energy?",
    options: [
      { id: "a", text: "F" },
      { id: "b", text: "O" },
      { id: "c", text: "N" },
      { id: "d", text: "Ne" },
    ],
    correct_answer: { id: "d" },
    explanation: "Ionization energy increases across a period; the noble gas Ne is highest here.",
  },

  // ────────── 1.8 Valence Electrons and Ionic Compounds
  {
    id: "fb-1-8-a",
    topic_id: "lo-1-8",
    question_type: "mcq",
    question_text: "How many valence electrons does an oxygen atom have?",
    options: [
      { id: "a", text: "2" },
      { id: "b", text: "4" },
      { id: "c", text: "6" },
      { id: "d", text: "8" },
    ],
    correct_answer: { id: "c" },
    explanation: "Oxygen is in group 16, so it has 6 valence electrons (2s² 2p⁴).",
  },
  {
    id: "fb-1-8-b",
    topic_id: "lo-1-8",
    question_type: "mcq",
    question_text: "What is the formula of the ionic compound formed between magnesium and chlorine?",
    options: [
      { id: "a", text: "MgCl" },
      { id: "b", text: "MgCl₂" },
      { id: "c", text: "Mg₂Cl" },
      { id: "d", text: "Mg₂Cl₃" },
    ],
    correct_answer: { id: "b" },
    explanation: "Mg²⁺ needs two Cl⁻ ions to balance charge, giving MgCl₂.",
  },
];

// Pick a fallback MCQ for a learning target, avoiding ids already used when possible.
export function fallbackQuestionForTopic(topicId: string, excludeIds: string[] = []): MCQQuestion | null {
  const pool = FALLBACK_QUESTIONS.filter((q) => q.topic_id === topicId);
  if (pool.length === 0) return null;
  const unused = pool.filter((q) => !excludeIds.includes(q.id));
  const choices = unused.length > 0 ? unused : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}
