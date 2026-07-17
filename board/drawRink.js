// board/drawRink.js

export const BOUNDS = {
  left: 100,
  right: 900,
  cornerRadius: 150
};

export const NET = {
  width: 80,
  depth: 30,
  postRadius: 4
};

/**
 * Draws the massive 1000x700 half-rink with precise boundaries and clipping.
 */
export function drawRink(ctx, canvasW, canvasH, goalPosition = 'bottom') {
  ctx.clearRect(0, 0, canvasW, canvasH);

  // Background ice
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.save();
  
  if (goalPosition === 'top') {
    ctx.translate(0, canvasH);
    ctx.scale(1, -1);
  }

  const { left, right, cornerRadius } = BOUNDS;
  const center = canvasW / 2;
  const topY = -50;       // Open top 
  const bottomY = 680;    // Boards bottom
  const blueLineY = 250;  // Blue line
  const redLineY = 80;    // Center red line
  const goalLineY = 620;  // Goal line

  // Create the Board boundary Path
  const boardPath = new Path2D();
  boardPath.moveTo(left, topY);
  boardPath.lineTo(left, bottomY - cornerRadius);
  boardPath.quadraticCurveTo(left, bottomY, left + cornerRadius, bottomY);
  boardPath.lineTo(right - cornerRadius, bottomY);
  boardPath.quadraticCurveTo(right, bottomY, right, bottomY - cornerRadius);
  boardPath.lineTo(right, topY);
  boardPath.closePath();

  ctx.save(); // Save before clipping
  
  // ---> MAGIC CLIP: Everything painted from here on is chopped off perfectly at the boards <---
  ctx.clip(boardPath);

  // Neutral zone shading (stops much closer to blue line)
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(left, topY, right - left, blueLineY - topY);

  // Center Red Line
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(left, redLineY, right - left, 10);

  // Blue line 
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(left, blueLineY, right - left, 12);

  // Red goal line (safely hits corners, cut off by clip)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(left, goalLineY - 3, right - left, 6);

  // Giant Faceoff circles
  // Distance from center = 200, Radius = 80
  drawFaceoffCircle(ctx, center - 200, 450, 80);
  drawFaceoffCircle(ctx, center + 200, 450, 80);

  // Goal crease
  ctx.beginPath();
  ctx.arc(center, goalLineY, 35, Math.PI, 0, false);
  ctx.fillStyle = '#93c5fd';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#dc2626';
  ctx.stroke();

  // Net
  const netX = center - NET.width / 2;
  ctx.beginPath();
  ctx.moveTo(netX, goalLineY);
  ctx.lineTo(netX + 8, goalLineY + NET.depth);
  ctx.quadraticCurveTo(center, goalLineY + NET.depth + 8, netX + NET.width - 8, goalLineY + NET.depth);
  ctx.lineTo(netX + NET.width, goalLineY);
  ctx.fillStyle = 'rgba(203,213,225,0.8)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  // Goal posts
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(netX, goalLineY, NET.postRadius, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(netX + NET.width, goalLineY, NET.postRadius, 0, Math.PI * 2); ctx.fill();

  ctx.restore(); // END CLIPPING

  // Draw the thick board walls on top of everything
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#1e293b';
  ctx.stroke(boardPath);

  ctx.restore(); // END MIRRORING
}

function drawFaceoffCircle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
}
