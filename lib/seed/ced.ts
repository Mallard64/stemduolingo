import type { Topic } from "@/lib/types";

// AP Chemistry CED, organized by LEARNING TARGET (one node per CED topic, e.g. 1.1).
// Each carries its learning objective + essential knowledge, which ground the
// AI question generator so practice stays focused on a single objective.
// Currently scoped to Unit 1. Add units 2–4 by appending entries here.
export type LearningObjective = {
  id: string; // stable id used as the topic id (e.g. "lo-1-1")
  code: string; // CED learning objective code (e.g. "1.1.A")
  topicCode: string; // CED topic code (e.g. "1.1")
  unit: number;
  unitTitle: string;
  topic: string; // CED topic name
  objective: string; // the learning objective statement
  essential_knowledge: string[];
};

const UNIT_1 = "Atomic Structure & Properties";

export const LEARNING_OBJECTIVES: LearningObjective[] = [
  {
    id: "lo-1-1",
    code: "1.1.A",
    topicCode: "1.1",
    unit: 1,
    unitTitle: UNIT_1,
    topic: "Moles and Molar Mass",
    objective:
      "Calculate quantities of a substance or its relative number of particles using dimensional analysis and the mole concept.",
    essential_knowledge: [
      "Avogadro's number (6.022 × 10^23 mol^-1) relates the number of particles to the number of moles.",
      "Molar mass (g/mol) converts between the mass of a sample and the number of moles.",
      "Dimensional analysis is used to convert among mass, moles, and number of particles.",
    ],
  },
  {
    id: "lo-1-2",
    code: "1.2.A",
    topicCode: "1.2",
    unit: 1,
    unitTitle: UNIT_1,
    topic: "Mass Spectroscopy of Elements",
    objective:
      "Explain the quantitative relationship between the mass spectrum of an element and the masses of the element's isotopes.",
    essential_knowledge: [
      "The mass spectrum of a sample shows a peak for each isotope; the x-axis is mass and the y-axis is relative abundance.",
      "The weighted average of the isotope masses (by abundance) equals the average atomic mass of the element.",
    ],
  },
  {
    id: "lo-1-3",
    code: "1.3.A",
    topicCode: "1.3",
    unit: 1,
    unitTitle: UNIT_1,
    topic: "Elemental Composition of Pure Substances",
    objective:
      "Explain the quantitative relationship between the elemental composition by mass and the empirical formula of a pure substance.",
    essential_knowledge: [
      "Percent composition by mass can be calculated from a chemical formula and molar masses.",
      "The empirical formula is the simplest whole-number ratio of atoms and can be derived from percent composition.",
    ],
  },
  {
    id: "lo-1-4",
    code: "1.4.A",
    topicCode: "1.4",
    unit: 1,
    unitTitle: UNIT_1,
    topic: "Composition of Mixtures",
    objective:
      "Explain the quantitative relationship between the elemental composition by mass and the composition of substances in a mixture.",
    essential_knowledge: [
      "A mixture's elemental composition reflects the masses and proportions of its component pure substances.",
      "Mass percent of a component equals the component's mass divided by the total mass of the mixture.",
    ],
  },
  {
    id: "lo-1-5",
    code: "1.5.A",
    topicCode: "1.5",
    unit: 1,
    unitTitle: UNIT_1,
    topic: "Atomic Structure and Electron Configuration",
    objective:
      "Represent the electron configuration of an element or ions of an element using the Aufbau principle.",
    essential_knowledge: [
      "Electrons fill orbitals from lowest to highest energy (Aufbau), one per orbital before pairing (Hund's rule), with opposite spins (Pauli).",
      "Configurations can be written for neutral atoms and ions up to Z = 36, including noble-gas shorthand.",
    ],
  },
  {
    id: "lo-1-6",
    code: "1.6.A",
    topicCode: "1.6",
    unit: 1,
    unitTitle: UNIT_1,
    topic: "Photoelectron Spectroscopy",
    objective:
      "Explain the relationship between the photoelectron spectrum of an atom or ion and the electron configuration of the species.",
    essential_knowledge: [
      "Each peak in a PES corresponds to electrons in a particular subshell; binding energy increases for subshells closer to the nucleus.",
      "The relative height of a peak is proportional to the number of electrons in that subshell.",
    ],
  },
  {
    id: "lo-1-7",
    code: "1.7.A",
    topicCode: "1.7",
    unit: 1,
    unitTitle: UNIT_1,
    topic: "Periodic Trends",
    objective:
      "Explain the relationship between trends in atomic properties of elements and electronic structure and periodicity.",
    essential_knowledge: [
      "Atomic radius, ionization energy, and electronegativity vary periodically with position in the periodic table.",
      "Trends are explained using Coulomb's law, effective nuclear charge, and electron shielding.",
    ],
  },
  {
    id: "lo-1-8",
    code: "1.8.A",
    topicCode: "1.8",
    unit: 1,
    unitTitle: UNIT_1,
    topic: "Valence Electrons and Ionic Compounds",
    objective:
      "Explain the relationship between trends in the reactivity of elements and periodicity, and the formation of ionic compounds.",
    essential_knowledge: [
      "The number of valence electrons determines an element's chemical reactivity and the ions it tends to form.",
      "Ionic compounds form between metals and nonmetals; the formula reflects a neutral ratio of cations to anions.",
    ],
  },
];

export function learningObjectiveById(id: string): LearningObjective | undefined {
  return LEARNING_OBJECTIVES.find((lo) => lo.id === id);
}

// Skill tree: one node per learning target, linear unlock in CED order.
export const TOPICS: Topic[] = LEARNING_OBJECTIVES.map((lo, i) => ({
  id: lo.id,
  title: `${lo.topicCode} ${lo.topic}`,
  description: lo.objective,
  order_index: i + 1,
  unlock_requires: i === 0 ? [] : [LEARNING_OBJECTIVES[i - 1].id],
}));
