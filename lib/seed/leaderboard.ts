import type { Profile } from "@/lib/types";

// 30 seeded fake users — distribution per lane-04: 5 high, 10 mid, 15 below demo user.
export const FAKE_USERS: Profile[] = [
  { id: "u1",  username: "chem_wizard",     created_at: "", current_streak: 42, last_active_date: null, total_xp: 4820 },
  { id: "u2",  username: "stoich_master",   created_at: "", current_streak: 31, last_active_date: null, total_xp: 4310 },
  { id: "u3",  username: "vsepr_vince",     created_at: "", current_streak: 24, last_active_date: null, total_xp: 3990 },
  { id: "u4",  username: "mol_mary",        created_at: "", current_streak: 19, last_active_date: null, total_xp: 3710 },
  { id: "u5",  username: "e_neg_eric",      created_at: "", current_streak: 17, last_active_date: null, total_xp: 3540 },

  { id: "u6",  username: "orbital_olive",   created_at: "", current_streak: 12, last_active_date: null, total_xp: 2980 },
  { id: "u7",  username: "ionic_ian",       created_at: "", current_streak: 11, last_active_date: null, total_xp: 2860 },
  { id: "u8",  username: "covalent_cam",    created_at: "", current_streak: 10, last_active_date: null, total_xp: 2740 },
  { id: "u9",  username: "lewis_lou",       created_at: "", current_streak:  9, last_active_date: null, total_xp: 2610 },
  { id: "u10", username: "redox_rita",      created_at: "", current_streak:  9, last_active_date: null, total_xp: 2490 },
  { id: "u11", username: "anion_anna",      created_at: "", current_streak:  8, last_active_date: null, total_xp: 2360 },
  { id: "u12", username: "cation_carl",     created_at: "", current_streak:  8, last_active_date: null, total_xp: 2240 },
  { id: "u13", username: "isotope_iris",    created_at: "", current_streak:  7, last_active_date: null, total_xp: 2120 },
  { id: "u14", username: "atom_andre",      created_at: "", current_streak:  7, last_active_date: null, total_xp: 2010 },
  { id: "u15", username: "trend_tasha",     created_at: "", current_streak:  6, last_active_date: null, total_xp: 1900 },

  { id: "u16", username: "bondy_ben",       created_at: "", current_streak:  6, last_active_date: null, total_xp:  720 },
  { id: "u17", username: "mole_miles",      created_at: "", current_streak:  5, last_active_date: null, total_xp:  680 },
  { id: "u18", username: "valence_vee",     created_at: "", current_streak:  5, last_active_date: null, total_xp:  640 },
  { id: "u19", username: "proton_priya",    created_at: "", current_streak:  5, last_active_date: null, total_xp:  600 },
  { id: "u20", username: "neutron_nia",     created_at: "", current_streak:  4, last_active_date: null, total_xp:  560 },
  { id: "u21", username: "shell_sho",       created_at: "", current_streak:  4, last_active_date: null, total_xp:  520 },
  { id: "u22", username: "spdf_sam",        created_at: "", current_streak:  4, last_active_date: null, total_xp:  480 },
  { id: "u23", username: "balanced_b",      created_at: "", current_streak:  3, last_active_date: null, total_xp:  440 },
  { id: "u24", username: "limit_liz",       created_at: "", current_streak:  3, last_active_date: null, total_xp:  400 },
  { id: "u25", username: "yield_yara",      created_at: "", current_streak:  3, last_active_date: null, total_xp:  360 },
  { id: "u26", username: "noble_nora",      created_at: "", current_streak:  2, last_active_date: null, total_xp:  320 },
  { id: "u27", username: "alkali_ali",      created_at: "", current_streak:  2, last_active_date: null, total_xp:  280 },
  { id: "u28", username: "halo_hank",       created_at: "", current_streak:  2, last_active_date: null, total_xp:  240 },
  { id: "u29", username: "polar_pat",       created_at: "", current_streak:  1, last_active_date: null, total_xp:  180 },
  { id: "u30", username: "newbie_nick",     created_at: "", current_streak:  1, last_active_date: null, total_xp:  120 },
];
