/* ElectroCalc — script.js (with visual diagrams) */

const K = 8.99e9;     // Coulomb's constant (N·m²/C²)
const E = 1.602e-19;  // Elementary charge  (C)

/* ── NAVIGATION ── */
function navigateTo(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');
  const link = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
  if (link) link.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('navLinks').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); navigateTo(link.dataset.section); });
  });
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });
  const hash = window.location.hash.replace('#', '');
  if (hash) navigateTo(hash);
  spInit();
});

/* ── UTILITIES ── */
function val(id) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? null : v;
}

function fmt(num) {
  if (num === 0) return '0';
  const abs = Math.abs(num);
  if (abs >= 1e6 || abs < 1e-3) return num.toExponential(4);
  return parseFloat(num.toPrecision(6)).toString();
}

function showSuccess(boxId, label, value, unit, explain, steps = []) {
  const box = document.getElementById(boxId);
  box.className = 'result-box success';
  const stepsHTML = steps.length
    ? `<ul class="result-steps">${steps.map(s => `<li>${s}</li>`).join('')}</ul>` : '';
  box.innerHTML = `
    <div class="result-label">Result — ${label}</div>
    <span class="result-value">${fmt(value)} ${unit}</span>
    <div class="result-explain">${explain}</div>
    ${stepsHTML}`;
}

function showError(boxId, message) {
  const box = document.getElementById(boxId);
  box.className = 'result-box error';
  box.innerHTML = `⚠️ ${message}`;
}

/* ── DIAGRAM HELPERS ── */
function insertDiagram(afterBoxId, diagramId, svgHTML) {
  // Remove existing diagram if present
  const existing = document.getElementById(diagramId);
  if (existing) existing.remove();

  const afterEl = document.getElementById(afterBoxId);
  if (!afterEl) return;

  const wrapper = document.createElement('div');
  wrapper.id = diagramId;
  wrapper.className = 'calc-diagram-wrap';
  wrapper.style.cssText = `
    margin-top: 1rem;
    background: #fffde7;
    border: 2.5px dashed #ffb830;
    border-radius: 16px;
    padding: 1rem;
    animation: popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
    overflow: hidden;
  `;
  wrapper.innerHTML = `
    <div style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#2196f3;margin-bottom:0.5rem;">📊 Visual Diagram</div>
    ${svgHTML}
  `;
  afterEl.insertAdjacentElement('afterend', wrapper);
}

/* ══════════════════════════════════════════════════
   DIAGRAM GENERATORS
   ══════════════════════════════════════════════════ */

/* Ohm's Law Triangle Diagram */
function diagramOhm(V, I, R, solved) {
  const highlight = (sym) => solved === sym
    ? `style="fill:#e8f5e9;stroke:#00c853;stroke-width:2.5"`
    : `style="fill:#e3f2fd;stroke:#2196f3;stroke-width:1.5"`;
  const tColor = (sym) => solved === sym ? '#1b5e20' : '#0d47a1';

  // Triangle with V on top, I bottom-left, R bottom-right
  const svgW = 420, svgH = 200;
  const cx = svgW / 2;

  const vVal = V !== null ? fmt(V) + ' V' : '?';
  const iVal = I !== null ? fmt(I) + ' A' : '?';
  const rVal = R !== null ? fmt(R) + ' Ω' : '?';

  return `<svg width="100%" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <!-- Dividing lines inside triangle -->
    <polygon points="${cx},20 60,170 360,170" fill="#fff9c4" stroke="#ffb830" stroke-width="2"/>
    <line x1="${cx}" y1="20" x2="${cx}" y2="170" stroke="#ffb830" stroke-width="1.5" stroke-dasharray="4,3"/>
    <line x1="60" y1="170" x2="360" y2="170" stroke="#ffb830" stroke-width="2"/>

    <!-- V segment (top) -->
    <polygon points="${cx},28 115,162 305,162" ${highlight('V')}/>
    <text x="${cx}" y="105" text-anchor="middle" font-family="Fredoka One,cursive" font-size="22" fill="${tColor('V')}">V</text>
    <text x="${cx}" y="128" text-anchor="middle" font-family="Nunito,sans-serif" font-size="12" font-weight="700" fill="${tColor('V')}">${vVal}</text>

    <!-- I segment (bottom-left) -->
    <polygon points="68,162 ${cx - 4},162 ${cx - 4},172 68,172" style="fill:transparent"/>
    <rect x="68" y="162" width="${cx - 68 - 4}" height="0" fill="transparent"/>
    <!-- I label area -->
    <rect x="68" y="130" width="130" height="40" rx="8" ${highlight('I')}/>
    <text x="133" y="147" text-anchor="middle" font-family="Fredoka One,cursive" font-size="18" fill="${tColor('I')}">I</text>
    <text x="133" y="163" text-anchor="middle" font-family="Nunito,sans-serif" font-size="11" font-weight="700" fill="${tColor('I')}">${iVal}</text>

    <!-- R label area -->
    <rect x="${cx + 10}" y="130" width="130" height="40" rx="8" ${highlight('R')}/>
    <text x="${cx + 75}" y="147" text-anchor="middle" font-family="Fredoka One,cursive" font-size="18" fill="${tColor('R')}">R</text>
    <text x="${cx + 75}" y="163" text-anchor="middle" font-family="Nunito,sans-serif" font-size="11" font-weight="700" fill="${tColor('R')}">${rVal}</text>

    <!-- Formula label -->
    <text x="${cx}" y="190" text-anchor="middle" font-family="Fredoka One,cursive" font-size="13" fill="#ff6d00">V = I × R</text>

    <!-- Solved badge -->
    <rect x="${svgW - 110}" y="8" width="100" height="22" rx="11" fill="#00c853"/>
    <text x="${svgW - 60}" y="23" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="800" fill="#fff">✓ SOLVED: ${solved}</text>
  </svg>`;
}

