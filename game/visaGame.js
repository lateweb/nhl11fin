// game/visaGame.js
import { switchRoster, customRosters, activeRosterName } from '../data/roster.js';
import { startGame } from './render.js';

// Read the roster the user chose on the main page, and load it into the database
const savedName = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('activeRosterName') : null;
// Validate saved name, otherwise fall back to the default roster (Olympiahybridi)
const rosterName = (savedName && customRosters[savedName]) ? savedName : activeRosterName;
switchRoster(rosterName);

startGame();
