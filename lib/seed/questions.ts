import type { Question } from "@/lib/types";

export const QUESTIONS: Question[] = [
  // ────────── atomic-structure
  {
    id: "as-1",
    topic_id: "atomic-structure",
    question_type: "mcq",
    question_text: "Which subatomic particle determines the identity of an element?",
    options: [
      { id: "a", text: "Proton" },
      { id: "b", text: "Neutron" },
      { id: "c", text: "Electron" },
      { id: "d", text: "Positron" },
    ],
    correct_answer: { id: "a" },
    explanation: "The number of protons (atomic number) uniquely defines the element.",
  },
  {
    id: "as-2",
    topic_id: "atomic-structure",
    question_type: "mcq",
    question_text: "What is the ground-state electron configuration of nitrogen (Z = 7)?",
    options: [
      { id: "a", text: "1s² 2s² 2p²" },
      { id: "b", text: "1s² 2s² 2p³" },
      { id: "c", text: "1s² 2s¹ 2p⁴" },
      { id: "d", text: "1s² 2p⁵" },
    ],
    correct_answer: { id: "b" },
    explanation: "Nitrogen has 7 electrons: 2 in 1s, 2 in 2s, and 3 in 2p (one per p-orbital by Hund's rule).",
  },
  {
    id: "as-3",
    topic_id: "atomic-structure",
    question_type: "multi",
    question_text: "Which of the following are isotopes of carbon? (Select all that apply.)",
    options: [
      { id: "a", text: "¹²C" },
      { id: "b", text: "¹³C" },
      { id: "c", text: "¹⁴N" },
      { id: "d", text: "¹⁴C" },
    ],
    correct_answer: { ids: ["a", "b", "d"] },
    explanation: "Isotopes share the same atomic number (6 for carbon). ¹⁴N has 7 protons and is nitrogen.",
  },
  {
    id: "as-4",
    topic_id: "atomic-structure",
    question_type: "fill",
    question_text: "How many electrons can a single p-subshell hold in total?",
    options: null,
    correct_answer: { accepted: ["6", "six"] },
    explanation: "A p-subshell has 3 orbitals × 2 electrons each = 6 electrons.",
  },

  // ────────── periodic-trends
  {
    id: "pt-1",
    topic_id: "periodic-trends",
    question_type: "mcq",
    question_text: "Which element has the largest atomic radius?",
    options: [
      { id: "a", text: "Li" },
      { id: "b", text: "Na" },
      { id: "c", text: "K" },
      { id: "d", text: "Rb" },
    ],
    correct_answer: { id: "d" },
    explanation: "Atomic radius increases down a group; Rb is lowest in this list.",
  },
  {
    id: "pt-2",
    topic_id: "periodic-trends",
    question_type: "mcq",
    question_text: "Which has the highest first ionization energy?",
    options: [
      { id: "a", text: "F" },
      { id: "b", text: "O" },
      { id: "c", text: "N" },
      { id: "d", text: "Ne" },
    ],
    correct_answer: { id: "d" },
    explanation: "Noble gases have the highest first ionization energies in their period.",
  },
  {
    id: "pt-3",
    topic_id: "periodic-trends",
    question_type: "order",
    question_text: "Order these elements by increasing electronegativity (lowest first).",
    options: [
      { id: "a", text: "Cs" },
      { id: "b", text: "Al" },
      { id: "c", text: "S" },
      { id: "d", text: "F" },
    ],
    correct_answer: { ordered_ids: ["a", "b", "c", "d"] },
    explanation: "Electronegativity rises across periods and up groups. Cs < Al < S < F.",
  },
  {
    id: "pt-4",
    topic_id: "periodic-trends",
    question_type: "mcq",
    question_text: "Across a period (left → right), atomic radius generally…",
    options: [
      { id: "a", text: "Increases" },
      { id: "b", text: "Decreases" },
      { id: "c", text: "Stays constant" },
      { id: "d", text: "Increases then decreases" },
    ],
    correct_answer: { id: "b" },
    explanation: "Effective nuclear charge increases across a period, pulling electrons closer.",
  },

  // ────────── ionic-covalent
  {
    id: "ic-1",
    topic_id: "ionic-covalent",
    question_type: "mcq",
    question_text: "Which compound is most likely ionic?",
    options: [
      { id: "a", text: "CO₂" },
      { id: "b", text: "NaCl" },
      { id: "c", text: "CH₄" },
      { id: "d", text: "Cl₂" },
    ],
    correct_answer: { id: "b" },
    explanation: "Na (metal) + Cl (nonmetal) with a large electronegativity difference forms an ionic bond.",
  },
  {
    id: "ic-2",
    topic_id: "ionic-covalent",
    question_type: "multi",
    question_text: "Which of these are polar covalent molecules? (Select all that apply.)",
    options: [
      { id: "a", text: "H₂O" },
      { id: "b", text: "O₂" },
      { id: "c", text: "NH₃" },
      { id: "d", text: "N₂" },
    ],
    correct_answer: { ids: ["a", "c"] },
    explanation: "H₂O and NH₃ have polar bonds and asymmetric shapes. O₂ and N₂ are nonpolar (identical atoms).",
  },
  {
    id: "ic-3",
    topic_id: "ionic-covalent",
    question_type: "fill",
    question_text: "What is the chemical formula for magnesium chloride?",
    options: null,
    correct_answer: { accepted: ["MgCl2", "MgCl₂", "mgcl2"] },
    explanation: "Mg²⁺ pairs with two Cl⁻ ions: MgCl₂.",
  },

  // ────────── vsepr
  {
    id: "vs-1",
    topic_id: "vsepr",
    question_type: "mcq",
    question_text: "What is the molecular geometry of methane (CH₄)?",
    options: [
      { id: "a", text: "Trigonal planar" },
      { id: "b", text: "Tetrahedral" },
      { id: "c", text: "Trigonal pyramidal" },
      { id: "d", text: "Bent" },
    ],
    correct_answer: { id: "b" },
    explanation: "4 bonded pairs and no lone pairs on the central carbon gives tetrahedral geometry.",
  },
  {
    id: "vs-2",
    topic_id: "vsepr",
    question_type: "mcq",
    question_text: "What is the approximate bond angle in NH₃?",
    options: [
      { id: "a", text: "180°" },
      { id: "b", text: "120°" },
      { id: "c", text: "109.5°" },
      { id: "d", text: "~107°" },
    ],
    correct_answer: { id: "d" },
    explanation: "Lone pair on N compresses the H–N–H angle slightly below the ideal tetrahedral 109.5°.",
  },
  {
    id: "vs-3",
    topic_id: "vsepr",
    question_type: "mcq",
    question_text: "Which molecule is nonpolar overall despite having polar bonds?",
    options: [
      { id: "a", text: "H₂O" },
      { id: "b", text: "NH₃" },
      { id: "c", text: "CO₂" },
      { id: "d", text: "HCl" },
    ],
    correct_answer: { id: "c" },
    explanation: "CO₂ is linear and symmetric; its bond dipoles cancel.",
  },

  // ────────── stoichiometry
  {
    id: "st-1",
    topic_id: "stoichiometry",
    question_type: "mcq",
    question_text: "Balance: __ H₂ + __ O₂ → __ H₂O. What are the coefficients (in order)?",
    options: [
      { id: "a", text: "1, 1, 1" },
      { id: "b", text: "2, 1, 2" },
      { id: "c", text: "1, 2, 1" },
      { id: "d", text: "2, 2, 2" },
    ],
    correct_answer: { id: "b" },
    explanation: "2H₂ + O₂ → 2H₂O balances 4 H and 2 O on each side.",
  },
  {
    id: "st-2",
    topic_id: "stoichiometry",
    question_type: "fill",
    question_text: "How many moles of H₂O are produced from 4 mol H₂ reacting with excess O₂?",
    options: null,
    correct_answer: { accepted: ["4", "4 mol", "4mol"] },
    explanation: "From 2H₂ + O₂ → 2H₂O, the H₂:H₂O ratio is 1:1, so 4 mol H₂ → 4 mol H₂O.",
  },
  {
    id: "st-3",
    topic_id: "stoichiometry",
    question_type: "order",
    question_text: "Order the steps of a typical mass-to-mass stoichiometry problem.",
    options: [
      { id: "a", text: "Convert given mass to moles" },
      { id: "b", text: "Use mole ratio from balanced equation" },
      { id: "c", text: "Convert moles of product to mass" },
      { id: "d", text: "Write and balance the equation" },
    ],
    correct_answer: { ordered_ids: ["d", "a", "b", "c"] },
    explanation: "Balance → grams to moles (given) → mole ratio → moles to grams (product).",
  },
  {
    id: "st-4",
    topic_id: "stoichiometry",
    question_type: "mcq",
    question_text: "Given 2 mol N₂ and 3 mol H₂ in N₂ + 3H₂ → 2NH₃, which is the limiting reactant?",
    options: [
      { id: "a", text: "N₂" },
      { id: "b", text: "H₂" },
      { id: "c", text: "Neither — both run out at once" },
      { id: "d", text: "Cannot be determined" },
    ],
    correct_answer: { id: "b" },
    explanation: "2 mol N₂ needs 6 mol H₂; only 3 mol H₂ is available, so H₂ limits the reaction.",
  },
];

export function questionsForTopic(topicId: string, n = 5): Question[] {
  const pool = QUESTIONS.filter((q) => q.topic_id === topicId);
  return pool.slice(0, n);
}