/* Power Triangle Diagram */
function diagramPower(P, V, I, R, method) {
  const svgW = 440, svgH = 220;

  const methodLabels = {
    'VI':  ['P = V × I', '#2196f3'],
    'I2R': ['P = I² × R', '#9c27b0'],
    'V2R': ['P = V² / R', '#ff6d00'],
  };
  const [formula, color] = methodLabels[method] || ['P = V × I', '#2196f3'];

  const row = (sym, val, unit, hi) => `
    <rect x="30" y="${hi}" width="380" height="38" rx="8" fill="${hi % 76 === 0 ? '#e3f2fd' : '#e8f5e9'}" stroke="${hi % 76 === 0 ? '#2196f3' : '#00c853'}" stroke-width="1.5"/>
    <text x="80" y="${hi + 24}" font-family="Fredoka One,cursive" font-size="18" fill="#0d47a1">${sym}</text>
    <text x="200" y="${hi + 24}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="13" font-weight="700" fill="#1a1a2e">${val !== null ? fmt(val) : '—'}</text>
    <text x="370" y="${hi + 24}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="11" font-weight="700" fill="#9090b0">${unit}</text>`;

  return `<svg width="100%" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <!-- Header -->
    <rect x="30" y="8" width="380" height="30" rx="8" fill="${color}" opacity="0.12"/>
    <text x="220" y="28" text-anchor="middle" font-family="Fredoka One,cursive" font-size="14" fill="${color}">${formula}</text>

    ${row('P', P, 'Watts (W)', 50)}
    ${row('V', V, 'Volts (V)', 95)}
    ${row('I', I, 'Amperes (A)', 140)}
    ${R !== null ? row('R', R, 'Ohms (Ω)', 185) : ''}

    <!-- Power bar visual -->
    <rect x="30" y="${R !== null ? 195 : 150}" width="380" height="0" fill="none"/>
    <text x="220" y="${svgH - 8}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#9090b0">Result: P = ${fmt(P)} W</text>
  </svg>`;
}

/* Coulomb's Law diagram — two charge balls with force arrows */
function diagramCoulomb(q1, q2, r, F) {
  const svgW = 480, svgH = 160;
  const attractive = (q1 * q2) < 0;
  const c1 = q1 >= 0 ? '#f44336' : '#2196f3';
  const c2 = q2 >= 0 ? '#f44336' : '#2196f3';
  const l1 = q1 >= 0 ? '+' : '−';
  const l2 = q2 >= 0 ? '+' : '−';
  const arrowDir = attractive ? '←  →' : '→  ←';
  const forceColor = attractive ? '#00c853' : '#ff6d00';

  // Arrow direction: attractive = arrows point toward each other, repulsive = away
  const arr1x2 = attractive ? 120 : 80;
  const arr1x1 = attractive ? 80 : 120;
  const arr2x1 = attractive ? 360 : 400;
  const arr2x2 = attractive ? 400 : 360;

  return `<svg width="100%" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <defs>
      <marker id="fwd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </marker>
    </defs>

    <!-- Distance line -->
    <line x1="120" y1="80" x2="360" y2="80" stroke="#ccc" stroke-width="1" stroke-dasharray="5,4"/>
    <text x="240" y="72" text-anchor="middle" font-family="Nunito,sans-serif" font-size="11" font-weight="700" fill="#9090b0">r = ${fmt(r)} m</text>

    <!-- Charge q1 -->
    <circle cx="100" cy="80" r="32" fill="${c1}" opacity="0.85"/>
    <text x="100" y="74" text-anchor="middle" font-family="Fredoka One,cursive" font-size="22" fill="#fff">${l1}</text>
    <text x="100" y="125" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#4a4a6a">q₁ = ${fmt(q1)} C</text>

    <!-- Charge q2 -->
    <circle cx="380" cy="80" r="32" fill="${c2}" opacity="0.85"/>
    <text x="380" y="74" text-anchor="middle" font-family="Fredoka One,cursive" font-size="22" fill="#fff">${l2}</text>
    <text x="380" y="125" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#4a4a6a">q₂ = ${fmt(q2)} C</text>

    <!-- Force arrows -->
    <line x1="${arr1x1}" y1="80" x2="${arr1x2}" y2="80" stroke="${forceColor}" stroke-width="2.5" marker-end="url(#fwd)"/>
    <line x1="${arr2x2}" y1="80" x2="${arr2x1}" y2="80" stroke="${forceColor}" stroke-width="2.5" marker-end="url(#fwd)"/>

    <!-- F label -->
    <rect x="175" y="88" width="130" height="28" rx="6" fill="${forceColor}" opacity="0.12" stroke="${forceColor}" stroke-width="1.5"/>
    <text x="240" y="106" text-anchor="middle" font-family="Fredoka One,cursive" font-size="13" fill="${forceColor}">F = ${fmt(Math.abs(F))} N  (${attractive ? 'attractive' : 'repulsive'})</text>

    <!-- Legend -->
    <circle cx="30" cy="148" r="6" fill="#f44336"/><text x="40" y="152" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#4a4a6a">+ charge</text>
    <circle cx="110" cy="148" r="6" fill="#2196f3"/><text x="120" y="152" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#4a4a6a">− charge</text>
    <line x1="190" y1="148" x2="215" y2="148" stroke="${forceColor}" stroke-width="2" marker-end="url(#fwd)"/>
    <text x="220" y="152" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="${forceColor}">Force direction</text>
  </svg>`;
}

