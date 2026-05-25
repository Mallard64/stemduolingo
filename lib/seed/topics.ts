import type { Topic } from "@/lib/types";

export const TOPICS: Topic[] = [
  {
    id: "atomic-structure",
    title: "Atomic Structure",
    description: "Subatomic particles, isotopes, electron configuration.",
    order_index: 1,
    unlock_requires: [],
  },
  {
    id: "periodic-trends",
    title: "Periodic Trends",
    description: "Atomic radius, ionization energy, electronegativity.",
    order_index: 2,
    unlock_requires: ["atomic-structure"],
  },
  {
    id: "ionic-covalent",
    title: "Ionic & Covalent Bonding",
    description: "Bond types, Lewis structures, polarity.",
    order_index: 3,
    unlock_requires: ["periodic-trends"],
  },
  {
    id: "vsepr",
    title: "Molecular Geometry (VSEPR)",
    description: "Shapes, bond angles, molecular polarity.",
    order_index: 4,
    unlock_requires: ["ionic-covalent"],
  },
  {
    id: "stoichiometry",
    title: "Stoichiometry",
    description: "Balancing equations, mole conversions, limiting reactant.",
    order_index: 5,
    unlock_requires: ["vsepr"],
  },
];
