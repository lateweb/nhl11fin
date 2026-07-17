// game/visaGame.js
import { switchRoster } from '../data/roster.js';
import { startGame } from './render.js';

// Always use the default Olympiahybridi roster
switchRoster('Olympiahybridi');

startGame();
