// main.js
import { switchRoster, customRosters, activeRosterName } from './data/roster.js';
import { renderPlayerList, renderResults } from './dom/rosterRenderer.js';
import { renderLineupSelectorHTML, attachLineupSelectorEvents } from './dom/components/playerChip.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Read from session storage if a choice was made, otherwise default to "Olympiahybridi"
  const savedName = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('activeRosterName') : null;
  // Validate that the saved name actually exists in customRosters, otherwise use the hard default
  const rosterName = (savedName && customRosters[savedName]) ? savedName : 'Olympiahybridi';
  switchRoster(rosterName);

  // 2. Render initial views
  renderPlayerList();
  renderResults();

  // 3. Setup Lineup Selector
  const lineupContainer = document.getElementById('lineupSelectorContainer');
  if (lineupContainer) {
    const rosterNames = Object.keys(customRosters);
    
    lineupContainer.innerHTML = renderLineupSelectorHTML(rosterNames, activeRosterName);

    attachLineupSelectorEvents(lineupContainer, (selectedName) => {
      switchRoster(selectedName);
      renderResults();
      renderPlayerList();
    });
  }
});