/* Electric Field diagram */
function diagramEfield(E_val, method, Q, r, F, q) {
  const svgW = 480, svgH = 180;

  if (method === 'fq') {
    // Show a test charge with force arrow and E field indication
    const fieldDir = (F >= 0 && q > 0) || (F < 0 && q < 0) ? 1 : -1;
    const arrowEnd = fieldDir > 0 ? 370 : 110;
    const arrowStart = fieldDir > 0 ? 260 : 220;

    return `<svg width="100%" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
      <defs><marker id="earr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>

      <!-- Field lines (horizontal) -->
      ${[40, 70, 100, 130].map(y => `
        <line x1="30" y1="${y}" x2="440" y2="${y}" stroke="#e3f2fd" stroke-width="8" stroke-linecap="round"/>
        <line x1="30" y1="${y}" x2="440" y2="${y}" stroke="#2196f3" stroke-width="1.5" stroke-dasharray="8,5" marker-end="url(#earr)"/>
      `).join('')}

      <!-- Test charge -->
      <circle cx="240" cy="85" r="28" fill="#ff4d9e" stroke="#ad1457" stroke-width="2"/>
      <text x="240" y="79" text-anchor="middle" font-family="Fredoka One,cursive" font-size="18" fill="#fff">${q >= 0 ? '+' : '−'}</text>
      <text x="240" y="125" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#4a4a6a">q = ${fmt(q)} C</text>

      <!-- Force arrow on test charge -->
      <line x1="${arrowStart}" y1="85" x2="${arrowEnd}" y2="85" stroke="#00c853" stroke-width="3" marker-end="url(#earr)"/>

      <!-- Labels -->
      <text x="240" y="155" text-anchor="middle" font-family="Fredoka One,cursive" font-size="13" fill="#2196f3">E = F / q = ${fmt(Math.abs(F))} / ${fmt(Math.abs(q))} = ${fmt(E_val)} N/C</text>
      <text x="30" y="175" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#9090b0">→ Electric field direction</text>
      <text x="280" y="175" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#00c853">→ Force on charge</text>
    </svg>`;
  } else {
    // Point charge with radial field lines
    const cx = 240, cy = 90;
    const isPositive = Q >= 0;
    const chargeColor = isPositive ? '#f44336' : '#2196f3';
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];

    const lines = angles.map(deg => {
      const rad = deg * Math.PI / 180;
      const x1 = isPositive ? cx + 32 * Math.cos(rad) : cx + 70 * Math.cos(rad);
      const y1 = isPositive ? cy + 32 * Math.sin(rad) : cy + 70 * Math.sin(rad);
      const x2 = isPositive ? cx + 70 * Math.cos(rad) : cx + 32 * Math.cos(rad);
      const y2 = isPositive ? cy + 70 * Math.sin(rad) : cy + 32 * Math.sin(rad);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${chargeColor}" stroke-width="1.5" marker-end="url(#earr)" opacity="0.7"/>`;
    }).join('');

    return `<svg width="100%" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
      <defs><marker id="earr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>

      <!-- Radial field lines -->
      ${lines}

      <!-- Distance indicator -->
      <line x1="${cx}" y1="${cy}" x2="${cx + 100}" y2="${cy}" stroke="#9090b0" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="${cx + 50}" y="${cy - 6}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#9090b0">r = ${fmt(r)} m</text>
      <circle cx="${cx + 100}" cy="${cy}" r="6" fill="#ff4d9e" stroke="#ad1457" stroke-width="1.5"/>
      <text x="${cx + 100}" y="${cy + 20}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="9" font-weight="700" fill="#4a4a6a">point P</text>

      <!-- Source charge -->
      <circle cx="${cx}" cy="${cy}" r="28" fill="${chargeColor}" opacity="0.9"/>
      <text x="${cx}" y="${cy - 3}" text-anchor="middle" font-family="Fredoka One,cursive" font-size="18" fill="#fff">${isPositive ? '+' : '−'}</text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="9" fill="#fff" font-weight="700">Q</text>

      <text x="${svgW / 2}" y="160" text-anchor="middle" font-family="Fredoka One,cursive" font-size="13" fill="${chargeColor}">E = kQ/r² = ${fmt(E_val)} N/C at r = ${fmt(r)} m</text>
      <text x="${svgW / 2}" y="175" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#9090b0">${isPositive ? 'Field radiates outward from positive charge' : 'Field points inward toward negative charge'}</text>
    </svg>`;
  }
}

/* Electric Charge diagram — electron count visualization */
function diagramCharge(Q, n) {
  const svgW = 480, svgH = 170;
  const displayN = Math.min(Math.round(n), 50); // cap for visual
  const cols = 10;
  const rows = Math.ceil(displayN / cols);
  const dotSize = 10, gap = 18;
  const startX = (svgW - (cols * gap)) / 2;
  const startY = 30;

  let dots = '';
  for (let i = 0; i < displayN; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = startX + col * gap;
    const cy = startY + row * gap;
    dots += `<circle cx="${cx}" cy="${cy}" r="${dotSize / 2}" fill="#2196f3" opacity="0.75"/>`;
  }

  const caption = n > 50
    ? `(showing 50 of ${fmt(n)} electrons)`
    : `${displayN} electron${displayN !== 1 ? 's' : ''}`;

  return `<svg width="100%" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <!-- Electron dots -->
    ${dots}

    <!-- Labels -->
    <text x="${svgW / 2}" y="${startY + rows * gap + 20}" text-anchor="middle" font-family="Fredoka One,cursive" font-size="13" fill="#2196f3">${caption}</text>
    <text x="${svgW / 2}" y="${startY + rows * gap + 38}" text-anchor="middle" font-family="Fredoka One,cursive" font-size="13" fill="#00c853">Total charge Q = ${fmt(Math.abs(Q))} C</text>
    <text x="${svgW / 2}" y="${startY + rows * gap + 54}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#9090b0">Q = n × e  |  e = 1.602×10⁻¹⁹ C per electron</text>

    <!-- Single electron legend -->
    <circle cx="30" cy="155" r="5" fill="#2196f3" opacity="0.75"/>
    <text x="40" y="159" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#4a4a6a">= 1 electron (1.602×10⁻¹⁹ C)</text>
  </svg>`;
}

/* Magnetic Force — Wire diagram */
function diagramMagWire(B, I, L, theta, F) {
  const svgW = 480, svgH = 200;
  const sinT = Math.sin(theta * Math.PI / 180);

  // Wire runs horizontally; B field shown as dots (out of page) or crosses (into page)
  const fieldOut = true; // assume field out of page for visual
  const wireY = 100;
  const wireX1 = 80, wireX2 = 360;

  // Dots for B field (out of page)
  let fieldDots = '';
  for (let x = 50; x < svgW - 20; x += 45) {
    for (let y = 30; y < svgH - 30; y += 45) {
      fieldDots += `<circle cx="${x}" cy="${y}" r="3" fill="#9c27b0" opacity="0.25"/>
      <circle cx="${x}" cy="${y}" r="1" fill="#9c27b0" opacity="0.5"/>`;
    }
  }

  // Current arrow direction (left to right)
  const currentArrowX = (wireX1 + wireX2) / 2;

  // Force direction (upward for typical case with B out, I rightward)
  const forceY2 = theta > 0 && theta < 180 ? wireY - 55 : wireY + 55;

  return `<svg width="100%" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <defs>
      <marker id="carr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker>
    </defs>

    <!-- B field dots (out of page) -->
    ${fieldDots}

    <!-- Wire -->
    <rect x="${wireX1}" y="${wireY - 6}" width="${wireX2 - wireX1}" height="12" rx="6" fill="#ff6d00" opacity="0.9"/>

    <!-- Current arrow -->
    <line x1="${currentArrowX - 30}" y1="${wireY}" x2="${currentArrowX + 30}" y2="${wireY}" stroke="#fff" stroke-width="2" marker-end="url(#carr)"/>
    <text x="${currentArrowX}" y="${wireY + 20}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#ff6d00">I = ${fmt(I)} A →</text>

    <!-- Length label -->
    <text x="${(wireX1 + wireX2) / 2}" y="${wireY - 12}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#4a4a6a">L = ${fmt(L)} m</text>

    <!-- Force arrow (F = BIL sinθ) -->
    ${sinT > 0.01 ? `
    <line x1="${currentArrowX}" y1="${wireY - 8}" x2="${currentArrowX}" y2="${wireY - 55}" stroke="#00c853" stroke-width="3" marker-end="url(#carr)"/>
    <text x="${currentArrowX + 8}" y="${wireY - 30}" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#00c853">F = ${fmt(F)} N</text>
    ` : `<text x="${currentArrowX}" y="${wireY - 20}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#f44336">F = 0 N (parallel to B)</text>`}

    <!-- B field label -->
    <text x="20" y="20" font-family="Fredoka One,cursive" font-size="12" fill="#9c27b0">B = ${fmt(B)} T</text>
    <text x="20" y="35" font-family="Nunito,sans-serif" font-size="9" font-weight="700" fill="#9c27b0">(out of page ⊙)</text>

    <!-- Angle label -->
    <text x="${svgW - 10}" y="${wireY}" text-anchor="end" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#4a4a6a">θ = ${theta}°</text>

    <!-- Formula -->
    <text x="${svgW / 2}" y="${svgH - 8}" text-anchor="middle" font-family="Fredoka One,cursive" font-size="13" fill="#ff6d00">F = BIL sin θ = ${fmt(B)} × ${fmt(I)} × ${fmt(L)} × ${fmt(sinT).slice(0, 5)} = ${fmt(F)} N</text>
  </svg>`;
}

