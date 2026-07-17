// main.js
import { switchRoster } from './data/roster.js';
import { renderPlayerList, renderResults } from './dom/rosterRenderer.js';

document.addEventListener('DOMContentLoaded', () => {
  // Always use the default Olympiahybridi roster
  switchRoster('Olympiahybridi');

  // Render initial views
  renderPlayerList();
  renderResults();
});
