// Three full-width rows for the profile README.
//
// Each row is one SVG containing its own panels, rather than a markdown table of
// separate images. GitHub adds unpredictable cell padding to tables, so drawing the
// panels inside a single 880px canvas is the only way to control the layout exactly.
//
// Served under `default-src 'none'`: nothing here can be fetched, so it is all drawn.
// Every number is real, pulled from the GitHub GraphQL API.

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const W = 880, CYCLE = 14, CW = 7.22; // monospace advance at font-size 12

const C = {
  bg: '#050807', panel: '#0a1210', edge: '#17302a', rule: '#132520',
  green: '#4ade80', dim: '#22c55e', violet: '#a78bfa', amber: '#fbbf24', blue: '#60a5fa',
  text: '#e6edf3', muted: '#8b98a5', faint: '#55636e',
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const svg = (h, defs, style, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img">
  <defs>${defs}</defs>
  <style>text{font-family:ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,monospace}${style}</style>
  <rect width="${W}" height="${h}" fill="${C.bg}"/>
  ${body}
</svg>
`;

const panel = (x, y, w, h, title) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${C.panel}" stroke="${C.edge}" stroke-width="1.2"/>
  ${title ? `<text x="${x + 18}" y="${y + 27}" font-size="12.5" fill="${C.text}" font-weight="600">${title}</text>` : ''}`;

/* ── row 1 · whoami + stats ──────────────────────────────────────────────── */

const R1H = 320;
const PROMPT = 'tanay@github:~$ ';

const L = [
  { y: 46,  p: PROMPT, t: 'whoami',                 f: C.text,   at: 0.3 },
  { y: 82,  p: '> ',   t: 'Full Stack Developer',   f: C.text,   at: 1.2 },
  { y: 108, p: '> ',   t: 'Systems & Infrastructure', f: C.muted, at: 1.7 },
  { y: 134, p: '> ',   t: 'Building Zyloris',       f: C.muted,  at: 2.2 },
  { y: 160, p: '> ',   t: 'Always Learning',        f: C.muted,  at: 2.7 },
  { y: 206, p: PROMPT, t: 'cat contributions.txt',  f: C.text,   at: 3.3 },
  { y: 242, p: '> ',   t: '3,830 contributions this year', f: C.text, at: 4.4 },
  { y: 268, p: '> ',   t: '3,549 of them private',  f: C.muted,  at: 5.0 },
  { y: 294, p: '> ',   t: 'the green squares lie.', f: C.green,  at: 5.6 },
];

const typeClip = (id, l, x) => {
  const w = ((l.p.length + l.t.length) * CW + 6).toFixed(0);
  const a = (l.at / CYCLE).toFixed(4);
  const b = ((l.at + l.t.length * 0.028) / CYCLE).toFixed(4);
  return `<clipPath id="${id}"><rect x="${x}" y="${l.y - 12}" width="0" height="17">`
    + `<animate attributeName="width" dur="${CYCLE}s" repeatCount="indefinite" calcMode="linear"`
    + ` values="0;0;${w};${w};0" keyTimes="0;${a};${b};0.96;1"/></rect></clipPath>`;
};

const RING_R = 50, RING_L = 2 * Math.PI * RING_R;
const statRows = [
  ['Contributions', '3,830', C.text],
  ['Private',       '3,549', C.green],
  ['Repositories',  '77',    C.text],
  ['Stars',         '3',     C.muted],
];

const row1 = svg(R1H,
  `<linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0" stop-color="${C.green}"/><stop offset="1" stop-color="${C.blue}"/></linearGradient>`,
  '',
  panel(0, 0, 566, R1H) + panel(578, 0, 302, R1H, 'GitHub Stats')
  + '\n  ' + L.map((l, i) => typeClip(`t${i}`, l, 18)).join('\n  ')
  + '\n  ' + L.map((l, i) =>
      `<g clip-path="url(#t${i})"><text x="20" y="${l.y}" font-size="12" fill="${l.p === PROMPT ? C.green : C.violet}">${esc(l.p)}<tspan fill="${l.f}">${esc(l.t)}</tspan></text></g>`
    ).join('\n  ')
  + `
  <g transform="translate(729,132)">
    <circle r="${RING_R}" fill="none" stroke="${C.rule}" stroke-width="9"/>
    <circle r="${RING_R}" fill="none" stroke="url(#rg)" stroke-width="9" stroke-linecap="round" transform="rotate(-90)"
            stroke-dasharray="${RING_L.toFixed(1)}" stroke-dashoffset="${RING_L.toFixed(1)}">
      <animate attributeName="stroke-dashoffset" dur="${CYCLE}s" repeatCount="indefinite" calcMode="spline"
               keySplines="0.16 1 0.3 1;0 0 1 1;0 0 1 1" keyTimes="0;0.16;0.95;1"
               values="${RING_L.toFixed(1)};${(RING_L * 0.073).toFixed(1)};${(RING_L * 0.073).toFixed(1)};${RING_L.toFixed(1)}"/>
    </circle>
    <text y="4" font-size="30" font-weight="700" fill="${C.text}" text-anchor="middle">93%</text>
    <text y="23" font-size="9" fill="${C.muted}" text-anchor="middle" letter-spacing="1.6">PRIVATE</text>
  </g>
  <line x1="600" y1="212" x2="858" y2="212" stroke="${C.rule}"/>
  ` + statRows.map(([k, v, col], i) => `
  <text x="600" y="${242 + i * 24}" font-size="11.5" fill="${C.muted}">${k}</text>
  <text x="858" y="${242 + i * 24}" font-size="11.5" fill="${col}" text-anchor="end" font-weight="600">${v}</text>`).join('')
);

/* ── row 2 · maths + languages ───────────────────────────────────────────── */

const MATH = [
  ['e^(iπ) + 1 = 0',   'five constants, one sentence, zero waste'],
  ['O(n log n)',       'a promise, not a suggestion'],
  ['off-by-one',       'an induction step I skipped'],
  ['0.1 + 0.2 ≠ 0.3',  'a lie we all agreed to believe'],
  ['P ≠ NP',           'probably. my job depends on it.'],
  ['∀ bug ∃ invariant','that I assumed and never proved'],
];

const LANGS = [
  ['TypeScript', 37, '#3178c6'], ['CSS', 11, '#663399'], ['Python', 8, '#3572a5'],
  ['JavaScript', 6, '#f1e05a'],  ['HTML', 5, '#e34c26'], ['Other', 10, '#6e7681'],
];
const LT = LANGS.reduce((a, l) => a + l[1], 0);

let bx = 596;
const bars = LANGS.map(([, c, col], i) => {
  const w = (266 * c) / LT;
  const s = `<rect x="${bx.toFixed(1)}" y="88" width="${w.toFixed(1)}" height="11" fill="${col}"/>`;
  bx += w;
  return s;
});

const R2H = 236;
const row2 = svg(R2H, '', '',
  panel(0, 0, 566, R2H, 'tanay@github:~$ cat maths.txt') + panel(578, 0, 302, R2H, 'Languages')
  + '\n  ' + MATH.map(([f, note], i) => `
  <text x="20" y="${64 + i * 27}" font-size="12" fill="${C.violet}">&gt; <tspan fill="${C.green}">${esc(f)}</tspan></text>
  <text x="196" y="${64 + i * 27}" font-size="11.5" fill="${C.muted}">${esc(note)}</text>`).join('')
  + `\n  <text x="596" y="66" font-size="10.5" fill="${C.faint}">across 77 repositories</text>\n  `
  + bars.join('\n  ')
  + '\n  ' + LANGS.map(([n, c, col], i) => `
  <circle cx="601" cy="${124 + i * 18 - 4}" r="4" fill="${col}"/>
  <text x="613" y="${124 + i * 18}" font-size="11" fill="${C.text}">${n}</text>
  <text x="858" y="${124 + i * 18}" font-size="11" fill="${C.faint}" text-anchor="end">${((c / LT) * 100).toFixed(0)}%</text>`).join('')
);

/* ── row 3 · every Zyloris project ───────────────────────────────────────── */

const PROJECTS = [
  { n: 'RELIABLE',   d: 'System Uptime Manager & Incident Response Platform.', s: 'Building', since: 'JAN 2024', ph: 'Database Architecture & Sharding Strategy' },
  { n: 'AUTHER',     d: 'Identity Provider & SSO Infrastructure.',              s: 'Building', since: 'NOV 2023', ph: 'Color Scheme & Theme Definition' },
  { n: 'STRAINCRAFT',d: 'Bio-Visualization & Molecular Modeling.',              s: 'Concept',  since: 'AUG 2024', ph: 'Problem Statement & Feasibility' },
  { n: 'PDFEDIT',    d: 'Browser-based Local PDF Manipulation.',                s: 'Concept',  since: 'DEC 2024', ph: 'Core Logic Implementation' },
];
const STATUS = { Building: C.green, Concept: C.amber, Beta: C.blue, Operational: C.dim };

const CW3 = 434, CH3 = 116;
const cards = PROJECTS.map((p, i) => {
  const x = (i % 2) * (CW3 + 12);
  const y = 46 + Math.floor(i / 2) * (CH3 + 12);
  const col = STATUS[p.s];
  const pill = p.s.toUpperCase();
  return `
  <rect x="${x}" y="${y}" width="${CW3}" height="${CH3}" rx="8" fill="${C.panel}" stroke="${C.edge}" stroke-width="1.2"/>
  <text x="${x + 18}" y="${y + 30}" font-size="14" font-weight="700" fill="${col}" letter-spacing="1">${p.n}</text>
  <rect x="${x + CW3 - 18 - pill.length * 6.4 - 14}" y="${y + 16}" width="${pill.length * 6.4 + 14}" height="19" rx="9.5" fill="none" stroke="${col}" stroke-width="1" opacity="0.7"/>
  <text x="${x + CW3 - 25}" y="${y + 29}" font-size="9" fill="${col}" text-anchor="end" letter-spacing="0.8">${pill}</text>
  <text x="${x + 18}" y="${y + 55}" font-size="11.5" fill="${C.text}">${esc(p.d)}</text>
  <line x1="${x + 18}" y1="${y + 70}" x2="${x + CW3 - 18}" y2="${y + 70}" stroke="${C.rule}"/>
  <text x="${x + 18}" y="${y + 88}" font-size="10" fill="${C.faint}">since ${p.since}</text>
  <text x="${x + 18}" y="${y + 104}" font-size="10" fill="${C.muted}">${esc(p.ph)}</text>`;
}).join('\n');

const R3H = 46 + CH3 * 2 + 12;
const row3 = svg(R3H, '', '',
  `<text x="0" y="26" font-size="13" font-weight="600" fill="${C.text}">Zyloris</text>
  <text x="70" y="26" font-size="11" fill="${C.faint}">everything I am building, and what state it is actually in</text>`
  + cards
);

for (const [n, s] of Object.entries({ 'row-1.svg': row1, 'row-2.svg': row2, 'row-3.svg': row3 })) {
  fs.writeFileSync(path.join(OUT, n), s);
  console.log(`  ${n.padEnd(12)} ${(s.length / 1024).toFixed(1)} KB`);
}