/* Magnetic Force — Moving charge diagram */
function diagramMagCharge(q, v, B, theta, F) {
  const svgW = 480, svgH = 190;
  const sinT = Math.sin(theta * Math.PI / 180);
  const chargeColor = q >= 0 ? '#f44336' : '#2196f3';
  const chargeSign = q >= 0 ? '+' : '−';
  const cx = 240, cy = 100;

  let fieldDots = '';
  for (let x = 30; x < svgW - 10; x += 45) {
    for (let y = 20; y < svgH - 20; y += 45) {
      fieldDots += `<circle cx="${x}" cy="${y}" r="3" fill="#9c27b0" opacity="0.2"/>
      <circle cx="${x}" cy="${y}" r="1" fill="#9c27b0" opacity="0.45"/>`;
    }
  }

  return `<svg width="100%" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <defs>
      <marker id="marr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker>
    </defs>

    <!-- B field dots -->
    ${fieldDots}

    <!-- Charge particle -->
    <circle cx="${cx}" cy="${cy}" r="24" fill="${chargeColor}" opacity="0.9"/>
    <text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="Fredoka One,cursive" font-size="22" fill="#fff">${chargeSign}</text>

    <!-- Velocity arrow (rightward) -->
    <line x1="${cx + 26}" y1="${cy}" x2="${cx + 80}" y2="${cy}" stroke="#ff6d00" stroke-width="2.5" marker-end="url(#marr)"/>
    <text x="${cx + 100}" y="${cy + 4}" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#ff6d00">v = ${fmt(v)} m/s</text>

    <!-- Force arrow (upward) -->
    ${sinT > 0.01 ? `
    <line x1="${cx}" y1="${cy - 26}" x2="${cx}" y2="${cy - 75}" stroke="#00c853" stroke-width="3" marker-end="url(#marr)"/>
    <text x="${cx + 8}" y="${cy - 48}" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#00c853">F = ${fmt(F)} N</text>
    ` : `<text x="${cx}" y="${cy - 35}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#f44336">F = 0 (parallel)</text>`}

    <!-- B field label -->
    <text x="20" y="18" font-family="Fredoka One,cursive" font-size="12" fill="#9c27b0">B = ${fmt(B)} T (out of page ⊙)</text>

    <!-- Charge and angle labels -->
    <text x="${cx}" y="${cy + 40}" text-anchor="middle" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="${chargeColor}">q = ${fmt(q)} C</text>
    <text x="${svgW - 10}" y="${cy}" text-anchor="end" font-family="Nunito,sans-serif" font-size="10" font-weight="700" fill="#4a4a6a">θ = ${theta}°</text>

    <!-- Formula -->
    <text x="${svgW / 2}" y="${svgH - 8}" text-anchor="middle" font-family="Fredoka One,cursive" font-size="12" fill="${chargeColor}">F = |q|vB sin θ = ${fmt(Math.abs(q))} × ${fmt(v)} × ${fmt(B)} × ${fmt(sinT).slice(0,5)} = ${fmt(F)} N</text>
  </svg>`;
}

