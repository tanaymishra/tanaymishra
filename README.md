<p align="center">
  <img src="assets/v3-hero.svg" width="880" alt="Tanay Mishra, Full Stack Developer building Ziloris. Pixel art of a developer coding at 3am, a whoami terminal, and matrix rain.">
</p>

<p align="center">
  <img src="assets/v3-vitals.svg" width="880" alt="System status: brain 78%, motivation 90%, sleep 6%, coffee running. GitHub stats: 3,830 contributions, 3,549 private, 77 repos, 3 stars. Language donut chart.">
</p>

<p align="center">
  <img src="assets/v3-stack.svg" width="880" alt="Stack coverage: frontend, backend, databases, ci/cd, security, disaster recovery, all near 100%. Creed: if it can be self-hosted it will be, if it's open source it's already better, if it ships without CI it does not ship, if the db goes down I wrote the runbook.">
</p>

<p align="center">
  <img src="assets/v3-maths.svg" width="880" alt="maths.txt with puns about Euler's identity, big-O, floating point, and P vs NP, next to a disaster recovery drill log where zero users noticed.">
</p>

<p align="center">
  <img src="assets/v3-projects.svg" width="880" alt="Ziloris projects: reliable (beta), auther (beta), straincraft (archived, physics won round one), folio (live).">
</p>

<p align="center">
  <sub><a href="https://ziloris.com"><b>Ziloris</b></a> is not a company. it is an open source, free-to-use software
  initiative I work on full time: uptime without the pager sprawl, auth without per-user pricing, documents that never
  leave your browser. every project above is open to contributions, pick one at
  <a href="https://ziloris.com">ziloris.com</a>.</sub>
</p>

<p align="center">
  <img src="assets/v3-chaos.svg" width="880" alt="installing_personality.sh checklist, life.exe flowchart (wake up, have plans? no: code), and rubber duck debugging log.">
</p>

<p align="center">
  <img src="assets/v3-footer.svg" width="880" alt="quote.log, a pixel dino jumping cacti, and a visitor counter reading 001337.">
</p>

---

<details>
<summary><b>how this page works</b></summary>

<br>

no javascript, no external images, no font CDNs. github strips `<script>`, `<style>` and every
event handler before your browser sees this file, and the SVGs are served under
`default-src 'none'` so they cannot fetch anything either. the pixel art is a few hundred
`<rect>` elements placed at build time, and the only thing moving is SMIL animation, the one
thing github's sanitizer leaves alive.

**the numbers are real**, pulled from the GraphQL API, including the ones that make me look
smaller. 3 public stars. 3,549 of my 3,830 contributions this year are private: the green
squares lie.

**the project statuses are read from the Ziloris source**, not written by hand. ARCHIVED means
I tried and physics won. for now.

the visitor counter is hardcoded to 1337. you knew that.

```
node build/dash-v3.js
```

</details>
