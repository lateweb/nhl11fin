// game/visaGame.js
import { switchRoster } from '../data/roster.js';
import { startGame } from './render.js';

// Read the roster the user chose on the main page, and load it into the database
const savedName = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('activeRosterName') : null;
switchRoster(savedName || 'In MM12 We Trust');

startGame();