import type { DailyPuzzle } from "@/lib/types";

type SeedPuzzle = Omit<DailyPuzzle, "date">;

// 14 hand-curated puzzles cycled by index = day-of-year % 14
export const PUZZLE_BANK: SeedPuzzle[] = [
  {
    items: ["NaCl", "MgO", "KBr", "H2O", "NH3", "HCl", "O2", "N2", "CH4"],
    groups: [
      ["NaCl", "MgO", "KBr"],
      ["H2O", "NH3", "HCl"],
      ["O2", "N2", "CH4"],
    ],
    categories: ["Ionic compounds", "Polar covalent molecules", "Nonpolar covalent molecules"],
  },
  {
    items: ["Li", "Na", "K", "F", "Cl", "Br", "He", "Ne", "Ar"],
    groups: [
      ["Li", "Na", "K"],
      ["F", "Cl", "Br"],
      ["He", "Ne", "Ar"],
    ],
    categories: ["Alkali metals", "Halogens", "Noble gases"],
  },
  {
    items: ["CO2", "BeCl2", "HCN", "BF3", "SO3", "AlCl3", "CH4", "NH4+", "SiCl4"],
    groups: [
      ["CO2", "BeCl2", "HCN"],
      ["BF3", "SO3", "AlCl3"],
      ["CH4", "NH4+", "SiCl4"],
    ],
    categories: ["Linear", "Trigonal planar", "Tetrahedral"],
  },
  {
    items: ["Be", "Mg", "Ca", "O", "S", "Se", "Sc", "Y", "La"],
    groups: [
      ["Be", "Mg", "Ca"],
      ["O", "S", "Se"],
      ["Sc", "Y", "La"],
    ],
    categories: ["Ends in s²", "Ends in p⁴", "Ends in d¹"],
  },
  {
    items: ["HCl", "HNO3", "H2SO4", "NaOH", "KOH", "NH3", "NaCl", "KBr", "CaCO3"],
    groups: [
      ["HCl", "HNO3", "H2SO4"],
      ["NaOH", "KOH", "NH3"],
      ["NaCl", "KBr", "CaCO3"],
    ],
    categories: ["Acids", "Bases", "Salts"],
  },
  {
    items: ["H2O", "NH3", "SO2", "CO2", "CH4", "BF3", "O2", "N2", "Cl2"],
    groups: [
      ["H2O", "NH3", "SO2"],
      ["CO2", "CH4", "BF3"],
      ["O2", "N2", "Cl2"],
    ],
    categories: ["Polar molecules", "Nonpolar molecules with polar bonds", "Nonpolar diatomics"],
  },
  {
    items: ["Na+", "Mg2+", "Al3+", "F-", "O2-", "N3-", "Ne", "Ar", "Kr"],
    groups: [
      ["Na+", "Mg2+", "Al3+"],
      ["F-", "O2-", "N3-"],
      ["Ne", "Ar", "Kr"],
    ],
    categories: ["Cations", "Anions", "Neutral noble gases"],
  },
  {
    items: ["Fe", "Cu", "Zn", "C", "Si", "Ge", "B", "As", "Te"],
    groups: [
      ["Fe", "Cu", "Zn"],
      ["C", "Si", "Ge"],
      ["B", "As", "Te"],
    ],
    categories: ["Transition metals", "Group 14 elements", "Metalloids"],
  },
  {
    items: ["1s2", "1s2 2s2", "1s2 2s2 2p6", "1s2 2s1", "1s2 2s2 2p1", "1s2 2s2 2p3", "1s2 2s2 2p5", "1s2 2s2 2p6 3s1", "1s2 2s2 2p4"],
    groups: [
      ["1s2", "1s2 2s2", "1s2 2s2 2p6"],
      ["1s2 2s1", "1s2 2s2 2p1", "1s2 2s2 2p3"],
      ["1s2 2s2 2p5", "1s2 2s2 2p6 3s1", "1s2 2s2 2p4"],
    ],
    categories: ["Noble gas configurations", "Have unpaired s/p electrons (period 2)", "Common ion-forming configs"],
  },
  {
    items: ["H2 + Cl2 → 2HCl", "2Na + Cl2 → 2NaCl", "N2 + 3H2 → 2NH3", "2H2O → 2H2 + O2", "CaCO3 → CaO + CO2", "2KClO3 → 2KCl + 3O2", "Zn + 2HCl → ZnCl2 + H2", "Cu + 2AgNO3 → Cu(NO3)2 + 2Ag", "Fe + CuSO4 → FeSO4 + Cu"],
    groups: [
      ["H2 + Cl2 → 2HCl", "2Na + Cl2 → 2NaCl", "N2 + 3H2 → 2NH3"],
      ["2H2O → 2H2 + O2", "CaCO3 → CaO + CO2", "2KClO3 → 2KCl + 3O2"],
      ["Zn + 2HCl → ZnCl2 + H2", "Cu + 2AgNO3 → Cu(NO3)2 + 2Ag", "Fe + CuSO4 → FeSO4 + Cu"],
    ],
    categories: ["Synthesis", "Decomposition", "Single replacement"],
  },
  {
    items: ["H2O", "NH3", "PH3", "BeH2", "CO2", "HCN", "CH4", "SiH4", "NH4+"],
    groups: [
      ["H2O", "NH3", "PH3"],
      ["BeH2", "CO2", "HCN"],
      ["CH4", "SiH4", "NH4+"],
    ],
    categories: ["Has lone pair(s) on central atom", "Linear geometry", "Tetrahedral geometry"],
  },
  {
    items: ["F", "Cl", "Br", "Na", "K", "Rb", "Mg", "Ca", "Sr"],
    groups: [
      ["F", "Cl", "Br"],
      ["Na", "K", "Rb"],
      ["Mg", "Ca", "Sr"],
    ],
    categories: ["Halogens", "Alkali metals", "Alkaline earth metals"],
  },
  {
    items: ["NaCl", "KI", "CaO", "HF", "H2O", "NH3", "I2", "CO2", "CH4"],
    groups: [
      ["NaCl", "KI", "CaO"],
      ["HF", "H2O", "NH3"],
      ["I2", "CO2", "CH4"],
    ],
    categories: ["Ionic", "Polar covalent", "Nonpolar covalent"],
  },
  {
    items: ["He", "Ne", "Ar", "Li", "Be", "B", "C", "N", "O"],
    groups: [
      ["He", "Ne", "Ar"],
      ["Li", "Be", "B"],
      ["C", "N", "O"],
    ],
    categories: ["Noble gases", "Period 2 metals/metalloids", "Period 2 nonmetals (Group 14–16)"],
  },
];

function dayIndex(date: string): number {
  const d = new Date(date + "T00:00:00Z");
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diff = d.getTime() - start;
  const day = Math.floor(diff / 86400000);
  return ((day % PUZZLE_BANK.length) + PUZZLE_BANK.length) % PUZZLE_BANK.length;
}

function shuffleStable(items: string[], seed: string): string[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function puzzleForDate(date: string): DailyPuzzle {
  const base = PUZZLE_BANK[dayIndex(date)];
  return {
    date,
    items: shuffleStable(base.items, date),
    groups: base.groups,
    categories: base.categories,
  };
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function puzzleNumber(date: string): number {
  // Days since 2026-05-25 (project start) + 1
  const start = Date.UTC(2026, 4, 25);
  const now = new Date(date + "T00:00:00Z").getTime();
  return Math.max(1, Math.floor((now - start) / 86400000) + 1);
}
