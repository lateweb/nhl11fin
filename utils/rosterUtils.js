// utils/rosterUtils.js
import { RosterDB, lineups, posMap } from '../data/roster.js';

export function getPlayerByName(playerName) {
  return RosterDB.find(p => p.name === playerName) || null;
}

export function getFinnishPosLabel(role) {
  const base = role.split('_')[0].replace(/[0-9]/g, '').toUpperCase();
  return posMap[base] || base;
}

export function findPlayerInRole(role) {
  return RosterDB.find(p => p.roles.includes(role)) || null;
}

export function isPlayerInRole(playerName, role) {
  const player = getPlayerByName(playerName);
  return player ? player.roles.includes(role) : false;
}

export function playerPlaysInLineup(playerName, lineup) {
  const player = getPlayerByName(playerName);
  if (!player) return false;
  const allRoles = [...(lineup.f || []), ...(lineup.d ||[]), ...(lineup.roles ||[])];
  return allRoles.some(role => player.roles.includes(role));
}

const lineupInfoCache = new Map();

export function getPlayerLineupInfo(playerName) {
  if (lineupInfoCache.has(playerName)) {
    return lineupInfoCache.get(playerName);
  }

  const player = getPlayerByName(playerName);
  if (!player) return { primary: null, secondary:[] };
  
  const roles = player.roles;
  let primary = null;
  const secondary =[];

  roles.forEach(role => {
    let lineupName = null;
    let category = null;
    for (const [cat, lines] of Object.entries(lineups)) {
      for (const line of lines) {
        if ((line.f && line.f.includes(role)) || (line.d && line.d.includes(role)) || (line.roles && line.roles.includes(role))) {
          lineupName = line.name;
          category = cat;
          break;
        }
      }
      if (lineupName) break;
    }
    if (lineupName) {
      const pos = player.pos === 'G' ? 'MV' : getFinnishPosLabel(role);
      const info = { pos, line: lineupName, cat: category };
      if (category === 'even' && !primary) primary = info;
      else if (category === 'goalies' && !primary) primary = info;
      else secondary.push(info);
    }
  });
  
  const result = (player.pos === 'G') ? { primary, secondary:[] } : { primary, secondary };
  lineupInfoCache.set(playerName, result);
  return result;
}

export function getGoalies() {
  // Return goalies correctly sorted by their g1, g2, g3 roles
  return RosterDB.filter(p => p.pos === 'G').sort((a, b) => {
    const getRank = p => {
      const role = p.roles.find(r => r.startsWith('g'));
      return role ? parseInt(role.replace('g', ''), 10) : 99;
    };
    return getRank(a) - getRank(b);
  });
}

export function getGoalieByRole(role) {
  return findPlayerInRole(role);
}

export function isGoalie(playerName) {
  const player = getPlayerByName(playerName);
  return player ? player.pos === 'G' : false;
}