// data/roster.js
// Refactored roster module using lazy roster building (assignments -> buildRoster on demand).
// Exports maintain the original public API: RosterDB, activeRosterName, switchRoster, lineups, posMap

// ===========================================================================
// 1. MASTER PLAYER LIST (single source of truth – no roles here)
// ===========================================================================
const playersMaster = [
  // FORWARDS
  { number: 26, name: "Lehtinen",         pos: "F", shoots: "R", ovr: 81 },
  { number: 11, name: "S. Koivu",         pos: "F", letter: "C", shoots: "L", ovr: 82 },
  { number: 8,  name: "Selänne",          pos: "F", letter: "A", shoots: "R", ovr: 82 },
  { number: 36, name: "J. Jokinen",       pos: "F", shoots: "L", ovr: 82 },
  { number: 9,  name: "M. Koivu",         pos: "F", shoots: "L", ovr: 87 },
  { number: 51, name: "Filppula",         pos: "F", shoots: "L", ovr: 82 },
  { number: 10, name: "Hagman",           pos: "F", shoots: "L", ovr: 82 },
  { number: 12, name: "O. Jokinen",       pos: "F", shoots: "L", ovr: 84 },
  { number: 15, name: "T. Ruutu",         pos: "F", shoots: "L", ovr: 83 },
  { number: 37, name: "J. Ruutu",         pos: "F", shoots: "L", ovr: 79 },
  { number: 62, name: "Immonen",          pos: "F", shoots: "R", ovr: 81 },
  { number: 20, name: "Miettinen",        pos: "F", shoots: "R", ovr: 80 },
  { number: 28, name: "Korpikoski",       pos: "F", shoots: "L", ovr: 77 },
  { number: 16, name: "Peltonen",         pos: "F", shoots: "L", ovr: 76 },
  // DEFENSEMEN
  { number: 44, name: "Timonen",          pos: "D", letter: "A", shoots: "L", ovr: 83 },
  { number: 6,  name: "Salo",             pos: "D", shoots: "R", ovr: 80 },
  { number: 25, name: "Pitkänen",         pos: "D", shoots: "L", ovr: 81 },
  { number: 32, name: "Lydman",           pos: "D", shoots: "L", ovr: 79 },
  { number: 18, name: "Lepistö",          pos: "D", shoots: "L", ovr: 78 },
  { number: 3,  name: "Nummelin",         pos: "D", shoots: "L", ovr: 78 },
  { number: 4,  name: "Väänänen",         pos: "D", shoots: "L", ovr: 77 },
  { number: 29, name: "Salmela",          pos: "D", shoots: "L", ovr: 76 },
  // GOALTENDERS
  { number: 34, name: "Kiprusoff",        pos: "G", shoots: "L", ovr: 89 },
  { number: 40, name: "Rask",             pos: "G", shoots: "L", ovr: 84 },
  { number: 30, name: "Niittymäki",       pos: "G", shoots: "L", ovr: 82 }
];

// ===========================================================================
// 2. ASSIGNMENT MAPS (role short names -> jersey numbers map is inverted by buildRoster)
// ===========================================================================

// --- hybridAssignments ---
const hybridAssignments = {
  // Even strength forwards
  26: ["lw1"],
  11: ["c1", "c_pp1", "c_pk1", "c_4pp1", "c_3pk1"],
  8:  ["rw1", "ld_pp1", "rw_pk1", "ld_4pp1"],
  15: ["lw2", "rw_pp2", "rw_pk2", "rw_4pp2"],
  9:  ["c2", "c_pp2", "c_pk2", "c_4pp2", "c_3pk2"],
  51: ["rw2", "lw_pp2"],
  10: ["lw4"],
  12: ["c3", "rw_pp1", "rw_4pp1"],
  36: ["rw3", "rd_pp2", "rd_4pp2"],
  16: ["lw3", "lw_pp1"],
  62: ["c4"],
  37: ["rw4"],
  20: ["f_res1"],
  28: ["f_res2"],
  // Defense
  44: ["ld1", "rd_pp1", "ld_pk1", "rd_4pp1", "ld_3pk1"],
  6:  ["rd1", "ld_pp2", "rd_pk1", "ld_4pp2", "rd_3pk1"],
  32:  ["ld2", "rd_pk2", "rd_3pk2"],
  3:  ["rd2"],
  25:  ["ld3", "ld_pk2", "ld_3pk2"],
  18: ["d_res1"],
  4:  ["rd3"],
  29: ["d_res2"],
  // Goalies
  34: ["g1"],
  30: ["g2"],
  40: ["g3"]
};

