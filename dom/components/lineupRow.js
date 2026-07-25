// dom/components/lineupRow.js

import { findPlayerInRole, isPlayerInRole, getGoalies, getFinnishPosLabel } from '../../utils/rosterUtils.js';
import { getJerseyName, renderJerseyHTML } from '../utils/domHelpers.js';

export function createRow(roles, highlightPlayerName) {
  if (!roles || roles.length === 0) return '';
  const slots = roles.map(role => {
    const player = findPlayerInRole(role);
    const number = player ? player.number : '—';
    const jerseyName = player ? getJerseyName(player.name) : '—';
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
