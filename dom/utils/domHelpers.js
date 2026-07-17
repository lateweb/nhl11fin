// dom/utils/domHelpers.js

/**
 * Get jersey name formatted for display.
 * Preserves initial if present (e.g., "T. Ruutu" -> "T. RUUTU").
 * @param {string} playerName
 * @returns {string}
 */
export function getJerseyName(playerName) {
  if (!playerName) return 'â€”';
  return playerName.toUpperCase();
}

/**
 * Generates the standardized HTML for a player's jersey.
 * @param {string} jerseyName 
 * @param {number|string} number 
 * @returns {string} HTML string
 */
export function renderJerseyHTML(jerseyName, number) {
  return `
    <div class="player-card-jersey">
      <div class="jersey-name">${jerseyName}</div>
      <div class="jersey-number">${number}</div>
    </div>`;
}
