// board/events.js
import { placedPlayers, placedOpponents, sketches, forceDrawMode } from './state.js';
import { startPath, addPoint, endPath, getCurrentPath } from './state.js';

let dragMode = null; // 'player', 'stick', 'opponent', or 'draw'
let dragTarget = null;
let canvas = null;

// Helper: distance from point (px,py) to line segment (x1,y1)-(x2,y2)
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

function findSketchIndex(pos, threshold = 8) {
  for (let i = sketches.length - 1; i >= 0; i--) {
    const sketch = sketches[i];
    const pts = sketch.points;
    if (!pts || pts.length < 2) continue;

    if (sketch.type === 'freehand') {
      for (let j = 1; j < pts.length; j++) {
        const d = distToSegment(pos.x, pos.y, pts[j - 1].x, pts[j - 1].y, pts[j].x, pts[j].y);
        if (d < threshold) return i;
      }
    } else {
      // Lines, Dashed lines, and Arrows have exactly 2 main anchor points for distance calculation
      const d = distToSegment(pos.x, pos.y, pts[0].x, pts[0].y, pts[1].x, pts[1].y);
      if (d < threshold) return i;
    }
  }
  return -1;
}

export function initEvents(canvasElement, onRedraw) {
  canvas = canvasElement;

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX = e.clientX;
    let clientY = e.clientY;
    
    // Support touch extraction
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return { 
      x: (clientX - rect.left) * scaleX, 
      y: (clientY - rect.top) * scaleY 
    };
  };

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  const handleDown = (e) => {
    // Only prevent default on touch to stop window scrolling while manipulating the board
    if (e.type === 'touchstart') e.preventDefault();
    
    const pos = getPos(e);
    // e.button is undefined on touch, so fallback to true
    const isPrimary = e.type === 'touchstart' || e.button === 0;

    if (isPrimary) {
      if (e.ctrlKey || e.metaKey || forceDrawMode) {
        startPath(pos);
        dragMode = 'draw';
        canvas.style.cursor = 'crosshair';
      } else {
        // Iterate backwards to interact with the top-most unit first
        for (let i = placedPlayers.length - 1; i >= 0; i--) {
          const pp = placedPlayers[i];
          const dCenter = Math.hypot(pp.x - pos.x, pp.y - pos.y);
          
          // 1. Check if grabbed player circle
          if (dCenter <= 22) {
            dragMode = 'player';
            dragTarget = pp;
            canvas.style.cursor = 'grabbing';
            break;
          }

          // 2. Check if grabbed stick line
          const startX = pp.x + Math.cos(pp.stickAngle) * 22;
          const startY = pp.y + Math.sin(pp.stickAngle) * 22;
          const endX = pp.x + Math.cos(pp.stickAngle) * 60; // 60 covers outer limit of the stick
          const endY = pp.y + Math.sin(pp.stickAngle) * 60;
          const dStick = distToSegment(pos.x, pos.y, startX, startY, endX, endY);
          
          // Slightly generous threshold handles fat fingers on touch
          if (dStick <= 20) { 
            dragMode = 'stick';
            dragTarget = pp;
            canvas.style.cursor = 'grabbing';
            break;
          }
        }

        // 3. Check opponents if no player/stick was grabbed
        if (!dragMode) {
          for (let i = placedOpponents.length - 1; i >= 0; i--) {
            const opp = placedOpponents[i];
            const dCenter = Math.hypot(opp.x - pos.x, opp.y - pos.y);
            
            if (dCenter <= 22) {
              dragMode = 'opponent';
              dragTarget = opp;
              canvas.style.cursor = 'grabbing';
              break;
            }
          }
        }
      }
    }
    onRedraw();
  };

  const handleMove = (e) => {
    if (dragMode) {
      if (e.type === 'touchmove') e.preventDefault();
    }
    const pos = getPos(e);

    if (dragMode === 'player' && dragTarget) {
      dragTarget.x = pos.x;
      dragTarget.y = pos.y;
      onRedraw();
    } else if (dragMode === 'stick' && dragTarget) {
      // Spinning the stick around the player
      dragTarget.stickAngle = Math.atan2(pos.y - dragTarget.y, pos.x - dragTarget.x);
      onRedraw();
    } else if (dragMode === 'opponent' && dragTarget) {
      dragTarget.x = pos.x;
      dragTarget.y = pos.y;
      onRedraw();
    } else if (dragMode === 'draw' && getCurrentPath()) {
      if (e.type === 'touchmove' || e.buttons === 1) {
        addPoint(pos);
        onRedraw();
      }
    }
  };

  const handleUp = (e) => {
    if (e.type === 'touchend' || e.type === 'touchcancel' || e.button === 0) {
      if (dragMode === 'draw' && getCurrentPath()) {
        endPath();
      }
      dragMode = null;
      dragTarget = null;
      canvas.style.cursor = 'default';
      onRedraw();
    }
  };

  // Bind Mouse & Touch Events seamlessly
  canvas.addEventListener('mousedown', handleDown);
  canvas.addEventListener('touchstart', handleDown, { passive: false });

  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('touchmove', handleMove, { passive: false });

  canvas.addEventListener('mouseup', handleUp);
  canvas.addEventListener('touchend', handleUp);
  canvas.addEventListener('touchcancel', handleUp);

  canvas.addEventListener('mouseleave', () => {
    if (dragMode === 'draw' && getCurrentPath()) {
      endPath();
    }
    dragMode = null;
    dragTarget = null;
    canvas.style.cursor = 'default';
    onRedraw();
  });

  // Double-click to delete a nearby sketch
  canvas.addEventListener('dblclick', (e) => {
    const pos = getPos(e);
    dragMode = null;
    dragTarget = null;
    if (getCurrentPath()) {
      endPath();
    }
    const idx = findSketchIndex(pos);
    if (idx !== -1) {
      sketches.splice(idx, 1);
    }
    canvas.style.cursor = 'default';
    onRedraw();
  });
}