// ===========================================================================
// 3. BUILD ROSTER (assignments -> full roster)
// ===========================================================================

/**
 * buildRoster(assignments)
 * - assignments: object keyed by jersey number -> array of role short names
 * Returns an array of players (copied from playersMaster) with a `roles` array attached.
 */
function buildRoster(assignments = {}) {
  // Defensive: ensure assignments keys are numbers (they may be strings if read from JSON)
  const normalized = {};
  for (const key of Object.keys(assignments)) {
    const num = Number(key);
    normalized[num] = Array.isArray(assignments[key]) ? assignments[key].slice() : [];
  }

  return playersMaster.map(p => ({
    ...p,
    roles: normalized[p.number] || []
  }));
}

// ===========================================================================
// 4. PUBLIC API
// ===========================================================================

// The live database used by the app (mutable array reference preserved)
export const RosterDB = [];

// Active roster name – always "Olympiahybridi"
export let activeRosterName = "Olympiahybridi";

/**
 * deepCopy
 * small helper to deep copy a value (used to avoid mutating templates)
 */
function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * switchRoster(name)
 * - builds the roster from the assignment map and replaces RosterDB contents in-place
 */
export function switchRoster(name) {
  // Always use hybridAssignments (Olympiahybridi)
  const roster = buildRoster(hybridAssignments);
  // deep copy to ensure RosterDB is independent
  const copy = deepCopy(roster);

  // preserve array reference
  RosterDB.splice(0, RosterDB.length, ...copy);
  activeRosterName = "Olympiahybridi";
}

/**
 * getRoster(name)
 * - convenience: returns a built roster (deep copy) for read-only use
 */
export function getRoster(name) {
  return deepCopy(buildRoster(hybridAssignments));
}

/**
 * initFromSession()
 * - optional helper to initialize RosterDB on import
 */
function initFromSession() {
  // Always initialize with the default (Olympiahybridi)
  switchRoster(activeRosterName);
}

// Try to initialize from sessionStorage (safe no-op if unavailable)
initFromSession();

// ===========================================================================
// 5. LINEUP DEFINITIONS (short role names used across the app)
// ===========================================================================
export const lineups = {
  even: [
    { name: "H1", f: ["lw1", "c1", "rw1"] },
    { name: "H2", f: ["lw2", "c2", "rw2"] },
    { name: "H3", f: ["lw3", "c3", "rw3"] },
    { name: "H4", f: ["lw4", "c4", "rw4"] },
    { name: "P1", d: ["ld1", "rd1"] },
    { name: "P2", d: ["ld2", "rd2"] },
    { name: "P3", d: ["ld3", "rd3"] },
    { name: "Varahyökkääjät",  f: ["f_res1", "f_res2"] },
    { name: "Varapuolustajat", d: ["d_res1", "d_res2"] }
  ],
  pp: [
    { name: "YV1",             f: ["lw_pp1", "c_pp1", "rw_pp1"], d: ["ld_pp1", "rd_pp1"] },
    { name: "YV2",             f: ["lw_pp2", "c_pp2", "rw_pp2"], d: ["ld_pp2", "rd_pp2"] },
    { name: "4YV1",            f: ["c_4pp1", "rw_4pp1"],         d: ["ld_4pp1", "rd_4pp1"] },
    { name: "4YV2",            f: ["c_4pp2", "rw_4pp2"],         d: ["ld_4pp2", "rd_4pp2"] }
  ],
  pk: [
    { name: "AV1",             f: ["c_pk1", "rw_pk1"],           d: ["ld_pk1", "rd_pk1"] },
    { name: "AV2",             f: ["c_pk2", "rw_pk2"],           d: ["ld_pk2", "rd_pk2"] },
    { name: "3AV1",            f: ["c_3pk1"],                    d: ["ld_3pk1", "rd_3pk1"] },
    { name: "3AV2",            f: ["c_3pk2"],                    d: ["ld_3pk2", "rd_3pk2"] }
  ],
  goalies: [
    { name: "Maalivahdit", roles: ["g1", "g2", "g3"] }
  ]
};

// ===========================================================================
// 6. POSITION MAP (UI localization)
// ===========================================================================
export const posMap = { 'LW': 'VL', 'C': 'KH', 'RW': 'OL', 'LD': 'VP', 'RD': 'OP', 'G': 'MV', 'F': 'H', 'D': 'P' };
