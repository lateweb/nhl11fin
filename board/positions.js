// board/positions.js

/**
 * Retrieves the logical tactical position for a role based on the active zone.
 * Instead of mathematically mirroring, the formation shifts structurally between
 * the offensive and defensive zones. Wingers are always positioned "higher" than defensemen.
 */
export function getRolePosition(role, goalPos) {
  const isTop = goalPos === 'top';

  // Base X coordinates (left to right)
  const xMap = {
    lw: 250, c: 500, rw: 750,
    ld: 320, rd: 680,
    g: 500
  };

  // Parse standard role prefix
  let base = 'c';
  if (role.startsWith('lw')) base = 'lw';
  else if (role.startsWith('rw')) base = 'rw';
  else if (role.startsWith('ld')) base = 'ld';
  else if (role.startsWith('rd')) base = 'rd';
  else if (role.startsWith('g')) base = 'g';
  else if (role.startsWith('f_res')) return { x: 150, y: 350 };
  else if (role.startsWith('d_res')) return { x: 850, y: 350 };

  const x = xMap[base] || 500;
  let y = 350;

  if (isTop) {
    // OFFENSIVE ZONE (Attacking top goal at Y=60, blue line is Y=250)
    if (base === 'lw' || base === 'rw') y = 180; // Deep wingers
    if (base === 'c') y = 280;                   // High slot
    if (base === 'ld' || base === 'rd') y = 420; // D-men at the blue line
    if (base === 'g') y = 60;                    // Opposing net
  } else {
    // DEFENSIVE ZONE (Defending bottom goal at Y=620, blue line is Y=250)
    if (base === 'lw' || base === 'rw') y = 380; // Wingers high covering the points
    if (base === 'c') y = 480;                   // Center low supporting D
    if (base === 'ld' || base === 'rd') y = 550; // D-men deep protecting net
    if (base === 'g') y = 620;                   // Own net
  }

  return { x, y };
}
