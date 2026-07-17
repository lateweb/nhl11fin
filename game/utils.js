// game/utils.js
import { RosterDB, lineups } from '../data/roster.js';
import { getPlayerByName } from '../utils/rosterUtils.js';

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isEvenStrengthRole(role) {
  return !/_(pp|pk|4pp|3pk|res)/.test(role);
}

export function getPlayerEvenLineName(playerName) {
  const player = getPlayerByName(playerName);
  if (!player) return 'Ei ketjua';
  const evenRoles = player.roles.filter(isEvenStrengthRole);
  if (evenRoles.length === 0) return 'Ei ketjua';
  for (const lineup of lineups.even) {
    const lineupRoles = [...(lineup.f || []), ...(lineup.d || [])];
    if (evenRoles.some(role => lineupRoles.includes(role))) {
      return lineup.name;
    }
  }
  return 'Ei ketjua';
}

export function hasEvenLine(playerName) {
  return getPlayerEvenLineName(playerName) !== 'Ei ketjua';
}

const ppRolesSet = new Set();
lineups.pp.forEach(line => {
  (line.f || []).forEach(r => ppRolesSet.add(r));
  (line.d || []).forEach(r => ppRolesSet.add(r));
});

export function playerPlaysPP(playerName) {
  const player = getPlayerByName(playerName);
  if (!player) return false;
  return player.roles.some(role => ppRolesSet.has(role));
}

const pkRolesSet = new Set();
lineups.pk.forEach(line => {
  (line.f || []).forEach(r => pkRolesSet.add(r));
  (line.d || []).forEach(r => pkRolesSet.add(r));
});

export function playerPlaysPK(playerName) {
  const player = getPlayerByName(playerName);
  if (!player) return false;
  return player.roles.some(role => pkRolesSet.has(role));
}

export function getPositionLabel(posCode) {
  const map = { F: 'HyÃ¶kkÃ¤Ã¤jÃ¤', D: 'Puolustaja', G: 'Maalivahti' };
  return map[posCode] || posCode;
}

export function isReservePlayer(playerName) {
  const player = getPlayerByName(playerName);
  if (!player) return false;
  return player.roles.some(role => /_res/.test(role));
}

export function getRandomPlayer(options = {}) {
  const { excludeGoalies = false, requireEvenLine = false, excludePlayers = [], excludeReserves = false } = options;
  let pool = RosterDB;

  if (excludeGoalies) pool = pool.filter(p => p.pos !== 'G');
  if (requireEvenLine) pool = pool.filter(p => hasEvenLine(p.name));
  if (excludeReserves) pool = pool.filter(p => !isReservePlayer(p.name));
  if (excludePlayers.length) pool = pool.filter(p => !excludePlayers.includes(p.name));

  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomOptions(correct, allItems, count = 4) {
  const uniqueItems = [...new Set(allItems)];
  const remaining = uniqueItems.filter(item => item !== correct);
  const selected = [correct];
  
  while (selected.length < count && remaining.length > 0) {
    const idx = Math.floor(Math.random() * remaining.length);
    const item = remaining.splice(idx, 1)[0];
    selected.push(item);
  }
  return shuffleArray(selected);
}

export function getRandomSubset(arr, count) {
  const shuffled = shuffleArray(arr);
  return shuffled.slice(0, count);
}

export function getOddOneOutGroup(truePlayers, falsePlayers, askForHas) {
  if (askForHas) {
    if (truePlayers.length < 1 || falsePlayers.length < 3) return null;
    return {
      oddPlayer: getRandomSubset(truePlayers, 1)[0],
      groupPlayers: getRandomSubset(falsePlayers, 3)
    };
  } else {
    if (falsePlayers.length < 1 || truePlayers.length < 3) return null;
    return {
      oddPlayer: getRandomSubset(falsePlayers, 1)[0],
      groupPlayers: getRandomSubset(truePlayers, 3)
    };
  }
}