/* ── EFIELD & MAGFORCE TAB SWITCHERS ── */
let efieldMethod = 'fq';
function switchEfieldMethod(method, btn) {
  efieldMethod = method;
  document.querySelectorAll('#calc-efield .method-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('efield-fq').style.display = method === 'fq' ? '' : 'none';
  document.getElementById('efield-kQ').style.display = method === 'kQ' ? '' : 'none';
  document.getElementById('ef-result').className = 'result-box';
  const d = document.getElementById('efield-diagram');
  if (d) d.remove();
}

let magMethod = 'wire';
function switchMagMethod(method, btn) {
  magMethod = method;
  document.querySelectorAll('#calc-magforce .method-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('mag-wire').style.display   = method === 'wire'   ? '' : 'none';
  document.getElementById('mag-charge').style.display = method === 'charge' ? '' : 'none';
  document.getElementById('mag-result').className = 'result-box';
  const d = document.getElementById('mag-diagram');
  if (d) d.remove();
}

/* ── CALCULATOR 1: OHM'S LAW  V = IR ── */
function calcOhm() {
  const V = val('ohm-V'), I = val('ohm-I'), R = val('ohm-R');
  if ([V,I,R].filter(x => x !== null).length < 2)
    return showError('ohm-result', 'Enter any two values to solve for the third.');

  let solved = null, vR, iR, rR;

  if (V === null) {
    if (I <= 0 || R < 0) return showError('ohm-result', 'Current and Resistance must be positive.');
    const res = I * R;
    vR = res; iR = I; rR = R; solved = 'V';
    showSuccess('ohm-result', 'Voltage (V)', res, 'V',
      `Using V = I × R: the voltage is ${fmt(res)} Volts.`,
      [`I = ${fmt(I)} A`, `R = ${fmt(R)} Ω`, `V = ${fmt(I)} × ${fmt(R)} = ${fmt(res)} V`]);
  } else if (I === null) {
    if (R === 0) return showError('ohm-result', 'Resistance cannot be zero when solving for current.');
    const res = V / R;
    vR = V; iR = res; rR = R; solved = 'I';
    showSuccess('ohm-result', 'Current (I)', res, 'A',
      `Using I = V / R: the current is ${fmt(res)} Amperes.`,
      [`V = ${fmt(V)} V`, `R = ${fmt(R)} Ω`, `I = ${fmt(V)} / ${fmt(R)} = ${fmt(res)} A`]);
  } else {
    if (I === 0) return showError('ohm-result', 'Current cannot be zero when solving for resistance.');
    const res = V / I;
    vR = V; iR = I; rR = res; solved = 'R';
    showSuccess('ohm-result', 'Resistance (R)', res, 'Ω',
      `Using R = V / I: the resistance is ${fmt(res)} Ohms.`,
      [`V = ${fmt(V)} V`, `I = ${fmt(I)} A`, `R = ${fmt(V)} / ${fmt(I)} = ${fmt(res)} Ω`]);
  }

  insertDiagram('ohm-result', 'ohm-diagram', diagramOhm(vR, iR, rR, solved));
}

/* ── CALCULATOR 2: ELECTRIC POWER  P = VI ── */
function calcPower() {
  const V = val('pwr-V'), I = val('pwr-I'), R = val('pwr-R');
  if (V !== null && I !== null) {
    const res = V * I;
    showSuccess('pwr-result', 'Power (P)', res, 'W',
      `Using P = V × I: power is ${fmt(res)} Watts.`,
      [`V = ${fmt(V)} V`, `I = ${fmt(I)} A`, `P = ${fmt(V)} × ${fmt(I)} = ${fmt(res)} W`]);
    insertDiagram('pwr-result', 'pwr-diagram', diagramPower(res, V, I, null, 'VI'));
  } else if (I !== null && R !== null) {
    if (R < 0) return showError('pwr-result', 'Resistance must be positive.');
    const res = I * I * R;
    showSuccess('pwr-result', 'Power (P)', res, 'W',
      `Using P = I²R: power is ${fmt(res)} Watts.`,
      [`I = ${fmt(I)} A`, `R = ${fmt(R)} Ω`, `P = (${fmt(I)})² × ${fmt(R)} = ${fmt(res)} W`]);
    insertDiagram('pwr-result', 'pwr-diagram', diagramPower(res, null, I, R, 'I2R'));
  } else if (V !== null && R !== null) {
    if (R === 0) return showError('pwr-result', 'Resistance cannot be zero.');
    const res = (V * V) / R;
    showSuccess('pwr-result', 'Power (P)', res, 'W',
      `Using P = V²/R: power is ${fmt(res)} Watts.`,
      [`V = ${fmt(V)} V`, `R = ${fmt(R)} Ω`, `P = (${fmt(V)})² / ${fmt(R)} = ${fmt(res)} W`]);
    insertDiagram('pwr-result', 'pwr-diagram', diagramPower(res, V, null, R, 'V2R'));
  } else {
    showError('pwr-result', 'Enter V + I, I + R, or V + R.');
  }
}

/* ── CALCULATOR 3: COULOMB'S LAW  F = kq1q2/r² ── */
function calcCoulomb() {
  const q1 = val('coul-q1'), q2 = val('coul-q2'), r = val('coul-r');
  if (q1 === null || q2 === null || r === null)
    return showError('coul-result', 'All three fields (q₁, q₂, r) are required.');
  if (r <= 0) return showError('coul-result', 'Distance (r) must be a positive value.');
  const result  = (K * q1 * q2) / (r * r);
  const absF    = Math.abs(result);
  const nature  = result < 0 ? 'attractive (opposite charges)' : 'repulsive (like charges)';
  showSuccess('coul-result', 'Electrostatic Force (F)', absF, 'N',
    `The force is ${fmt(absF)} N — ${nature}.`,
    [`k = 8.99×10⁹ N·m²/C²`, `q₁ = ${fmt(q1)} C,  q₂ = ${fmt(q2)} C`,
     `r = ${fmt(r)} m,  r² = ${fmt(r*r)} m²`, `|F| = ${fmt(absF)} N  [${nature}]`]);
  insertDiagram('coul-result', 'coul-diagram', diagramCoulomb(q1, q2, r, result));
}

/* ── CALCULATOR 4: ELECTRIC FIELD  E = F/q  or  E = kQ/r² ── */
function calcEfield() {
  if (efieldMethod === 'fq') {
    const F = val('ef-F'), q = val('ef-q');
    if (F === null || q === null) return showError('ef-result', 'Force (F) and charge (q) are required.');
    if (q === 0) return showError('ef-result', 'Test charge (q) cannot be zero.');
    const res = F / q;
    showSuccess('ef-result', 'Electric Field (E)', res, 'N/C',
      `Using E = F / q: the field strength is ${fmt(res)} N/C.`,
      [`F = ${fmt(F)} N`, `q = ${fmt(q)} C`, `E = ${fmt(F)} / ${fmt(q)} = ${fmt(res)} N/C`]);
    insertDiagram('ef-result', 'efield-diagram', diagramEfield(res, 'fq', null, null, F, q));
  } else {
    const Q = val('ef-Q'), r = val('ef-r');
    if (Q === null || r === null) return showError('ef-result', 'Source charge (Q) and distance (r) are required.');
    if (r <= 0) return showError('ef-result', 'Distance (r) must be positive.');
    const res = (K * Q) / (r * r);
    showSuccess('ef-result', 'Electric Field (E)', res, 'N/C',
      `Using E = kQ / r²: the field at ${fmt(r)} m is ${fmt(res)} N/C.`,
      [`k = 8.99×10⁹`, `Q = ${fmt(Q)} C`, `r² = ${fmt(r*r)} m²`,
       `E = (8.99×10⁹ × ${fmt(Q)}) / ${fmt(r*r)} = ${fmt(res)} N/C`]);
    insertDiagram('ef-result', 'efield-diagram', diagramEfield(res, 'kQ', Q, r, null, null));
  }
}

/* ── CALCULATOR 5: ELECTRIC CHARGE  Q = ne ── */
function calcCharge() {
  const Q = val('chg-Q'), n = val('chg-n');
  if (Q === null && n === null)
    return showError('chg-result', 'Enter either Q or n to solve for the other.');
  if (Q === null) {
    if (n < 0) return showError('chg-result', 'Number of electrons must be non-negative.');
    const res = n * E;
    showSuccess('chg-result', 'Total Charge (Q)', res, 'C',
      `${fmt(n)} electrons carry a total charge of ${fmt(res)} Coulombs.`,
      [`n = ${fmt(n)}`, `e = 1.602×10⁻¹⁹ C`, `Q = ${fmt(n)} × 1.602×10⁻¹⁹ = ${fmt(res)} C`]);
    insertDiagram('chg-result', 'chg-diagram', diagramCharge(res, n));
  } else {
    if (Q === 0) return showError('chg-result', 'Charge Q cannot be zero.');
    const res = Math.abs(Q) / E;
    showSuccess('chg-result', 'Number of Electrons (n)', res, 'electrons',
      `A charge of ${fmt(Math.abs(Q))} C corresponds to ${fmt(res)} electrons.`,
      [`Q = ${fmt(Q)} C`, `e = 1.602×10⁻¹⁹ C`, `n = |Q| / e = ${fmt(res)}`]);
    insertDiagram('chg-result', 'chg-diagram', diagramCharge(Q, res));
  }
}

/* ── CALCULATOR 6: MAGNETIC FORCE  F = BIL sinθ  or  F = qvB sinθ ── */
function calcMagForce() {
  if (magMethod === 'wire') {
    const B = val('mw-B'), I = val('mw-I'), L = val('mw-L'), theta = val('mw-theta');
    if ([B,I,L,theta].includes(null)) return showError('mag-result', 'All four fields are required.');
    if (B < 0 || L < 0) return showError('mag-result', 'B and L must be non-negative.');
    const sinT = Math.sin(theta * Math.PI / 180);
    const res  = B * I * L * sinT;
    showSuccess('mag-result', 'Magnetic Force on Wire (F)', res, 'N',
      `Using F = BIL sin θ: the force on the wire is ${fmt(res)} N.`,
      [`B = ${fmt(B)} T`, `I = ${fmt(I)} A`, `L = ${fmt(L)} m`,
       `θ = ${theta}°  →  sin(${theta}°) = ${fmt(sinT)}`,
       `F = ${fmt(B)} × ${fmt(I)} × ${fmt(L)} × ${fmt(sinT)} = ${fmt(res)} N`]);
    insertDiagram('mag-result', 'mag-diagram', diagramMagWire(B, I, L, theta, res));
  } else {
    const q = val('mc-q'), v = val('mc-v'), B = val('mc-B'), theta = val('mc-theta');
    if ([q,v,B,theta].includes(null)) return showError('mag-result', 'All four fields are required.');
    if (B < 0 || v < 0) return showError('mag-result', 'B and v must be non-negative.');
    const sinT = Math.sin(theta * Math.PI / 180);
    const res  = Math.abs(q) * v * B * sinT;
    showSuccess('mag-result', 'Magnetic Force on Charge (F)', res, 'N',
      `Using F = |q|vB sin θ: the force on the moving charge is ${fmt(res)} N.`,
      [`|q| = ${fmt(Math.abs(q))} C`, `v = ${fmt(v)} m/s`, `B = ${fmt(B)} T`,
       `θ = ${theta}°  →  sin(${theta}°) = ${fmt(sinT)}`,
       `F = ${fmt(Math.abs(q))} × ${fmt(v)} × ${fmt(B)} × ${fmt(sinT)} = ${fmt(res)} N`]);
    insertDiagram('mag-result', 'mag-diagram', diagramMagCharge(q, v, B, theta, res));
  }
}

/* ════════════════════════════════════════════════════════
   CALCULATOR 7: SERIES & PARALLEL RESISTANCE
   ════════════════════════════════════════════════════════ */

const SP_MIN = 2;
const SP_MAX = 6;
let spMode  = 'series';
let spCount = 2;

function spInit() {
  spRebuildGrid();
  spDrawDiagram([]);
}

function switchSPMode(mode, btn) {
  spMode = mode;
  document.querySelectorAll('#calc-series-parallel .method-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('sp-result').className = 'result-box';
  document.getElementById('sp-breakdown').style.display = 'none';
  spDrawDiagram([]);
}

function spAddResistor() {
  if (spCount >= SP_MAX) return;
  spCount++;
  spRebuildGrid();
}
function spRemoveResistor() {
  if (spCount <= SP_MIN) return;
  spCount--;
  spRebuildGrid();
}

function spRebuildGrid() {
  const grid = document.getElementById('sp-resistors-grid');
  const existing = [];
  grid.querySelectorAll('input').forEach(inp => existing.push(inp.value));
  grid.innerHTML = '';
  for (let i = 0; i < spCount; i++) {
    const slot = document.createElement('div');
    slot.className = 'sp-r-slot';
    slot.innerHTML = `
      <label>
        <span class="sp-r-badge">R${i+1}</span>
        Resistor ${i+1} <span class="unit-tag">Ohms Ω</span>
      </label>
      <input type="number" id="sp-r${i}" placeholder="e.g. ${(i+1)*10}" step="any" min="0" value="${existing[i] || ''}" />
    `;
    grid.appendChild(slot);
  }
  document.getElementById('sp-count-label').textContent = `(${spCount} of ${SP_MAX})`;
  document.getElementById('sp-add-btn').disabled    = spCount >= SP_MAX;
  document.getElementById('sp-remove-btn').disabled = spCount <= SP_MIN;
}

function spGetResistors() {
  const vals = [];
  for (let i = 0; i < spCount; i++) {
    const el = document.getElementById(`sp-r${i}`);
    const v  = el ? parseFloat(el.value) : NaN;
    vals.push(isNaN(v) ? null : v);
  }
  return vals;
}

function calcSeriesParallel() {
  const resistors = spGetResistors();
  const Vs = val('sp-Vs');

  const filled = resistors.filter(r => r !== null);
  if (filled.length < 2) return showError('sp-result', 'Enter at least 2 resistor values.');
  const invalid = filled.find(r => r <= 0);
  if (invalid !== undefined) return showError('sp-result', 'All resistor values must be greater than zero.');

  const Rs = resistors.filter(r => r !== null);
  let Rtotal, formulaStr, steps;

  if (spMode === 'series') {
    Rtotal = Rs.reduce((sum, r) => sum + r, 0);
    formulaStr = Rs.map((r, i) => `R${i+1}`).join(' + ');
    steps = [
      `Formula: Rₜ = ${formulaStr}`,
      `Rₜ = ${Rs.map(r => fmt(r) + ' Ω').join(' + ')}`,
      `Rₜ = ${fmt(Rtotal)} Ω`,
    ];
  } else {
    const recipSum = Rs.reduce((sum, r) => sum + 1/r, 0);
    Rtotal = 1 / recipSum;
    formulaStr = Rs.map((r, i) => `1/R${i+1}`).join(' + ');
    steps = [
      `Formula: 1/Rₜ = ${formulaStr}`,
      `1/Rₜ = ${Rs.map(r => '1/' + fmt(r)).join(' + ')} = ${fmt(recipSum)}`,
      `Rₜ = 1 / ${fmt(recipSum)} = ${fmt(Rtotal)} Ω`,
    ];
  }

  let Itotal = null, Ptotal = null;
  if (Vs !== null) {
    if (Vs <= 0) return showError('sp-result', 'Supply voltage must be positive.');
    Itotal = Vs / Rtotal;
    Ptotal = Vs * Itotal;
    steps.push(`Supply: Vs = ${fmt(Vs)} V`);
    steps.push(`Total current: I = Vs / Rₜ = ${fmt(Vs)} / ${fmt(Rtotal)} = ${fmt(Itotal)} A`);
    steps.push(`Total power: P = Vs × I = ${fmt(Vs)} × ${fmt(Itotal)} = ${fmt(Ptotal)} W`);
  }

  const modeLabel = spMode === 'series' ? 'Series' : 'Parallel';
  showSuccess('sp-result',
    `Total Resistance — ${modeLabel}`,
    Rtotal, 'Ω',
    Itotal !== null
      ? `${modeLabel} circuit: Rₜ = ${fmt(Rtotal)} Ω,  I = ${fmt(Itotal)} A,  P = ${fmt(Ptotal)} W`
      : `${modeLabel} circuit total resistance: ${fmt(Rtotal)} Ω`,
    steps
  );

  spBuildBreakdown(Rs, Rtotal, Vs, Itotal);
  spDrawDiagram(Rs, Rtotal, Vs, Itotal);
}

function spBuildBreakdown(Rs, Rtotal, Vs, Itotal) {
  const bd = document.getElementById('sp-breakdown');
  let rows = '';

  if (spMode === 'series') {
    Rs.forEach((r, i) => {
      const vDrop = Vs !== null ? (r / Rtotal) * Vs : null;
      const pDiss = Itotal !== null ? Itotal * Itotal * r : null;
      const ratio = ((r / Rtotal) * 100).toFixed(1);
      rows += `<tr>
        <td class="td-name">R${i+1}</td>
        <td>${fmt(r)} Ω</td>
        <td>${vDrop !== null ? fmt(vDrop) + ' V' : '—'}</td>
        <td>${Itotal !== null ? fmt(Itotal) + ' A' : '—'}</td>
        <td>${pDiss !== null ? fmt(pDiss) + ' W' : '—'}</td>
        <td>${ratio}%</td>
      </tr>`;
    });
  } else {
    Rs.forEach((r, i) => {
      const iBranch = Vs !== null ? Vs / r : null;
      const pDiss   = Vs !== null ? (Vs * Vs) / r : null;
      const conductance = (1/r);
      const totalCond   = Rs.reduce((s, rv) => s + 1/rv, 0);
      const ratio = ((conductance / totalCond) * 100).toFixed(1);
      rows += `<tr>
        <td class="td-name">R${i+1}</td>
        <td>${fmt(r)} Ω</td>
        <td>${Vs !== null ? fmt(Vs) + ' V' : '—'}</td>
        <td>${iBranch !== null ? fmt(iBranch) + ' A' : '—'}</td>
        <td>${pDiss !== null ? fmt(pDiss) + ' W' : '—'}</td>
        <td>${ratio}%</td>
      </tr>`;
    });
  }

  bd.style.display = 'block';
  bd.innerHTML = `
    <div class="sp-breakdown-title">Per-Resistor Breakdown — ${spMode === 'series' ? 'Series' : 'Parallel'}</div>
    <table>
      <thead>
        <tr>
          <th>Resistor</th>
          <th>Value</th>
          <th>Voltage</th>
          <th>Current</th>
          <th>Power</th>
          <th>Share</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="1" style="color:var(--text-muted);font-weight:400">TOTAL</td>
          <td class="td-total">${fmt(Rtotal)} Ω</td>
          <td class="td-total">${Vs !== null ? fmt(Vs) + ' V' : '—'}</td>
          <td class="td-total">${Itotal !== null ? fmt(Itotal) + ' A' : '—'}</td>
          <td class="td-total">${(Vs !== null && Itotal !== null) ? fmt(Vs * Itotal) + ' W' : '—'}</td>
          <td class="td-total">100%</td>
        </tr>
      </tfoot>
    </table>`;
}

/* ── SVG Circuit Diagram ── */
function spDrawDiagram(Rs, Rtotal, Vs, Itotal) {
  const svg = document.getElementById('sp-diagram');
  if (!svg) return;

  const W = 600, H = 120;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  const hasVs    = Vs != null && Itotal != null;
  const hasRs    = Rs && Rs.length > 0;
  const accent   = '#00d4ff';
  const success  = '#00e5a0';
  const muted    = '#4a6280';
  const border   = '#2a4060';
  const bg       = '#111928';

  function el(tag, attrs, text='') {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k, v));
    if (text) e.textContent = text;
    svg.appendChild(e);
    return e;
  }

  if (!hasRs) {
    el('text', { x: W/2, y: H/2 + 5, fill: muted, 'font-size': 13, 'text-anchor': 'middle',
      'font-family': 'DM Sans, sans-serif' }, 'Enter resistor values and calculate to see diagram');
    return;
  }

  const n = Rs.length;

  if (spMode === 'series') {
    const leftPad  = hasVs ? 80 : 30;
    const rightPad = 30;
    const wireY    = 38;
    const rW = 44, rH = 24;
    const usable    = W - leftPad - rightPad;
    const spacing   = usable / n;
    const rBodyW    = Math.min(rW, spacing * 0.55);

    el('line', { x1: leftPad, y1: wireY, x2: W - rightPad, y2: wireY, stroke: accent, 'stroke-width': 2 });
    el('line', { x1: leftPad, y1: H - 28, x2: W - rightPad, y2: H - 28, stroke: accent, 'stroke-width': 2 });
    el('line', { x1: leftPad, y1: wireY, x2: leftPad, y2: H - 28, stroke: accent, 'stroke-width': 2 });
    el('line', { x1: W - rightPad, y1: wireY, x2: W - rightPad, y2: H - 28, stroke: accent, 'stroke-width': 2 });

    if (hasVs) {
      const sx = leftPad - 38, sy1 = wireY + 6, sy2 = H - 28 - 6;
      el('line', { x1: sx, y1: wireY, x2: sx, y2: sy1, stroke: success, 'stroke-width': 2 });
      el('line', { x1: sx - 10, y1: sy1, x2: sx + 10, y2: sy1, stroke: success, 'stroke-width': 3 });
      el('line', { x1: sx - 6, y1: sy2, x2: sx + 6, y2: sy2, stroke: success, 'stroke-width': 1.5 });
      el('line', { x1: sx, y1: sy2, x2: sx, y2: H - 28, stroke: success, 'stroke-width': 2 });
      el('line', { x1: sx, y1: wireY, x2: leftPad, y2: wireY, stroke: success, 'stroke-width': 2 });
      el('line', { x1: sx, y1: H - 28, x2: leftPad, y2: H - 28, stroke: success, 'stroke-width': 2 });
      const midY = (sy1 + sy2) / 2;
      el('text', { x: sx - 16, y: midY + 4, fill: success, 'font-size': 9, 'text-anchor': 'middle' }, `${fmt(Vs)}V`);
    }

    Rs.forEach((r, i) => {
      const cx = leftPad + spacing * i + spacing / 2;
      const bx = cx - rBodyW / 2;
      const by = wireY - rH / 2;
      el('rect', { x: bx, y: by, width: rBodyW, height: rH, rx: 4, fill: bg, stroke: accent, 'stroke-width': 1.5 });
      el('text', { x: cx, y: wireY - 2, fill: accent, 'font-size': 9, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace', 'font-weight': 600 }, `R${i+1}`);
      el('text', { x: cx, y: wireY + 9, fill: '#7b9bbf', 'font-size': 8, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }, `${fmt(r)}Ω`);
      if (hasVs) {
        const vDrop = (r / Rtotal) * Vs;
        el('text', { x: cx, y: H - 12, fill: success, 'font-size': 8, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }, `${fmt(vDrop)}V`);
      }
    });

    el('text', { x: W - rightPad, y: H - 12, fill: muted, 'font-size': 8, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace' }, `Rₜ=${fmt(Rtotal)}Ω`);

  } else {
    const topBusY   = 22;
    const botBusY   = H - 18;
    const leftBusX  = hasVs ? 80 : 40;
    const rightBusX = W - 30;
    const rW        = 42, rH = 20;
    const colSpacing = (rightBusX - leftBusX) / n;
    const rBodyH    = Math.min(rH, (botBusY - topBusY) * 0.45);

    el('line', { x1: leftBusX, y1: topBusY, x2: rightBusX, y2: topBusY, stroke: accent, 'stroke-width': 2 });
    el('line', { x1: leftBusX, y1: botBusY, x2: rightBusX, y2: botBusY, stroke: accent, 'stroke-width': 2 });

    if (hasVs) {
      const sx = leftBusX - 32;
      const sy1 = topBusY + 6, sy2 = botBusY - 6;
      const midY = (topBusY + botBusY) / 2;
      el('line', { x1: sx, y1: topBusY, x2: sx, y2: sy1, stroke: success, 'stroke-width': 2 });
      el('line', { x1: sx - 10, y1: sy1, x2: sx + 10, y2: sy1, stroke: success, 'stroke-width': 3 });
      el('line', { x1: sx - 6, y1: sy2, x2: sx + 6, y2: sy2, stroke: success, 'stroke-width': 1.5 });
      el('line', { x1: sx, y1: sy2, x2: sx, y2: botBusY, stroke: success, 'stroke-width': 2 });
      el('line', { x1: sx, y1: topBusY, x2: leftBusX, y2: topBusY, stroke: success, 'stroke-width': 2 });
      el('line', { x1: sx, y1: botBusY, x2: leftBusX, y2: botBusY, stroke: success, 'stroke-width': 2 });
      el('text', { x: sx - 16, y: midY + 4, fill: success, 'font-size': 9, 'text-anchor': 'middle' }, `${fmt(Vs)}V`);
    }

    el('line', { x1: leftBusX, y1: topBusY, x2: leftBusX, y2: botBusY, stroke: border, 'stroke-width': 1, 'stroke-dasharray': '3,3' });
    el('line', { x1: rightBusX, y1: topBusY, x2: rightBusX, y2: botBusY, stroke: border, 'stroke-width': 1, 'stroke-dasharray': '3,3' });

    Rs.forEach((r, i) => {
      const cx = leftBusX + colSpacing * i + colSpacing / 2;
      const bx = cx - rW / 2;
      const midY = (topBusY + botBusY) / 2;
      const by = midY - rBodyH / 2;

      el('line', { x1: cx, y1: topBusY, x2: cx, y2: by, stroke: accent, 'stroke-width': 1.5 });
      el('line', { x1: cx, y1: by + rBodyH, x2: cx, y2: botBusY, stroke: accent, 'stroke-width': 1.5 });
      el('rect', { x: bx, y: by, width: rW, height: rBodyH, rx: 4, fill: bg, stroke: accent, 'stroke-width': 1.5 });
      el('text', { x: cx, y: midY - 2, fill: accent, 'font-size': 9, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace', 'font-weight': 600 }, `R${i+1}`);
      el('text', { x: cx, y: midY + 8, fill: '#7b9bbf', 'font-size': 8, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }, `${fmt(r)}Ω`);

      if (hasVs) {
        const iBranch = Vs / r;
        el('text', { x: cx, y: botBusY + 12, fill: success, 'font-size': 8, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }, `${fmt(iBranch)}A`);
      }
    });

    el('text', { x: rightBusX + 2, y: topBusY - 4, fill: muted, 'font-size': 8, 'text-anchor': 'start', 'font-family': 'JetBrains Mono, monospace' }, `Rₜ=${fmt(Rtotal)}Ω`);
  }
}

/* ── ENTER KEY SUPPORT ── */
(function attachEnterKey() {
  const map = {
    'ohm-V': calcOhm, 'ohm-I': calcOhm, 'ohm-R': calcOhm,
    'pwr-V': calcPower, 'pwr-I': calcPower, 'pwr-R': calcPower,
    'coul-q1': calcCoulomb, 'coul-q2': calcCoulomb, 'coul-r': calcCoulomb,
    'ef-F': calcEfield, 'ef-q': calcEfield, 'ef-Q': calcEfield, 'ef-r': calcEfield,
    'chg-Q': calcCharge, 'chg-n': calcCharge,
    'mw-B': calcMagForce, 'mw-I': calcMagForce, 'mw-L': calcMagForce, 'mw-theta': calcMagForce,
    'mc-q': calcMagForce, 'mc-v': calcMagForce, 'mc-B': calcMagForce, 'mc-theta': calcMagForce,
    'sp-Vs': calcSeriesParallel,
  };
  Object.entries(map).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') fn(); });
  });
  document.getElementById('sp-resistors-grid').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('input[type="number"]')) calcSeriesParallel();
  });
})();