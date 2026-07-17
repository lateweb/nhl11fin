// dom/components/playerCard.js

import { lineups } from '../../data/roster.js';
import { getPlayerLineupInfo, isGoalie, playerPlaysInLineup } from '../../utils/rosterUtils.js';
import { getJerseyName, renderJerseyHTML } from '../utils/domHelpers.js';
import { createRow, createPPRow, createGoalieRow } from './lineupRow.js';

export function createPlayerCardJersey(player) {
  const jerseyName = getJerseyName(player.name);
  
  return `
    <div class="player-card-jersey-container">
      ${renderJerseyHTML(jerseyName, player.number)}
    </div>`;
}

export function createPlayerCard(player) {
  const { primary, secondary } = getPlayerLineupInfo(player.name);
  const isG = isGoalie(player.name);
  
  const svgLeft = `
    <svg class="shoot-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M 25 5 L 14 26 L 2 26" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="butt" />
    </svg>`;
  
  const svgRight = `
    <svg class="shoot-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M 7 5 L 18 26 L 30 26" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="butt" />
    </svg>`;
  
  let html = `
    <div class="player-card">
      <div class="player-header">
        ${createPlayerCardJersey(player)}
        <div class="role-info-row">
          ${primary ? `<div class="primary-role-box">
            ${player.letter ? `<div class="captain-letter-row">${player.letter}</div>` : ''}
            <div class="primary-pos">${primary.pos}</div>
            <div class="primary-line">${primary.line}</div>
            <div class="player-shoots">
              ${player.shoots === 'R' 
                ? `${svgRight}<span class="clipboard-only">\\_ </span>Right` 
                : `${svgLeft}<span class="clipboard-only">_/ </span>Left`}
            </div>
          </div>` : ''}
          ${secondary.length > 0 ? `<div class="secondary-roles-expanded"><div class="lisäksi-label">Lisäksi:</div>${secondary.map(s => `<div class="sec-role-item-large">${s.line}</div>`).join('')}</div>` : ''}
        </div>
      </div>`;

  if (isG) {
    html += `<div class="lineup-section goalies"><h3>Maalivahdit</h3><div class="lineup-grid"><div class="lineup-block"><div class="formation">${createGoalieRow(player.name)}</div></div></div></div>`;
  } else {
    html += Object.entries(lineups).map(([cat, lines]) => {
      if (cat === 'goalies') return '';
      const linesHtml = lines.filter(l => playerPlaysInLineup(player.name, l)).map(l => {
        const allRoles = [...(l.f || []), ...(l.d || [])];
        // Use PP layout only for power play units (cat === 'pp')
        const formationHTML = cat === 'pp'
          ? createPPRow(allRoles, player.name)
          : `${createRow(l.f, player.name)}${createRow(l.d, player.name)}`;

        return `
          <div class="lineup-block">
            <div class="lineup-header">${l.name}</div>
            <div class="formation">${formationHTML}</div>
          </div>`;
      }).join('');
      if (!linesHtml) return '';
      const titles = { even: '', pp: 'Ylivoima 🔥', pk: 'Alivoima 🧊' };
      return `<div class="lineup-section ${cat}">${titles[cat] ? `<h3>${titles[cat]}</h3>` : ''}<div class="lineup-grid">${linesHtml}</div></div>`;
    }).join('');
  }
  
  html += `</div>`;
  return html;
}
