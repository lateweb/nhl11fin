// dom/components/lineupRow.js

import { findPlayerInRole, isPlayerInRole, getGoalies, getFinnishPosLabel } from '../../utils/rosterUtils.js';
import { getJerseyName, renderJerseyHTML } from '../utils/domHelpers.js';

export function createRow(roles, highlightPlayerName) {
  if (!roles || roles.length === 0) return '';
  const slots = roles.map(role => {
    const player = findPlayerInRole(role);
    const number = player ? player.number : 'â€”';
    const jerseyName = player ? getJerseyName(player.name) : 'â€”';
    const pos = getFinnishPosLabel(role);
    const highlightClass = highlightPlayerName && isPlayerInRole(highlightPlayerName, role) ? 'highlight' : '';
    const emptyClass = !player ? 'empty' : '';
    
    return `
      <div class="slot ${highlightClass} ${emptyClass}">
        ${renderJerseyHTML(jerseyName, number)}
        ${player ? `<div class="player-pos">${pos}</div>` : '<div class="player-pos" aria-hidden="true"></div>'}
      </div>`;
  }).join('');
  return `<div class="row-${roles.length}">${slots}</div>`;
}

/**
 * Creates the 1â€‘3â€‘1 HTML for a power play unit.
 * Rows (topâ€‘toâ€‘bottom) when attacking the top goal:
 *   Top row:    LW (netâ€‘front)
 *   Middle row: LD, C, RW (shooters, in that leftâ€‘toâ€‘right order)
 *   Bottom row: RD (quarterback)
 */
export function createPPRow(roles, highlightPlayerName) {
  if (!roles || roles.length === 0) return '';

  const netFrontRoles = [];  // LW
  const slotRoles = [];      // LD, C, RW
  const pointRoles = [];     // RD

  for (const role of roles) {
    const base = role.split('_')[0];
    if (base === 'lw') {
      netFrontRoles.push(role);
    } else if (base === 'rd') {
      pointRoles.push(role);
    } else {
      // ld, c, rw
      slotRoles.push(role);
    }
  }

  // Explicitly order the middle row leftâ€‘toâ€‘right: LD, C, RW
  const orderMap = { ld: 0, c: 1, rw: 2 };
  slotRoles.sort((a, b) => {
    const baseA = a.split('_')[0];
    const baseB = b.split('_')[0];
    const orderA = orderMap[baseA] ?? 99;
    const orderB = orderMap[baseB] ?? 99;
    return orderA - orderB;
  });

  const rows = [
    createRow(netFrontRoles, highlightPlayerName),
    createRow(slotRoles, highlightPlayerName),
    createRow(pointRoles, highlightPlayerName)
  ].filter(r => r);

  return rows.join('');
}

export function createGoalieRow(highlightPlayerName) {
  const goalies = getGoalies();
  const slots = goalies.map(goalie => {
    const highlightClass = highlightPlayerName && goalie.name === highlightPlayerName ? 'highlight' : '';
    const jerseyName = getJerseyName(goalie.name);
    return `
      <div class="slot ${highlightClass}">
        ${renderJerseyHTML(jerseyName, goalie.number)}
        <div class="player-pos">MV</div>
      </div>`;
  }).join('');
  return `<div class="row-${goalies.length}">${slots}</div>`;
}