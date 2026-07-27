// Dashboard cards for the profile README.
//
// Same constraint as orb.js: no JS on the page, and the SVG itself is served under
// `default-src 'none'` so it cannot pull in a single external asset either. Every icon,
// every number and every animation below is drawn or baked here.
//
// All figures are real, pulled from the GitHub GraphQL API. Nothing is decorative.

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const W = 880;
const CYCLE = 16;
const CW = 8.42; // monospace advance at font-size 14

const C = {
  bg: '#0a0e14', card: '#0d1117', line: '#1c2430', rule: '#161d26',
  text: '#e6edf3', dim: '#7d8590', faint: '#484f58',
  green: '#3fb950', blue: '#58a6ff', violet: '#bc8cff', amber: '#d29922', red: '#f85149',
};

const shell = (h, body, defs = '', style = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img">
  <defs>${defs}</defs>
  <style>
    text{font-family:ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,monospace}
    ${style}
  </style>
  <rect width="${W}" height="${h}" rx="10" fill="${C.card}" stroke="${C.line}" stroke-width="1.5"/>
  ${body}
</svg>
`;

const titlebar = (label, h = 36) => `
  <path d="M1.5,11 a9.5,9.5 0 0 1 9.5,-9.5 h858 a9.5,9.5 0 0 1 9.5,9.5 v${h - 11} h-877 Z" fill="#0b1017"/>
  <line x1="1" y1="${h}" x2="${W - 1}" y2="${h}" stroke="${C.line}"/>
  <circle cx="22" cy="18" r="4.5" fill="${C.red}" opacity="0.6"/>
  <circle cx="40" cy="18" r="4.5" fill="${C.amber}" opacity="0.6"/>
  <circle cx="58" cy="18" r="4.5" fill="${C.green}" opacity="0.6"/>
  <text x="${W / 2}" y="23" fill="${C.faint}" font-size="11.5" text-anchor="middle" letter-spacing="0.5">${label}</text>`;

/* ── card 1 · whoami ─────────────────────────────────────────────────────── */

const LINES = [
  { y: 74,  pre: '$ ', preFill: C.green, txt: 'whoami',                                          fill: C.text,   at: 0.4 },
  { y: 100, pre: '> ', preFill: C.violet, txt: 'full stack developer',                            fill: C.text,   at: 1.6 },
  { y: 124, pre: '> ', preFill: C.violet, txt: 'auth infra · uptime monitoring · deploy pipelines', fill: C.dim,   at: 2.2 },
  { y: 148, pre: '> ', preFill: C.violet, txt: 'locked in since 2021',                             fill: C.dim,   at: 3.1 },
  { y: 192, pre: '$ ', preFill: C.green, txt: 'cat contributions.txt',                             fill: C.text,   at: 4.0 },
  { y: 218, pre: '> ', preFill: C.violet, txt: '3,830 this year. 3,549 of them private.',          fill: C.text,   at: 5.4 },
  { y: 242, pre: '> ', preFill: C.violet, txt: 'the green squares lie.',                           fill: C.green,  at: 6.4 },
];

const speed = 0.032;
const clip = (i, l) => {
  const w = (l.pre.length + l.txt.length) * CW + 6;
  const t0 = (l.at / CYCLE).toFixed(4);
  const t1 = ((l.at + l.txt.length * speed) / CYCLE).toFixed(4);
  return `<clipPath id="w${i}"><rect x="24" y="${l.y - 13}" width="0" height="19">`
    + `<animate attributeName="width" dur="${CYCLE}s" repeatCount="indefinite" calcMode="linear"`
    + ` values="0;0;${w.toFixed(0)};${w.toFixed(0)};0" keyTimes="0;${t0};${t1};0.96;1"/></rect></clipPath>`;
};

const whoami = shell(276,
  titlebar('tanay@github: ~') + '\n' + LINES.map((l, i) =>
    `<g clip-path="url(#w${i})"><text x="26" y="${l.y}" font-size="14" fill="${l.preFill}">${l.pre}<tspan fill="${l.fill}">${l.txt}</tspan></text></g>`
  ).join('\n  ')
  + `\n  <rect class="cur" x="26" y="230" width="8" height="15" fill="${C.green}"/>`,
  LINES.map((l, i) => clip(i, l)).join('\n    '),
  `@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
    @keyframes show{0%,${((7.6 / CYCLE) * 100).toFixed(1)}%{visibility:hidden}${((7.7 / CYCLE) * 100).toFixed(1)}%,96%{visibility:visible}100%{visibility:hidden}}
    .cur{animation:blink 1s steps(1) infinite, show ${CYCLE}s linear infinite}`
);

/* ── card 2 · the numbers ────────────────────────────────────────────────── */

// Count-up has to be faked: SVG cannot animate text content, so every intermediate
// value is a separate <text> that is visible for one slice of the ramp.
function countUp(x, y, target, size, fill, start = 0.3, dur = 1.3, steps = 16) {
  const ease = p => 1 - Math.pow(1 - p, 3);
  const frames = [];
  for (let s = 0; s <= steps; s++) {
    const v = Math.round(target * ease(s / steps));
    const a = start + (dur * s) / steps;
    const b = s === steps ? CYCLE * 0.96 : start + (dur * (s + 1)) / steps;
    frames.push(
      `<text x="${x}" y="${y}" font-size="${size}" font-weight="700" fill="${fill}" text-anchor="middle" opacity="0">`
      + `<animate attributeName="opacity" dur="${CYCLE}s" repeatCount="indefinite" calcMode="discrete"`
      + ` values="0;1;0" keyTimes="0;${(a / CYCLE).toFixed(4)};${(b / CYCLE).toFixed(4)}"/>`
      + `${v.toLocaleString('en-US')}</text>`
    );
  }
  return frames.join('');
}

const RING_R = 46, RING_C = 2 * Math.PI * RING_R;
const PCT = 0.927;

const tiles = [
  { x: 420, v: 3830, label: 'contributions', sub: 'last 12 months' },
  { x: 590, v: 77,   label: 'repositories',  sub: '30 public · 47 private' },
  { x: 760, v: 16,   label: 'contributed to', sub: 'other codebases' },
];

const numbers = shell(196,
  titlebar('tanay@github: ~/stats') + `
  <g transform="translate(112,122)">
    <circle r="${RING_R}" fill="none" stroke="${C.rule}" stroke-width="9"/>
    <circle r="${RING_R}" fill="none" stroke="url(#ring)" stroke-width="9" stroke-linecap="round"
            transform="rotate(-90)" stroke-dasharray="${RING_C.toFixed(1)}" stroke-dashoffset="${RING_C.toFixed(1)}">
      <animate attributeName="stroke-dashoffset" dur="${CYCLE}s" repeatCount="indefinite" calcMode="spline"
               keySplines="0.16 1 0.3 1;0 0 1 1;0 0 1 1"
               values="${RING_C.toFixed(1)};${(RING_C * (1 - PCT)).toFixed(1)};${(RING_C * (1 - PCT)).toFixed(1)};${RING_C.toFixed(1)}"
               keyTimes="0;0.14;0.95;1"/>
    </circle>
    <text y="6" font-size="27" font-weight="700" fill="${C.text}" text-anchor="middle">93%</text>
    <text y="24" font-size="9.5" fill="${C.dim}" text-anchor="middle" letter-spacing="1.4">PRIVATE</text>
  </g>
  <text x="112" y="188" font-size="10.5" fill="${C.faint}" text-anchor="middle" letter-spacing="0.6">3,549 of 3,830 hidden</text>
  <line x1="224" y1="62" x2="224" y2="176" stroke="${C.rule}"/>
  ` + tiles.map(t =>
    `<g>${countUp(t.x, 118, t.v, 34, C.text, 0.3 + tiles.indexOf(t) * 0.12)}
    <text x="${t.x}" y="142" font-size="12" fill="${C.dim}" text-anchor="middle">${t.label}</text>
    <text x="${t.x}" y="160" font-size="10" fill="${C.faint}" text-anchor="middle">${t.sub}</text></g>`
  ).join('\n  '),
  `<linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.violet}"/><stop offset="0.5" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.green}"/>
    </linearGradient>`
);

/* ── card 3 · languages, drawn from real repo counts ─────────────────────── */

const LANGS = [
  { n: 'TypeScript', c: 37, col: '#3178c6' },
  { n: 'CSS',        c: 11, col: '#663399' },
  { n: 'Python',     c: 8,  col: '#3572a5' },
  { n: 'JavaScript', c: 6,  col: '#f1e05a' },
  { n: 'HTML',       c: 5,  col: '#e34c26' },
  { n: 'SCSS',       c: 4,  col: '#c6538c' },
  { n: 'Dart',       c: 3,  col: '#00b4ab' },
  { n: 'Other',      c: 2,  col: '#6e7681' },
];
const LTOT = LANGS.reduce((a, l) => a + l.c, 0);

let cursor = 24;
const barSegs = LANGS.map((l, i) => {
  const w = ((W - 48) * l.c) / LTOT;
  const seg = `<rect x="${cursor.toFixed(1)}" y="72" width="${w.toFixed(1)}" height="13" fill="${l.col}" opacity="0">`
    + `<animate attributeName="opacity" dur="${CYCLE}s" repeatCount="indefinite" calcMode="spline" keySplines="0.16 1 0.3 1;0 0 1 1;0 0 1 1"`
    + ` values="0;1;1;0" keyTimes="0;${(0.03 + i * 0.012).toFixed(3)};0.95;1"/></rect>`;
  cursor += w;
  return seg;
});

const legend = LANGS.map((l, i) => {
  const x = 24 + (i % 4) * 214;
  const y = 118 + Math.floor(i / 4) * 26;
  return `<g><circle cx="${x + 5}" cy="${y - 4}" r="5" fill="${l.col}"/>`
    + `<text x="${x + 18}" y="${y}" font-size="12.5" fill="${C.text}">${l.n}</text>`
    + `<text x="${x + 18 + l.n.length * 7.6 + 8}" y="${y}" font-size="11.5" fill="${C.faint}">${((l.c / LTOT) * 100).toFixed(0)}%</text></g>`;
}).join('\n  ');

const langs = shell(180,
  titlebar('tanay@github: ~/languages')
  + `\n  <text x="24" y="60" font-size="11.5" fill="${C.dim}" letter-spacing="0.5">across 77 repositories</text>\n  `
  + barSegs.join('\n  ') + '\n  ' + legend
);

/* ── write ───────────────────────────────────────────────────────────────── */

const files = { 'card-whoami.svg': whoami, 'card-numbers.svg': numbers, 'card-langs.svg': langs };
for (const [name, svg] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), svg);
  console.log(`  ${name.padEnd(20)} ${(svg.length / 1024).toFixed(1)} KB`);
}
