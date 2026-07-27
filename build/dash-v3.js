// Profile v3: dense bento-grid terminal, drawn entirely at build time.
//
// Same constraints as ever: GitHub strips <script>/<style>/handlers, SVGs are served
// under `default-src 'none'`, so no external fonts, no external images, no JS. Every
// pixel of "art" below is a <rect>, and the only motion is SMIL.
//
// Deterministic output (seeded LCG, no Math.random) so rebuilds diff cleanly.

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const W = 880, CYCLE = 14;

const C = {
  bg: '#070709', panel: '#0d0d12', edge: '#22222e', rule: '#1a1a24',
  text: '#e6edf3', muted: '#8b98a5', faint: '#525b66',
  green: '#4ade80', dim: '#22c55e', violet: '#a78bfa', pink: '#f472b6',
  amber: '#fbbf24', blue: '#60a5fa', cyan: '#22d3ee', yellow: '#facc15',
};

let _seed = 42;
const rnd = () => (_seed = (_seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const svg = (h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img">
  <defs>${defs}</defs>
  <style>text{font-family:ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,monospace}</style>
  <rect width="${W}" height="${h}" fill="${C.bg}"/>
  ${body}
</svg>
`;

const panel = (x, y, w, h) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${C.panel}" stroke="${C.edge}" stroke-width="1.2"/>`;

// "❯ title.ext" header used on every panel
const head = (x, y, title, right, rw) => `
  <text x="${x + 16}" y="${y + 26}" font-size="12" fill="${C.green}">&#10095; <tspan fill="${C.text}" font-weight="600">${esc(title)}</tspan></text>
  ${right ? `<text x="${x + (rw || 0) - 16}" y="${y + 26}" font-size="10" fill="${C.faint}" text-anchor="end">${esc(right)}</text>` : ''}`;

// staggered fade-in that loops with the page cycle
const fadeIn = (at) => {
  const a = (at / CYCLE).toFixed(4), b = ((at + 0.3) / CYCLE).toFixed(4);
  return `<animate attributeName="opacity" dur="${CYCLE}s" repeatCount="indefinite" keyTimes="0;${a};${b};0.96;1" values="0;0;1;1;0"/>`;
};

/* ════ row 1 · hero: pixel scene + whoami + matrix rain ═══════════════════ */

const R1H = 352;

// ── pixel scene (each char is an 8px rect) ──
const PIX_COLORS = {
  h: '#312050', f: '#eab389', b: '#7c3aed', B: '#6d28d9',
  m: '#15151d', s: '#7dd3fc', S: '#38bdf8', g: '#123043',
  d: '#4a3728', D: '#332419', c: '#26262e', u: '#e5e7eb', k: '#101016',
};
const PIX = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..........hhhhh...............',
  '.........hhhhhhh..............',
  '.........hhffffh..............',
  '.........hffffff..............',
  '..........ffff................',
  '..........bbbb.....gggggg.....',
  '.........bbbbbb...gmmmmmmg....',
  '........bBbbbbb...gmsssSmg....',
  '........bBbbbbb...gmsSssmg....',
  '........bBbbbbbb..gmsssSmg....',
  '........bbbbbbbb...mmmmmm.....',
  '..........kkkk....... mm......',
  '..................uu..mm......',
  'dddddddddddddddddddddddddddddd',
  'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
  '......cccc....................',
  '......cccc....................',
];
const PXS = 8, PIX_X = 14, PIX_Y = 16;
const pixels = PIX.flatMap((row, r) =>
  [...row].map((ch, c) => PIX_COLORS[ch]
    ? `<rect x="${PIX_X + c * PXS}" y="${PIX_Y + r * PXS}" width="${PXS}" height="${PXS}" fill="${PIX_COLORS[ch]}"/>`
    : '').filter(Boolean)
).join('');

// screen flicker + wall props (poster, clock) drawn on top of the scene
const props = `
  <rect x="${PIX_X + 18 * PXS}" y="${PIX_Y + 10 * PXS}" width="${6 * PXS}" height="${4 * PXS}" fill="#7dd3fc" opacity="0.14">
    <animate attributeName="opacity" dur="3.2s" repeatCount="indefinite" values="0.14;0.05;0.18;0.14"/>
  </rect>
  <rect x="${PIX_X + 16}" y="${PIX_Y + 2}" width="52" height="60" rx="2" fill="#141420" stroke="#2a2a3a"/>
  <text x="${PIX_X + 42}" y="${PIX_Y + 18}" font-size="7.5" fill="${C.green}" text-anchor="middle" letter-spacing="1">EAT</text>
  <text x="${PIX_X + 42}" y="${PIX_Y + 30}" font-size="7.5" fill="${C.green}" text-anchor="middle" letter-spacing="1">SLEEP</text>
  <text x="${PIX_X + 42}" y="${PIX_Y + 42}" font-size="7.5" fill="${C.green}" text-anchor="middle" letter-spacing="1">CODE</text>
  <text x="${PIX_X + 42}" y="${PIX_Y + 54}" font-size="7.5" fill="${C.faint}" text-anchor="middle" letter-spacing="1">REPEAT</text>
  <rect x="${PIX_X + 172}" y="${PIX_Y + 6}" width="54" height="22" rx="3" fill="#141420" stroke="#2a2a3a"/>
  <text x="${PIX_X + 199}" y="${PIX_Y + 21}" font-size="9.5" fill="${C.violet}" text-anchor="middle">03:12 AM<tspan fill="${C.violet}"><animate attributeName="opacity" dur="1.4s" repeatCount="indefinite" values="1;0.2;1"/></tspan></text>`;

const FIELDS = [
  ['location', 'India', C.text],
  ['company',  'ziloris (mine)', C.text],
  ['stack',    'db to ci/cd, all of it', C.text],
  ['timezone', 'UTC+5:30 (ships at 3am)', C.muted],
  ['mood',     'debug::life();', C.green],
];

const heroLeft = panel(0, 0, 268, R1H) + pixels + props + `
  <text x="16" y="222" font-size="19" font-weight="700" fill="${C.text}">Tanay Mishra</text>
  <text x="16" y="244" font-size="11.5" fill="${C.green}">Full Stack Developer</text>
  <text x="16" y="261" font-size="10.5" fill="${C.muted}">systems, security, and</text>
  <text x="16" y="275" font-size="10.5" fill="${C.muted}">everything between.</text>`
  + FIELDS.map(([k, v, col], i) => `
  <text x="16" y="${296 + i * 15}" font-size="9.5" fill="${C.faint}">&#10095; ${k}</text>
  <text x="96" y="${296 + i * 15}" font-size="9.5" fill="${col}">: ${esc(v)}</text>`).join('');

// ── whoami terminal ──
const TRAITS = [
  ['full stack, actually', 'auth nerd'],
  ['uptime obsessed',      'db whisperer'],
  ['self-hosts everything','pipeline gardener'],
  ['overthinker',          'perfectionist*'],
];
const heroMid = panel(280, 0, 288, R1H) + `
  <text x="296" y="30" font-size="11.5" fill="${C.green}">tanay@github:~$ <tspan fill="${C.text}">whoami</tspan></text>`
  + TRAITS.flatMap(([a, b], i) => {
    const y = 62 + i * 26;
    return [
      `<g opacity="0"><text x="296" y="${y}" font-size="10.5" fill="${C.violet}">&#10095; <tspan fill="${C.text}">${esc(a)}</tspan></text>${fadeIn(0.6 + i * 0.5)}</g>`,
      `<g opacity="0"><text x="440" y="${y}" font-size="10.5" fill="${C.violet}">&#10095; <tspan fill="${C.text}">${esc(b)}</tspan></text>${fadeIn(0.85 + i * 0.5)}</g>`,
    ];
  }).join('')
  + `
  <g opacity="0"><text x="296" y="172" font-size="9.5" fill="${C.faint}">*recovering. mostly.</text>${fadeIn(3.1)}</g>
  <line x1="296" y1="188" x2="552" y2="188" stroke="${C.rule}"/>
  <text x="296" y="214" font-size="11.5" fill="${C.green}">tanay@github:~$ <tspan fill="${C.text}">cat truth.txt</tspan></text>
  <g opacity="0"><text x="296" y="244" font-size="10.5" fill="${C.text}">3,830 contributions this year</text>${fadeIn(4.2)}</g>
  <g opacity="0"><text x="296" y="266" font-size="10.5" fill="${C.muted}">3,549 of them private</text>${fadeIn(4.7)}</g>
  <g opacity="0"><text x="296" y="288" font-size="10.5" fill="${C.green}">the green squares lie.</text>${fadeIn(5.2)}</g>
  <text x="296" y="330" font-size="11" fill="${C.green}">&#9608;<animate attributeName="opacity" dur="1.1s" repeatCount="indefinite" values="1;0;1"/></text>`;

// ── matrix rain ──
const KATA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789$#*+=';
const rainCols = [];
for (let i = 0; i < 12; i++) {
  const x = 596 + i * 23;
  const n = 14 + Math.floor(rnd() * 6);
  const chars = Array.from({ length: n }, () => KATA[Math.floor(rnd() * KATA.length)]);
  const dur = (4 + rnd() * 5).toFixed(1);
  const begin = (-rnd() * 8).toFixed(1);
  const col = rnd() < 0.18 ? C.violet : C.green;
  const op = (0.25 + rnd() * 0.55).toFixed(2);
  rainCols.push(`
  <g opacity="${op}">
    <text x="${x}" y="0" font-size="11" fill="${col}">${chars.map((ch, j) =>
      `<tspan x="${x}" dy="${j === 0 ? 0 : 15}"${j === n - 1 ? ` fill="${C.text}"` : ''}>${esc(ch)}</tspan>`).join('')}</text>
    <animateTransform attributeName="transform" type="translate" from="0 ${-n * 15}" to="0 ${R1H + 20}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
  </g>`);
}
const heroRight = panel(580, 0, 300, R1H) + `
  <clipPath id="rainclip"><rect x="581" y="1" width="298" height="${R1H - 2}" rx="10"/></clipPath>
  <g clip-path="url(#rainclip)">${rainCols.join('')}
    <rect x="581" y="1" width="298" height="46" fill="url(#fadeTop)"/>
    <rect x="581" y="${R1H - 60}" width="298" height="59" fill="url(#fadeBot)"/>
  </g>
  <text x="866" y="${R1H - 16}" font-size="9.5" fill="${C.faint}" text-anchor="end">uptime: since 2021 · no incidents lasting</text>`;

const row1 = svg(R1H, `
  <linearGradient id="fadeTop" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.panel}"/><stop offset="1" stop-color="${C.panel}" stop-opacity="0"/></linearGradient>
  <linearGradient id="fadeBot" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.panel}" stop-opacity="0"/><stop offset="1" stop-color="${C.panel}"/></linearGradient>`,
  heroLeft + heroMid + heroRight
);

/* ════ row 2 · vitals: system status + stats + languages ══════════════════ */

const R2H = 248;

const PROCS = [
  ['brain.exe',      78, C.green],
  ['motivation.sys', 97, C.green],
  ['social.bat',     15, C.pink],
  ['sleep.dll',       6, C.violet],
];
const sysBars = PROCS.map(([n, p, col], i) => {
  const y = 64 + i * 30;
  const w = (p / 100) * 148;
  return `
  <text x="16" y="${y}" font-size="10" fill="${C.muted}">${n}</text>
  <rect x="118" y="${y - 9}" width="148" height="10" rx="2" fill="${C.rule}"/>
  <rect x="118" y="${y - 9}" height="10" rx="2" fill="${col}" width="${w.toFixed(1)}">
    <animate attributeName="width" dur="${CYCLE}s" repeatCount="indefinite" calcMode="spline"
      keySplines="0 0 1 1;0.16 1 0.3 1;0 0 1 1;0 0 1 1" keyTimes="0;${(0.03 + i * 0.02).toFixed(3)};${(0.12 + i * 0.02).toFixed(3)};0.96;1"
      values="0;0;${w.toFixed(1)};${w.toFixed(1)};0"/>
  </rect>
  <text x="270" y="${y}" font-size="9.5" fill="${col}" text-anchor="end" font-weight="600">${p}%</text>`;
}).join('');

const vitalsA = panel(0, 0, 284, R2H) + head(0, 0, 'system_status', null) + sysBars + `
  <line x1="16" y1="186" x2="268" y2="186" stroke="${C.rule}"/>
  <text x="16" y="210" font-size="10" fill="${C.muted}">coffee.exe</text>
  <text x="268" y="210" font-size="10" fill="${C.green}" text-anchor="end">RUNNING<tspan fill="${C.green}"> &#9679;</tspan><animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="1;0.4;1"/></text>
  <text x="16" y="230" font-size="10" fill="${C.muted}">lofi.stream</text>
  <text x="268" y="230" font-size="10" fill="${C.green}" text-anchor="end">RUNNING &#9835;</text>`;

const SEGS = 12, FILLED = 11;
const hpBar = Array.from({ length: SEGS }, (_, i) => {
  const on = i < FILLED;
  return `<rect x="${376 + i * 15}" y="52" width="12" height="14" rx="2" fill="${on ? C.pink : C.rule}"${on ? '' : ' opacity="0.8"'}/>`;
}).join('');

const STATS = [
  ['contributions (12mo)', '3,830', C.text],
  ['private, invisible',   '3,549', C.pink],
  ['repositories',         '77',    C.text],
  ['public stars',         '3 (ouch)', C.muted],
];
const vitalsB = panel(296, 0, 284, R2H) + head(296, 0, 'github_stats.exe', null) + `
  <path transform="translate(312,50) scale(0.75)" fill="${C.pink}" d="M12 21s-8-5.3-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.7-8 11-8 11z">
    <animateTransform attributeName="transform" type="scale" additive="sum" dur="2.2s" repeatCount="indefinite" values="1;1.15;1" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1"/>
  </path>
  ${hpBar}
  <text x="564" y="84" font-size="9" fill="${C.faint}" text-anchor="end">93% of the work is invisible</text>`
  + STATS.map(([k, v, col], i) => `
  <text x="312" y="${116 + i * 26}" font-size="10.5" fill="${C.muted}">${k}</text>
  <text x="564" y="${116 + i * 26}" font-size="10.5" fill="${col}" text-anchor="end" font-weight="600">${v}</text>`).join('') + `
  <text x="312" y="228" font-size="9.5" fill="${C.green}">&#10095; stars are a lagging indicator. so is sleep.</text>`;

const LANGS = [
  ['TypeScript', 37, '#3178c6'], ['CSS', 11, '#663399'], ['Python', 8, '#3572a5'],
  ['JavaScript', 6, '#f1e05a'],  ['HTML', 5, '#e34c26'], ['Other', 10, '#6e7681'],
];
const LT = LANGS.reduce((a, l) => a + l[1], 0);
const DR = 46, DC = 2 * Math.PI * DR;
let dacc = 0;
const donut = LANGS.map(([, c, col]) => {
  const len = (c / LT) * DC;
  const seg = `<circle cx="688" cy="140" r="${DR}" fill="none" stroke="${col}" stroke-width="17"
    stroke-dasharray="${(len - 2).toFixed(1)} ${(DC - len + 2).toFixed(1)}" stroke-dashoffset="${(-dacc + DC / 4).toFixed(1)}"/>`;
  dacc += len;
  return seg;
}).join('\n  ');

const vitalsC = panel(608, 0, 272, R2H) + head(608, 0, 'languages.py', null) + donut + `
  <text x="688" y="137" font-size="13" font-weight="700" fill="${C.text}" text-anchor="middle">77</text>
  <text x="688" y="152" font-size="8" fill="${C.faint}" text-anchor="middle">repos</text>`
  + LANGS.map(([n, c, col], i) => `
  <circle cx="757" cy="${84 + i * 22}" r="3.6" fill="${col}"/>
  <text x="768" y="${88 + i * 22}" font-size="9.5" fill="${C.text}">${n}</text>
  <text x="866" y="${88 + i * 22}" font-size="9.5" fill="${C.faint}" text-anchor="end">${((c / LT) * 100).toFixed(0)}%</text>`).join('');

const row2 = svg(R2H, '', vitalsA + vitalsB + vitalsC);

/* ════ row 3 · tech_stack.json ════════════════════════════════════════════ */

const R3H = 258;
const STACK = [
  ['frontend', C.violet, ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Vite']],
  ['backend',  C.green,  ['Node', 'Express', 'REST', 'WebSockets', 'Redis']],
  ['database', C.yellow, ['Postgres', 'Prisma', 'sharding', 'replication', 'backups that restore']],
  ['devops',   C.cyan,   ['Docker', 'Nginx', 'GitHub Actions', 'Linux', 'blue-green deploys']],
];

const chips = STACK.map(([cat, col, items], r) => {
  const y = 70 + r * 34;
  let x = 122;
  const row = items.map(label => {
    const w = label.length * 6.2 + 18;
    const s = `
  <rect x="${x.toFixed(1)}" y="${y - 14}" width="${w.toFixed(1)}" height="21" rx="10.5" fill="none" stroke="${col}" opacity="0.55"/>
  <text x="${(x + w / 2).toFixed(1)}" y="${y}" font-size="10" fill="${C.text}" text-anchor="middle">${esc(label)}</text>`;
    x += w + 9;
    return s;
  }).join('');
  return `<text x="16" y="${y}" font-size="11" fill="${col}" font-weight="600">${cat}</text>` + row;
}).join('');

const CREED = [
  'if it can be self-hosted, it will be',
  'if it ships without CI, it does not ship',
  'if the db goes down, I wrote the runbook',
];
const row3 = svg(R3H, '',
  panel(0, 0, W, R3H) + head(0, 0, 'tech_stack.json', 'every layer, no favorites', W) + chips + `
  <line x1="16" y1="196" x2="864" y2="196" stroke="${C.rule}"/>`
  + CREED.map((l, i) =>
    `<text x="16" y="${218 + i * 17}" font-size="10" fill="${i === 2 ? C.green : C.muted}">&#10095; ${esc(l)}</text>`).join('')
);

/* ════ row 4 · zyloris projects ═══════════════════════════════════════════ */

const R4H = 208;
const PROJECTS = [
  { n: 'reliable', col: C.green, s: 'BUILDING', dot: '#3178c6', lang: 'TypeScript',
    d: ['uptime, incidents, alerts.', 'the whole pager,', 'one place.'] },
  { n: 'auther', col: C.blue, s: 'PUBLIC BETA', dot: '#3178c6', lang: 'TypeScript',
    d: ['SSO + MFA without', 'per-user pricing. your', 'users stay yours.'] },
  { n: 'straincraft', col: C.amber, s: 'CONCEPT', dot: '#3572a5', lang: 'Python',
    d: ['molecules, rendered.', 'bio-visualization', 'experiments.'] },
  { n: 'pdfedit', col: C.amber, s: 'CONCEPT', dot: '#3178c6', lang: 'TypeScript',
    d: ['pdf editing that never', 'leaves your browser.', 'nothing uploaded.'] },
];

const cards = PROJECTS.map((p, i) => {
  const x = i * 224;
  return `
  <rect x="${x}" y="44" width="208" height="150" rx="9" fill="${C.panel}" stroke="${C.edge}" stroke-width="1.2"/>
  <text x="${x + 16}" y="72" font-size="13" font-weight="700" fill="${p.col}">${p.n}</text>`
  + p.d.map((l, j) => `
  <text x="${x + 16}" y="${94 + j * 15}" font-size="9.5" fill="${C.muted}">${esc(l)}</text>`).join('') + `
  <line x1="${x + 16}" y1="${152}" x2="${x + 192}" y2="152" stroke="${C.rule}"/>
  <circle cx="${x + 21}" cy="172" r="4" fill="${p.dot}"/>
  <text x="${x + 31}" y="176" font-size="9" fill="${C.muted}">${p.lang}</text>
  <text x="${x + 192}" y="176" font-size="8.5" fill="${p.col}" text-anchor="end" letter-spacing="0.6">${p.s}</text>`;
}).join('');

const row4 = svg(R4H, '', `
  <text x="2" y="24" font-size="12" fill="${C.green}">&#10095; <tspan fill="${C.text}" font-weight="600">zyloris_projects.md</tspan></text>
  <text x="878" y="24" font-size="10" fill="${C.faint}" text-anchor="end">one company, four bets, statuses read from source</text>`
  + cards
);

/* ════ row 5 · chaos: install script + life.exe + rubber duck ═════════════ */

const R5H = 324;

const INSTALL = [
  ['curiosity', 'installed', C.green],
  ['stubbornness', 'installed', C.green],
  ['caffeine dependency', 'installed', C.green],
  ['overthinking', 'installed (x2)', C.green],
  ['dark theme', 'preinstalled', C.green],
  ['imposter syndrome', 'uninstall failed', C.amber],
  ['work-life balance', 'FAILED (retrying)', C.pink],
];
const chaosA = panel(0, 0, 284, R5H) + head(0, 0, 'installing_personality.sh', null) + `
  <text x="16" y="56" font-size="10" fill="${C.muted}">$ ./install --yes --force</text>`
  + INSTALL.map(([k, v, col], i) => `
  <g opacity="0">
    <text x="16" y="${82 + i * 24}" font-size="9.5" fill="${col}">[${col === C.pink ? '&#10007;' : '&#10003;'}]</text>
    <text x="40" y="${82 + i * 24}" font-size="9.5" fill="${C.text}">${esc(k)}</text>
    <text x="268" y="${82 + i * 24}" font-size="9" fill="${col}" text-anchor="end">${esc(v)}</text>
    ${fadeIn(0.5 + i * 0.55)}
  </g>`).join('') + `
  <g opacity="0"><text x="16" y="${82 + 7 * 24 + 12}" font-size="9.5" fill="${C.muted}">install complete. mostly.</text>${fadeIn(4.8)}</g>`;

// life.exe flowchart
const box = (cx, y, w, label, col) => `
  <rect x="${cx - w / 2}" y="${y}" width="${w}" height="24" rx="5" fill="none" stroke="${col || C.edge}" stroke-width="1.2"/>
  <text x="${cx}" y="${y + 16}" font-size="9.5" fill="${C.text}" text-anchor="middle">${esc(label)}</text>`;
const arrow = (x1, y1, x2, y2, dash) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.muted}" stroke-width="1.1"${dash ? ' stroke-dasharray="3 3"' : ''} marker-end="url(#arr)"/>`;

const FX = 296, FCX = FX + 142;
const chaosB = panel(FX, 0, 284, R5H) + head(FX, 0, 'life.exe', null) + `
  ${box(FCX, 46, 84, 'wake up', C.violet)}
  ${arrow(FCX, 70, FCX, 88)}
  <polygon points="${FCX},88 ${FCX + 64},116 ${FCX},144 ${FCX - 64},116" fill="none" stroke="${C.amber}" stroke-width="1.2"/>
  <text x="${FCX}" y="113" font-size="9" fill="${C.text}" text-anchor="middle">have</text>
  <text x="${FCX}" y="125" font-size="9" fill="${C.text}" text-anchor="middle">plans?</text>
  <text x="${FCX - 84}" y="112" font-size="8.5" fill="${C.faint}">no</text>
  <text x="${FCX + 72}" y="112" font-size="8.5" fill="${C.faint}">yes</text>
  ${arrow(FCX - 64, 116, FCX - 94, 116)}${arrow(FCX - 94, 116, FCX - 94, 180)}
  ${arrow(FCX + 64, 116, FCX + 94, 116)}${arrow(FCX + 94, 116, FCX + 94, 170)}
  ${box(FCX + 94, 170, 92, 'cancel plans', C.pink)}
  ${arrow(FCX + 94, 194, FCX + 94, 214)}${arrow(FCX + 94, 220, FCX - 60, 220)}
  ${box(FCX - 94, 180, 62, 'code', C.green)}
  ${arrow(FCX - 94, 204, FCX - 94, 214)}${arrow(FCX - 94, 220, FCX - 94, 244)}
  ${box(FCX - 40, 244, 170, 'git push && sleep(4h)', C.green)}
  ${arrow(FCX - 40, 268, FCX - 40, 284)}
  ${box(FCX, 284, 120, 'repeat forever')}
  ${arrow(FCX + 60, 296, FCX + 122, 296, 1)}${arrow(FCX + 122, 296, FCX + 122, 58, 1)}${arrow(FCX + 122, 58, FCX + 44, 58, 1)}`;

const DUCK = [
  '        __',
  '      <(o )___',
  '       ( ._> /',
  "        `---'"
];
const chaosC = panel(592, 0, 288, R5H) + head(592, 0, 'rubber_duck.log', null)
  + DUCK.map((l, i) => `
  <text x="612" y="${60 + i * 15}" font-size="12" fill="${C.yellow}" xml:space="preserve">${esc(l)}</text>`).join('') + `
  <text x="740" y="82" font-size="9.5" fill="${C.muted}">status: listening</text>
  <line x1="608" y1="132" x2="864" y2="132" stroke="${C.rule}"/>
  <text x="608" y="156" font-size="10" fill="${C.muted}">bugs explained aloud</text>
  <text x="864" y="156" font-size="10" fill="${C.text}" text-anchor="end" font-weight="600">4,096</text>
  <text x="608" y="178" font-size="10" fill="${C.muted}">solved mid-sentence</text>
  <text x="864" y="178" font-size="10" fill="${C.green}" text-anchor="end" font-weight="600">4,095</text>
  <text x="608" y="200" font-size="10" fill="${C.muted}">duck's contribution</text>
  <text x="864" y="200" font-size="10" fill="${C.yellow}" text-anchor="end" font-weight="600">immeasurable</text>
  <line x1="608" y1="220" x2="864" y2="220" stroke="${C.rule}"/>
  <text x="608" y="244" font-size="10" fill="${C.text}">I don't need therapy,</text>
  <text x="608" y="260" font-size="10" fill="${C.text}">I need a new side project.</text>
  <text x="608" y="292" font-size="9.5" fill="${C.faint}">initializing_ideas.exe</text>
  <rect x="608" y="300" width="256" height="8" rx="2" fill="${C.rule}"/>
  <rect x="608" y="300" width="253" height="8" rx="2" fill="${C.green}">
    <animate attributeName="width" dur="6s" repeatCount="indefinite" values="200;253;200" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1"/>
  </rect>
  <text x="864" y="294" font-size="9.5" fill="${C.green}" text-anchor="end">99%</text>`;

const row5 = svg(R5H, `
  <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0 0 L8 4 L0 8 z" fill="${C.muted}"/>
  </marker>`,
  chaosA + chaosB + chaosC
);

/* ════ row 6 · footer: quote + dino + counter ═════════════════════════════ */

const R6H = 96;

// tiny pixel dino (3px pixels)
const DINO = [
  '......#####',
  '.....##.###',
  '.....######',
  '.....##....',
  '.....####..',
  '#...###....',
  '##.#####...',
  '.#######...',
  '..#####....',
  '...###.....',
  '...#.#.....',
  '...#.#.....',
];
const DPX = 3, DX = 560, DY = 24;
const dino = DINO.flatMap((row, r) =>
  [...row].map((ch, c) => ch === '#'
    ? `<rect x="${DX + c * DPX}" y="${DY + r * DPX}" width="${DPX}" height="${DPX}" fill="${C.violet}"/>` : '')
).join('');

const cactus = (x, h) => `
  <g>
    <rect x="${x}" y="${64 - h}" width="4" height="${h}" fill="${C.dim}"/>
    <rect x="${x - 3}" y="${64 - h + 4}" width="3" height="6" fill="${C.dim}"/>
    <rect x="${x + 4}" y="${64 - h + 7}" width="3" height="5" fill="${C.dim}"/>
    <animateTransform attributeName="transform" type="translate" from="230 0" to="-40 0" dur="5s" begin="${x % 7 - 3}s" repeatCount="indefinite"/>
  </g>`;

const DIGITS = '001337';
const counter = [...DIGITS].map((d, i) => `
  <rect x="${736 + i * 22}" y="30" width="18" height="26" rx="3" fill="#141420" stroke="${C.edge}"/>
  <text x="${745 + i * 22}" y="48" font-size="13" fill="${C.green}" text-anchor="middle" font-weight="700">${d}</text>`).join('');

const row6 = svg(R6H, '',
  panel(0, 0, W, R6H) + `
  <text x="16" y="30" font-size="12" fill="${C.green}">&#10095; <tspan fill="${C.text}" font-weight="600">quote.log</tspan></text>
  <text x="16" y="56" font-size="11" fill="${C.text}">"works on my machine" is a valid target.</text>
  <text x="16" y="74" font-size="11" fill="${C.muted}">I ship the machine. <tspan fill="${C.faint}">(docker, basically)</tspan></text>
  <clipPath id="dinoclip"><rect x="470" y="10" width="240" height="70"/></clipPath>
  <g clip-path="url(#dinoclip)">
    <g>
      ${dino}
      <animateTransform attributeName="transform" type="translate" dur="2.5s" repeatCount="indefinite" calcMode="spline"
        keySplines="0.3 0 0.2 1;0.4 0 0.7 1;0 0 1 1" keyTimes="0;0.12;0.24;1" values="0 0;0 -16;0 0;0 0"/>
    </g>
    ${cactus(500, 14)}${cactus(560, 10)}
    <line x1="470" y1="64" x2="710" y2="64" stroke="${C.edge}" stroke-dasharray="4 3"/>
  </g>
  ${counter}
  <text x="866" y="74" font-size="9" fill="${C.faint}" text-anchor="end">visitors, allegedly</text>`
);

/* ════ write ══════════════════════════════════════════════════════════════ */

const files = {
  'v3-hero.svg': row1, 'v3-vitals.svg': row2, 'v3-stack.svg': row3,
  'v3-projects.svg': row4, 'v3-chaos.svg': row5, 'v3-footer.svg': row6,
};
for (const [n, s] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, n), s);
  console.log(`  ${n.padEnd(16)} ${(s.length / 1024).toFixed(1)} KB`);
}
