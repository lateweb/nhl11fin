// game/history.js
import { getRandomPlayer } from './utils.js';

/* =============================================
   HISTORY BUFFERS + CONSTANTS
   Designed for perfect replayability:
   - Never repeats the same player too soon
   - Types rotate very fairly (no long droughts)
   - Exact same question never appears twice in one game
   - Full reset on "Play again" so every new game feels fresh
   ============================================= */

// Active question types only (pp/pk removed — they have no generator functions)
const ALL_QUESTION_TYPES = [
  'number',
  'name',
  'line',
  'oddone',
  'shoots'
];

// Dynamic max = total types - 1 → after 4 different types the 5th is forced
// This creates natural round-robin rotation without feeling robotic
const MAX_PLAYER_HISTORY   = 3;   // avoid same player in ~4 questions
const MAX_TYPE_HISTORY     = ALL_QUESTION_TYPES.length - 1; // = 4
const MAX_QUESTION_HISTORY = 50;  // more than enough for one full game

// Buffers
const recentPlayers     = [];
const recentTypes       = [];
const recentQuestionIds = [];

/* =============================================
   CORE FUNCTIONS
   ============================================= */

export function updateHistory(playerName, type, questionId = null) {
  // Player avoidance
  recentPlayers.push(playerName);
  if (recentPlayers.length > MAX_PLAYER_HISTORY) recentPlayers.shift();

  // Type rotation (this is what makes the quiz feel fair)
  recentTypes.push(type);
  if (recentTypes.length > MAX_TYPE_HISTORY) recentTypes.shift();

  // Exact question deduplication
  if (questionId !== null) {
    recentQuestionIds.push(questionId);
    if (recentQuestionIds.length > MAX_QUESTION_HISTORY) recentQuestionIds.shift();
  }
}

export function isQuestionRecentlyUsed(questionId) {
  if (!questionId) return false;
  return recentQuestionIds.includes(questionId);
}

/**
 * Picks a player who hasn't appeared in the last N questions
 * Falls back gracefully if every player was recently used
 */
export function getPlayerAvoidingRecent(options = {}, attempts = 10) {
  for (let i = 0; i < attempts; i++) {
    const player = getRandomPlayer(options);
    if (player && !recentPlayers.includes(player.name)) {
      return player;
    }
  }
  // fallback (rare)
  return getRandomPlayer(options);
}

/**
 * Gold-standard type selector:
 * 1. Prefer any type that hasn't been used recently
 * 2. When all types have been used (only happens after 5 questions), pick randomly
 * With MAX_TYPE_HISTORY = 4 and 5 types → the quiz naturally cycles through every type
 */
export function getQuestionTypeAvoidingRecent() {
  const available = ALL_QUESTION_TYPES.filter(t => !recentTypes.includes(t));

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // fallback (very rare with our settings)
  return ALL_QUESTION_TYPES[Math.floor(Math.random() * ALL_QUESTION_TYPES.length)];
}

/**
 * Full reset — call this every time the player clicks "Pelaa uudelleen"
 * Without this, second game would remember players/types from first game → feels stale
 */
export function resetAllHistory() {
  recentPlayers.length     = 0;
  recentTypes.length       = 0;
  recentQuestionIds.length = 0;
}

export function clearQuestionHistory() {
  recentQuestionIds.length = 0;
}
