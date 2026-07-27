// Profile v2: the page is an observability console.
//
// Three rows: a distributed trace of GET /tanay through every layer of the stack,
// a deploy pipeline + GitHub stats, and a status page of Zyloris projects with an
// incident log. Same constraints as v1: GitHub strips scripts and styles, SVGs are
// served under `default-src 'none'`, so everything is drawn at build time and only
// SMIL animation survives.

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const W = 880, CYCLE = 12;

const C = {
  bg: '#05080c', panel: '#0a1017', edge: '#1b2836', rule: '#141f2b',
  text: '#e6edf3', muted: '#8b98a5', faint: '#55636e',
  green: '#4ade80', blue: '#60a5fa', violet: '#a78bfa', pink: '#f472b6',
  orange: '#fb923c', yellow: '#facc15', cyan: '#22d3ee', dim: '#22c55e',
  amber: '#fbbf24', off: '#1a2634',
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const svg = (h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img">
  <defs>${defs}</defs>
  <style>text{font-family:ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,monospace}</style>
  <rect width="${W}" height="${h}" fill="${C.bg}"/>
  ${body}
</svg>
`;

const panel = (x, y, w, h) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${C.panel}" stroke="${C.edge}" stroke-width="1.2"/>`;

// Looping grow animation: hidden, draws in at `at` seconds, holds, resets.
const grow = (attr, val, at) => {
  const a = (at / CYCLE).toFixed(4);
  const b = ((at + 0.45) / CYCLE).toFixed(4);
  return `<animate attributeName="${attr}" dur="${CYCLE}s" repeatCount="indefinite" calcMode="spline"
    keySplines="0 0 1 1;0.16 1 0.3 1;0 0 1 1;0 0 1 1" keyTimes="0;${a};${b};0.96;1"
    values="0;0;${val};${val};0"/>`;
};

/* ── row 1 · trace.svg — GET /tanay through the whole stack ─────────────── */

const BAR_X = 208, BAR_W = 318, TECH_X = 542;

const SPANS = [
  { n: 'GET /tanay', s: 0, e: 1, col: 'url(#tg)', tech: '200 OK · every hop below is mine', root: true },
  { n: '├─ edge',     s: 0.00, e: 0.10, col: C.blue,   tech: 'DNS · Nginx · TLS · caching · rate limits' },
  { n: '├─ frontend', s: 0.06, e: 0.30, col: C.violet, tech: 'React · Next.js · TypeScript · Tailwind' },
  { n: '├─ api',      s: 0.26, e: 0.62, col: C.green,  tech: 'Node · Express · REST · WebSockets' },
  { n: '│  ├─ auth',  s: 0.28, e: 0.44, col: C.pink,   tech: 'JWT · OAuth2 · SSO · MFA · built my own IdP' },
  { n: '│  └─ jobs',  s: 0.44, e: 0.60, col: C.orange, tech: 'Redis · queues · workers · cron' },
  { n: '├─ db',       s: 0.32, e: 0.58, col: C.yellow, tech: 'Postgres · sharding · replication · migrations' },
  { n: '├─ ci/cd',    s: 0.62, e: 0.86, col: C.cyan,   tech: 'GitHub Actions · Docker · zero-downtime deploys' },
  { n: '└─ observe',  s: 0.00, e: 1.00, col: C.dim,    tech: 'logs · metrics · alerts · building Reliable' },
];

const R1H = 318;
const traceRows = SPANS.map((sp, i) => {
  const y = 76 + i * 26;
  const x = BAR_X + sp.s * BAR_W;
  const w = (sp.e - sp.s) * BAR_W;
  const at = 0.4 + i * 0.22;
  return `
  <text x="20" y="${y + 4}" font-size="11.5" fill="${sp.root ? C.text : C.muted}"${sp.root ? ' font-weight="700"' : ''}>${esc(sp.n)}</text>
  <rect x="${x.toFixed(1)}" y="${y - 6}" height="12" rx="3" fill="${sp.col}" opacity="${sp.root ? 1 : 0.9}" width="${w.toFixed(1)}">
    ${grow('width', w.toFixed(1), at)}
  </rect>
  <text x="${TECH_X}" y="${y + 4}" font-size="11" fill="${sp.root ? C.green : C.faint}">${esc(sp.tech)}</text>`;
}).join('');

const row1 = svg(R1H,
  `<linearGradient id="tg" x1="0" y1="0" x2="1" y2="0">
     <stop offset="0" stop-color="${C.green}"/><stop offset="1" stop-color="${C.blue}"/></linearGradient>`,
  panel(0, 0, W, R1H) + `
  <text x="20" y="30" font-size="12.5" fill="${C.faint}">trace <tspan fill="${C.muted}">7f3a9c1e</tspan>  <tspan fill="${C.text}" font-weight="700">GET /tanay</tspan>  <tspan fill="${C.green}">HTTP/1.1 200</tspan></text>
  <text x="860" y="30" font-size="11" fill="${C.faint}" text-anchor="end">spans: 9 · duration: 5y and counting</text>
  <line x1="18" y1="46" x2="862" y2="46" stroke="${C.rule}"/>
  <line x1="${BAR_X}" y1="52" x2="${BAR_X}" y2="${R1H - 14}" stroke="${C.rule}" stroke-dasharray="2 4"/>
  <line x1="${BAR_X + BAR_W}" y1="52" x2="${BAR_X + BAR_W}" y2="${R1H - 14}" stroke="${C.rule}" stroke-dasharray="2 4"/>`
  + traceRows
);

/* ── row 2 · ops.svg — deploy pipeline + GitHub stats ───────────────────── */

const STAGES = [
  ['push',    '2s'],  ['lint', '9s'], ['test', '41s'],
  ['build', '1m12s'], ['deploy', '18s'], ['monitor', '∞'],
];

const R2H = 232;
const SX = i => 46 + i * 95;
const SY = 78;

const pipeline = STAGES.map(([name, t], i) => {
  const x = SX(i), last = i === STAGES.length - 1;
  const col = last ? C.amber : C.green;
  return `
  <circle cx="${x}" cy="${SY}" r="7" fill="none" stroke="${col}" stroke-width="1.6"/>
  <circle cx="${x}" cy="${SY}" r="2.6" fill="${col}">
    <animate attributeName="opacity" dur="${CYCLE}s" repeatCount="indefinite"
      keyTimes="0;${(0.05 + i * 0.055).toFixed(3)};${(0.09 + i * 0.055).toFixed(3)};0.96;1" values="0.25;0.25;1;1;0.25"/>
  </circle>
  ${last ? '' : `<line x1="${x + 11}" y1="${SY}" x2="${SX(i + 1) - 11}" y2="${SY}" stroke="${C.rule}" stroke-width="1.6"/>`}
  <text x="${x}" y="${SY + 28}" font-size="10.5" fill="${C.text}" text-anchor="middle">${name}</text>
  <text x="${x}" y="${SY + 44}" font-size="9.5" fill="${C.faint}" text-anchor="middle">${t}</text>`;
}).join('');

const packet = `
  <circle r="3" cy="${SY}" fill="${C.green}">
    <animate attributeName="cx" dur="${CYCLE}s" repeatCount="indefinite" calcMode="linear"
      keyTimes="0;0.05;0.38;1" values="${SX(0)};${SX(0)};${SX(5)};${SX(5)}"/>
    <animate attributeName="opacity" dur="${CYCLE}s" repeatCount="indefinite"
      keyTimes="0;0.05;0.36;0.42;1" values="0;1;1;0;0"/>
  </circle>`;

const LANGS = [
  ['TypeScript', 37, '#3178c6'], ['CSS', 11, '#663399'], ['Python', 8, '#3572a5'],
  ['JavaScript', 6, '#f1e05a'],  ['HTML', 5, '#e34c26'], ['Other', 10, '#6e7681'],
];
const LT = LANGS.reduce((a, l) => a + l[1], 0);

let lx = 20;
const langBar = LANGS.map(([, c, col]) => {
  const w = (526 * c) / LT;
  const r = `<rect x="${lx.toFixed(1)}" y="172" width="${w.toFixed(1)}" height="10" fill="${col}"/>`;
  lx += w;
  return r;
}).join('\n  ');

let lgx = 20;
const langLegend = LANGS.map(([n, c, col]) => {
  const label = `${n} ${((c / LT) * 100).toFixed(0)}%`;
  const s = `<circle cx="${lgx + 4}" cy="199" r="3.4" fill="${col}"/>
  <text x="${lgx + 12}" y="203" font-size="10" fill="${C.muted}">${label}</text>`;
  lgx += 12 + label.length * 6.1 + 16;
  return s;
}).join('\n  ');

const RING_R = 50, RING_L = 2 * Math.PI * RING_R;
const statRows = [
  ['Contributions', '3,830', C.text],
  ['Private',       '3,549', C.green],
  ['Repositories',  '77',    C.text],
  ['Stars',         '3',     C.muted],
];

const row2 = svg(R2H,
  `<linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0" stop-color="${C.green}"/><stop offset="1" stop-color="${C.blue}"/></linearGradient>`,
  panel(0, 0, 566, R2H) + panel(578, 0, 302, R2H) + `
  <text x="18" y="27" font-size="12.5" fill="${C.green}">tanay@zyloris:~$ <tspan fill="${C.text}">git push origin main</tspan></text>
  <text x="548" y="27" font-size="10" fill="${C.faint}" text-anchor="end">every deploy, end to end</text>`
  + pipeline + packet + `
  <line x1="18" y1="140" x2="548" y2="140" stroke="${C.rule}"/>
  <text x="20" y="160" font-size="10.5" fill="${C.faint}">stack composition · across 77 repositories</text>
  ${langBar}
  ${langLegend}
  <text x="596" y="27" font-size="12.5" fill="${C.text}" font-weight="600">GitHub Stats</text>
  <g transform="translate(729,102)">
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
  <line x1="600" y1="164" x2="858" y2="164" stroke="${C.rule}"/>`
  + statRows.map(([k, v, col], i) => `
  <text x="600" y="${186 + i * 15}" font-size="10.5" fill="${C.muted}">${k}</text>
  <text x="858" y="${186 + i * 15}" font-size="10.5" fill="${col}" text-anchor="end" font-weight="600">${v}</text>`).join('')
);

/* ── row 3 · status.svg — status page + incident log ────────────────────── */

// Timeline for the uptime ticks: Nov 2023 (first project) → Jul 2026 (now).
const T0 = 2023 + 10 / 12, T1 = 2026 + 6 / 12;
const frac = (y, m) => ((y + (m - 1) / 12) - T0) / (T1 - T0);

const SERVICES = [
  { n: 'reliable.zyloris',    d: 'uptime manager & incident response',      s: 'BUILDING',    col: C.green, start: frac(2024, 1),  now: 'multi-region sharding for event logs' },
  { n: 'auther.zyloris',      d: 'identity provider & SSO infrastructure',  s: 'PUBLIC BETA', col: C.blue,  start: frac(2023, 11), now: 'SSO + MFA · no per-user pricing' },
  { n: 'straincraft.zyloris', d: 'bio-visualization & molecular modeling',  s: 'CONCEPT',     col: C.amber, start: frac(2024, 8),  now: 'problem statement & feasibility' },
  { n: 'pdfedit.zyloris',     d: 'local-first PDF editing, nothing leaves', s: 'CONCEPT',     col: C.amber, start: frac(2024, 12), now: 'core logic implementation' },
];

const TICKS = 80, TICK_W = 6.8, TICK_G = 3.2;

const serviceRows = SERVICES.map((sv, i) => {
  const y = 66 + i * 64;
  const pill = sv.s;
  const pw = pill.length * 6.2 + 16;
  const ticks = Array.from({ length: TICKS }, (_, t) => {
    const f = t / (TICKS - 1);
    const on = f >= sv.start;
    // deterministic sprinkle of amber "rough weeks" on live services
    const rough = on && sv.s !== 'CONCEPT' && ((t * 2654435761) >>> 0) % 17 === 0;
    const col = !on ? C.off : rough ? C.amber : sv.col;
    const blink = t === TICKS - 1 && on
      ? `<animate attributeName="opacity" dur="1.6s" repeatCount="indefinite" values="1;0.25;1"/>` : '';
    return `<rect x="${(20 + t * (TICK_W + TICK_G)).toFixed(1)}" y="${y + 12}" width="${TICK_W}" height="14" rx="1.5" fill="${col}" opacity="${!on ? 1 : sv.s === 'CONCEPT' ? 0.55 : 0.9}">${blink}</rect>`;
  }).join('');
  return `
  <text x="20" y="${y}" font-size="12" font-weight="700" fill="${C.text}">${sv.n}</text>
  <text x="${20 + sv.n.length * 7.3 + 12}" y="${y}" font-size="10.5" fill="${C.faint}">${esc(sv.d)}</text>
  <rect x="${860 - pw}" y="${y - 13}" width="${pw}" height="18" rx="9" fill="none" stroke="${sv.col}" opacity="0.75"/>
  <text x="${860 - pw / 2}" y="${y}" font-size="9" fill="${sv.col}" text-anchor="middle" letter-spacing="0.8">${pill}</text>
  ${ticks}
  <text x="20" y="${y + 40}" font-size="9.5" fill="${C.faint}">now: ${esc(sv.now)}</text>
  <text x="860" y="${y + 40}" font-size="9.5" fill="${C.faint}" text-anchor="end">nov 2023 ─ today</text>`;
}).join('');

const INCIDENTS = [
  ['INC-0001', 'aug 2021', 'wrote my first line of production code',      'RESOLVED: never recovered', C.green],
  ['INC-0107', 'nov 2023', 'charged per user to verify my own users',     'MITIGATED: built Auther',   C.blue],
  ['INC-0203', 'jan 2024', 'three dashboards, one outage, zero answers',  'MITIGATED: building Reliable', C.green],
  ['INC-0442', 'ongoing',  'a year of work judged by green squares',      'WONTFIX: 93% is private',   C.amber],
];

const INC_Y = 66 + 4 * 64 + 14;
const incidentRows = INCIDENTS.map(([id, date, title, res, col], i) => {
  const y = INC_Y + 40 + i * 24;
  return `
  <text x="20" y="${y}" font-size="10.5" fill="${col}">${id}</text>
  <text x="96" y="${y}" font-size="10.5" fill="${C.faint}">${date}</text>
  <text x="170" y="${y}" font-size="10.5" fill="${C.text}">${esc(title)}</text>
  <text x="860" y="${y}" font-size="10.5" fill="${C.muted}" text-anchor="end">${esc(res)}</text>`;
}).join('');

const R3H = INC_Y + 40 + 4 * 24 + 6;
const row3 = svg(R3H, '',
  panel(0, 0, W, R3H) + `
  <circle cx="26" cy="26" r="4" fill="${C.green}">
    <animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" values="1;0.35;1"/>
  </circle>
  <text x="40" y="30" font-size="12.5" font-weight="600" fill="${C.text}">status.zyloris</text>
  <text x="860" y="30" font-size="11" fill="${C.green}" text-anchor="end">all systems shipping</text>
  <line x1="18" y1="44" x2="862" y2="44" stroke="${C.rule}"/>`
  + serviceRows + `
  <line x1="18" y1="${INC_Y}" x2="862" y2="${INC_Y}" stroke="${C.rule}"/>
  <text x="20" y="${INC_Y + 22}" font-size="11" fill="${C.muted}" letter-spacing="1">PAST INCIDENTS</text>`
  + incidentRows
);

for (const [n, s] of Object.entries({ 'trace.svg': row1, 'ops.svg': row2, 'status.svg': row3 })) {
  fs.writeFileSync(path.join(OUT, n), s);
  console.log(`  ${n.padEnd(12)} ${(s.length / 1024).toFixed(1)} KB`);
}
