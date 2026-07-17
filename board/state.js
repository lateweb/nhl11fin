// board/state.js

/**
 * Shared state for the whiteboard.
 * `placedPlayers` – array of { player, x, y, stickAngle }
 * `placedOpponents` – array of { x, y }
 * `sketches` – array of sketch objects { type, color, points }
 * `_currentSketch` – sketch currently being drawn (private)
 * `goalPosition` – 'bottom' (default) or 'top'
 */

export const placedPlayers = [];
export const placedOpponents = [];
export const sketches = [];
let _currentSketch = null;
export let goalPosition = 'bottom';
export let opponentCount = 0;

// Drawing state
export let drawColor = '#1e293b';
export let drawShape = 'freehand'; // 'freehand', 'line', 'dashed', 'arrow'
export let forceDrawMode = false; // For touch devices

export function setDrawColor(color) { drawColor = color; }
export function setDrawShape(shape) { drawShape = shape; }
export function setForceDrawMode(val) { forceDrawMode = val; }
export function setOpponentCount(count) { opponentCount = count; }

export function resetAll() {
  placedPlayers.length = 0;
  placedOpponents.length = 0;
  sketches.length = 0;
  _currentSketch = null;
}

export function clearDrawings() {
  sketches.length = 0;
  _currentSketch = null;
}

export function undoLastSketch() {
  if (sketches.length > 0) {
    sketches.pop();
  }
}

/* ––– Drawing helpers ––– */
export function startPath(point) {
  _currentSketch = {
    type: drawShape,
    color: drawColor,
    points: [point]
  };
}

export function addPoint(point) {
  if (!_currentSketch) return;
  
  if (_currentSketch.type === 'freehand') {
    _currentSketch.points.push(point);
  } else {
    // For line, dashed, and arrow, we only care about the start point and the current end point
    _currentSketch.points[1] = point;
  }
}

export function endPath() {
  if (_currentSketch && _currentSketch.points.length > 1) {
    sketches.push(_currentSketch);
  }
  _currentSketch = null;
}

export function getCurrentPath() {
  return _currentSketch; // Returns the full sketch object
}

export function setGoalPosition(pos) {
  goalPosition = pos;
}
