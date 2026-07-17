// board/ui.js
import { switchRoster, customRosters, activeRosterName, lineups } from '../data/roster.js';
import { findPlayerInRole } from '../utils/rosterUtils.js';
import { placedPlayers, placedOpponents, opponentCount, setOpponentCount, sketches, resetAll, clearDrawings, undoLastSketch, goalPosition, setGoalPosition, setDrawColor, setDrawShape, setForceDrawMode } from './state.js';
import { getRolePosition } from './positions.js';
import { redraw } from './main.js';

/* ––– Helper: map combo name → array of role keys ––– */
function getRolesForCombo(comboName) {
  const evenMatch = comboName.match(/^H(\d+)\+P(\d+)$/);
  if (evenMatch) {
    const fwdIdx = evenMatch[1];
    const defIdx = evenMatch[2];
    const fwdLine = lineups.even.find(l => l.f && l.name === `H${fwdIdx}`);
    const defPair = lineups.even.find(l => l.d && l.name === `P${defIdx}`);
    if (!fwdLine || !defPair) return [];
    return [...fwdLine.f, ...defPair.d];
  }
  const ppUnit = lineups.pp.find(l => l.name === comboName);
  if (ppUnit) return ppUnit.roles || (ppUnit.f || []).concat(ppUnit.d || []);
  const pkUnit = lineups.pk.find(l => l.name === comboName);
  if (pkUnit) return pkUnit.roles || (pkUnit.f || []).concat(pkUnit.d || []);
  return [];
}

/* ––– Build the combo dropdown ––– */
export function buildComboDropdown() {
  const select = document.getElementById('comboSelect');
  if (!select) return;
  select.innerHTML = '';

  const evenFwd = lineups.even.filter(l => l.f && l.name.startsWith('H')).map(l => l.name).sort();
  const evenDef = lineups.even.filter(l => l.d && l.name.startsWith('P')).map(l => l.name).sort();

  evenFwd.forEach(fwd => {
    evenDef.forEach(def => {
      const opt = document.createElement('option');
      opt.value = `${fwd}+${def}`;
      opt.textContent = `${fwd}+${def}`;
      select.appendChild(opt);
    });
  });

  lineups.pp.map(l => l.name).sort().forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });

  lineups.pk.map(l => l.name).sort().forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });

  select.addEventListener('change', placeSelectedCombo);
}

/* ––– Place the selected combo on the rink ––– */
function placeSelectedCombo() {
  const select = document.getElementById('comboSelect');
  if (!select) return;
  const comboName = select.value;
  const roles = getRolesForCombo(comboName);
  if (roles.length === 0) return;

  placedPlayers.length = 0;
  const addedIds = new Set();

  roles.forEach(role => {
    const player = findPlayerInRole(role);
    if (player && !addedIds.has(player.number)) {
      addedIds.add(player.number);
      
      const pos = getRolePosition(role, goalPosition);
      // Determine initial stick angle (0 rad = right, PI rad = left)
      const stickAngle = player.shoots === 'R' ? 0 : Math.PI;
      
      placedPlayers.push({ player, x: pos.x, y: pos.y, stickAngle });
    }
  });
  redraw();
}

export function initRosterSelector() {
  const container = document.getElementById('rosterSelectorContainer');
  if (!container) return;

  const select = document.createElement('select');
  select.id = 'rosterSelect';
  select.style.width = '100%';
  const rosterNames = Object.keys(customRosters);
  rosterNames.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    if (name === activeRosterName) opt.selected = true;
    select.appendChild(opt);
  });

  container.innerHTML = '';
  container.appendChild(select);

  select.addEventListener('change', (e) => {
    switchRoster(e.target.value);
    placeSelectedCombo();
  });
}

export function placeOpponents() {
  const isTop = goalPosition === 'top';
  
  // Tactical default positions for opponents dynamically reacting to current active zone
  const defaultPositions = isTop ? [
    { x: 500, y: 200 }, // C
    { x: 400, y: 150 }, // LD
    { x: 600, y: 150 }, // RD
    { x: 300, y: 250 }, // LW
    { x: 700, y: 250 }  // RW
  ] : [
    { x: 500, y: 400 }, // C
    { x: 350, y: 220 }, // LD
    { x: 650, y: 220 }, // RD
    { x: 300, y: 450 }, // LW
    { x: 700, y: 450 }  // RW
  ];

  // If user increased slider, we pop in new red circles neatly without touching their already moved ones
  while (placedOpponents.length < opponentCount) {
    const i = placedOpponents.length;
    placedOpponents.push({ x: defaultPositions[i].x, y: defaultPositions[i].y });
  }
  
  // If user decreased slider, we remove from the back
  while (placedOpponents.length > opponentCount) {
    placedOpponents.pop();
  }
}

export function placeUnitsOnRink() {
  placeSelectedCombo();
}

export function handleClearDrawings() {
  clearDrawings();
  redraw();
}

export function attachActionButtons() {
  const btnClearDrawings = document.getElementById('btnClearDrawings');
  if (btnClearDrawings) {
    btnClearDrawings.addEventListener('click', handleClearDrawings);
  }

  const btnUndo = document.getElementById('btnUndo');
  if (btnUndo) {
    btnUndo.addEventListener('click', () => {
      undoLastSketch();
      redraw();
    });
  }

  // Handle Ctrl+Z for undo
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      undoLastSketch();
      redraw();
    }
  });

  const goalSelect = document.getElementById('goalSelect');
  if (goalSelect) {
    goalSelect.addEventListener('change', (e) => {
      setGoalPosition(e.target.value);
      clearDrawings(); // Drawings don't make sense if tactical zone shifts
      
      // Mirror existing opponents seamlessly across the centerline
      placedOpponents.forEach(opp => {
        opp.y = 700 - opp.y;
      });
      
      placeUnitsOnRink();
    });
  }

  const oppSlider = document.getElementById('opponentSlider');
  const oppCountDisplay = document.getElementById('opponentCountDisplay');
  if (oppSlider) {
    oppSlider.addEventListener('input', (e) => {
      const count = parseInt(e.target.value, 10);
      if (oppCountDisplay) oppCountDisplay.textContent = count;
      setOpponentCount(count);
      placeOpponents();
      redraw();
    });
  }

  const chkForceDraw = document.getElementById('forceDrawMode');
  if (chkForceDraw) {
    chkForceDraw.addEventListener('change', (e) => {
      setForceDrawMode(e.target.checked);
    });
  }

  // Set up the drawing tools palette listeners
  const toolBtns = document.querySelectorAll('.tool-btn');
  toolBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      toolBtns.forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      setDrawShape(target.dataset.shape);
    });
  });

  const colorBtns = document.querySelectorAll('.color-btn');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      colorBtns.forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      setDrawColor(target.dataset.color);
    });
  });
}
