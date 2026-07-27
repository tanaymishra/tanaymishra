// Bakes a rotating 3D particle cloud into a static SVG.
//
// GitHub's markdown sanitizer strips <script>, so there is no runtime on the page.
// Every frame of the perspective projection is therefore computed here, ahead of time,
// and emitted as SMIL <animateTransform> value lists. The browser only interpolates.
//
// The cloud is anamorphic: each particle is placed in 3D so that at yaw = 0 its
// projection lands exactly on a letterform. At every other yaw it is noise.

const fs = require('fs');
const path = require('path');

/* ── canvas & camera ─────────────────────────────────────────────────────── */

const W = 1200, H = 480;
const CX = W / 2, CY = 244;

const FOCAL = 640;   // camera distance; smaller = more aggressive perspective
const DEPTH = 205;   // how far particles are scattered along the view axis
const FRAMES = 48;   // baked keyframes per loop
const CYCLE = 30;    // seconds per loop
const HOLD = 0.14;   // fraction of the loop the word stays legible

const WORD = 'TANAY';
const TARGET_POINTS = 400;

/* ── deterministic rng, so the art is identical on every rebuild ─────────── */

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20210411);

/* ── letterforms as thick segments, sampled into points ──────────────────── */
// Each glyph lives in a 100 x 140 box. [x1, y1, x2, y2, thickness]

const GLYPHS = {
  T: [[50, 8, 50, 132, 20], [8, 8, 92, 8, 20]],
  A: [[50, 8, 14, 132, 20], [50, 8, 86, 132, 20], [26, 92, 74, 92, 18]],
  N: [[14, 132, 14, 8, 20], [14, 8, 86, 132, 20], [86, 132, 86, 8, 20]],
  Y: [[14, 8, 50, 68, 20], [86, 8, 50, 68, 20], [50, 68, 50, 132, 20]],
};

const GLYPH_W = 100, GAP = 22, SCALE = 1.22;
const wordW = WORD.length * GLYPH_W + (WORD.length - 1) * GAP;

// Collect every segment in word space, then distribute points by ink area
const segs = [];
WORD.split('').forEach((ch, i) => {
  const ox = i * (GLYPH_W + GAP) - wordW / 2;
  for (const [x1, y1, x2, y2, t] of GLYPHS[ch]) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    segs.push({ x1: x1 + ox, y1, x2: x2 + ox, y2, t, area: len * t });
  }
});

const totalArea = segs.reduce((a, s) => a + s.area, 0);

const targets = [];
for (const s of segs) {
  const n = Math.max(3, Math.round(TARGET_POINTS * (s.area / totalArea)));
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len; // unit normal, for thickness
  for (let k = 0; k < n; k++) {
    const u = (k + rand() * 0.9) / n;
    const off = (rand() - 0.5) * s.t;
    targets.push({
      x: CX + (s.x1 + dx * u + nx * off) * SCALE,
      y: CY + (s.y1 + dy * u + ny * off - 70) * SCALE,
    });
  }
}

/* ── lift each 2-D target into 3-D along its own view ray ────────────────── */
// Solve for (X, Y, Z) such that the yaw-0 perspective projection returns the target.

const particles = targets.map(p => {
  const z = (rand() * 2 - 1) * DEPTH;
  const k = (FOCAL - z) / FOCAL;
  return {
    X: (p.x - CX) * k,
    Y: (p.y - CY) * k,
    Z: z,
    tint: Math.min(3, Math.floor(((p.x - (CX - wordW * SCALE / 2)) / (wordW * SCALE)) * 4 + rand() * 0.3)),
    seed: rand(),
  };
});

/* ── yaw over the loop: dwell at zero, then one eased revolution ─────────── */

const easeInOut = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

function yawAt(t) {
  if (t < HOLD) return 0;
  return 2 * Math.PI * easeInOut((t - HOLD) / (1 - HOLD));
}

/* ── bake ────────────────────────────────────────────────────────────────── */

const TINTS = ['#bc8cff', '#58a6ff', '#2dd4bf', '#3fb950'];

const bodies = particles.map(p => {
  const pos = [], rad = [], op = [];

  for (let f = 0; f <= FRAMES; f++) {
    const th = yawAt(f / FRAMES);
    const c = Math.cos(th), s = Math.sin(th);
    const X = p.X * c + p.Z * s;
    const Z = -p.X * s + p.Z * c;
    const persp = FOCAL / (FOCAL - Z);

    pos.push(`${Math.round(CX + X * persp)},${Math.round(CY + p.Y * persp)}`);
    rad.push(Math.max(2, Math.round(4.6 * persp)));

    const depth = (Z + DEPTH) / (2 * DEPTH);          // 0 = far, 1 = near
    op.push((0.16 + 0.84 * Math.pow(depth, 1.5)).toFixed(2));
  }

  return `<circle r="0" fill="url(#t${p.tint})">`
    + `<animateTransform attributeName="transform" type="translate" dur="${CYCLE}s" repeatCount="indefinite" values="${pos.join(';')}"/>`
    + `<animate attributeName="r" dur="${CYCLE}s" repeatCount="indefinite" values="${rad.join(';')}"/>`
    + `<animate attributeName="opacity" dur="${CYCLE}s" repeatCount="indefinite" values="${op.join(';')}"/>`
    + `</circle>`;
}).join('\n  ');

const gradients = TINTS.map((c, i) =>
  `<radialGradient id="t${i}"><stop offset="0" stop-color="${c}" stop-opacity="1"/>`
  + `<stop offset="0.45" stop-color="${c}" stop-opacity="0.5"/>`
  + `<stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`
).join('\n    ');

// The caption breathes in only while the word is legible
const inPct = (HOLD * 0.18 * 100).toFixed(1);
const outPct = (HOLD * 100).toFixed(1);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="A cloud of particles that resolves into the name Tanay once per rotation">
  <defs>
    ${gradients}
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#1f2f52" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#010409" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <style>
    text{font-family:ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,monospace}
    @keyframes legible{0%{opacity:0}${inPct}%{opacity:1}${outPct}%{opacity:1}${(HOLD * 100 + 4).toFixed(1)}%{opacity:0}100%{opacity:0}}
    .cap{opacity:0;animation:legible ${CYCLE}s linear infinite}
  </style>

  <rect width="${W}" height="${H}" fill="#010409"/>
  <ellipse cx="${CX}" cy="${CY}" rx="620" ry="300" fill="url(#halo)"/>

  ${bodies}

  <g class="cap">
    <text x="${CX}" y="404" fill="#6e7681" font-size="12" text-anchor="middle" letter-spacing="6">BUILDING THINGS BIGGER THAN ME</text>
  </g>
</svg>
`;

const out = path.join(__dirname, '..', 'assets');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'orb.svg'), svg);

console.log(`orb.svg   ${particles.length} particles · ${FRAMES} baked frames · ${(svg.length / 1024).toFixed(0)} KB`);
