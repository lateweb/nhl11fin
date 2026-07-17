// dom/rosterRenderer.js

import { RosterDB } from '../data/roster.js';
import { renderGloryView } from './components/gloryView.js';
import { createPlayerCard } from './components/playerCard.js';
import { renderPlayerChips, attachChipEvents } from './components/playerChip.js';

/**
 * Render the results area.
 * If a player name is given, shows that player's card; otherwise shows the full glory view.
 * @param {string|null} selectedPlayerName
 */
 
export function renderResults(selectedPlayerName = null) {
  const resultsDiv = document.getElementById('results');
  
  if (selectedPlayerName) {
    const player = RosterDB.find(p => p.name === selectedPlayerName);
    if (player) {
      resultsDiv.innerHTML = createPlayerCard(player);
    } else {
      resultsDiv.innerHTML = renderGloryView(); // Fallback if player not found
    }
  } else {
    resultsDiv.innerHTML = renderGloryView();
  }
}

/**
 * Render the player selection chips and attach event handlers.
 */
export function renderPlayerList() {
  const listDiv = document.getElementById('playerList');
  listDiv.innerHTML = renderPlayerChips();
  attachChipEvents(listDiv, (playerName) => {
    renderResults(playerName);
  });
}