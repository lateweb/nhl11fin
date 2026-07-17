// board/main.js
import { drawRink } from './drawRink.js';
import { placedPlayers, placedOpponents, sketches, getCurrentPath, goalPosition } from './state.js';
import { initEvents } from './events.js';
import {
  attachActionButtons,
  buildComboDropdown,
  placeUnitsOnRink,
  placeOpponents
} from './ui.js';
import { switchRoster } from '../data/roster.js';

const canvas = document.getElementById('whiteboardCanvas');
const ctx = canvas.getContext('2d');

// Helper to draw a single sketch object (freehand, line, dashed, or arrow)
function drawSketch(ctx, sketch) {
  const pts = sketch.points;
  if (!pts || pts.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = sketch.color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (sketch.type === 'freehand') {
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
  } else if (sketch.type === 'line') {
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.stroke();
  } else if (sketch.type === 'dashed') {
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash immediately so it doesn't leak
  } else if (sketch.type === 'arrow') {
    const start = pts[0];
    const end = pts[1];
    
    // Draw main line
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const headlen = 15;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(end.x, end.y);
    ctx.fillStyle = sketch.color;
    ctx.fill();
  }
}

export function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRink(ctx, canvas.width, canvas.height, goalPosition);

  // Draw all completed sketches
  for (const sketch of sketches) {
    drawSketch(ctx, sketch);
  }

  // Current ongoing sketch
  const current = getCurrentPath();
  if (current) {
    drawSketch(ctx, current);
  }

  // Draw opponents (red circles, no sticks)
  placedOpponents.forEach(opp => {
    ctx.beginPath();
    ctx.arc(opp.x, opp.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444'; // Red body
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw players and their rotatable sticks
  placedPlayers.forEach(pp => {
    // 1. Draw the Stick (Extends strictly outward from the edge of the circle)
    const stickLength = 35; 
    const stickStartX = pp.x + Math.cos(pp.stickAngle) * 22;
    const stickStartY = pp.y + Math.sin(pp.stickAngle) * 22;
    const stickEndX = pp.x + Math.cos(pp.stickAngle) * (22 + stickLength);
    const stickEndY = pp.y + Math.sin(pp.stickAngle) * (22 + stickLength);

    // Stick Shaft
    ctx.beginPath();
    ctx.moveTo(stickStartX, stickStartY);
    ctx.lineTo(stickEndX, stickEndY);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Stick Knob (Tape at the end of the stick)
    ctx.beginPath();
    ctx.arc(stickEndX, stickEndY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Draw the Player Circle on top
    ctx.beginPath();
    ctx.arc(pp.x, pp.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Number
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pp.player.number, pp.x, pp.y);
    
    // Name below
    ctx.fillStyle = '#000';
    ctx.font = '11px "Segoe UI"';
    ctx.fillText(pp.player.name, pp.x, pp.y + 30);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Always use the default Olympiahybridi roster
  switchRoster('Olympiahybridi');
  buildComboDropdown();
  placeUnitsOnRink();
  placeOpponents();
  redraw();

  attachActionButtons();
  initEvents(canvas, redraw);
});
