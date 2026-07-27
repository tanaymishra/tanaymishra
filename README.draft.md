<p align="center">
  <img src="assets/v3-hero.svg" width="880" alt="Tanay Mishra, Full Stack Developer building Zyloris. Pixel art of a developer coding at 3am, a whoami terminal, and matrix rain.">
</p>

<p align="center">
  <img src="assets/v3-vitals.svg" width="880" alt="System status: brain 78%, motivation 42%, sleep 6%, coffee running. GitHub stats: 3,830 contributions, 3,549 private, 77 repos, 3 stars. Language donut chart.">
</p>

<p align="center">
  <img src="assets/v3-stack.svg" width="880" alt="Tech stack: React, Next.js, TypeScript, Tailwind, Node, Express, Redis, Postgres, sharding, replication, Docker, Nginx, GitHub Actions, Linux.">
</p>

<p align="center">
  <img src="assets/v3-projects.svg" width="880" alt="Zyloris projects: reliable (building), auther (public beta), straincraft (concept), pdfedit (concept).">
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

**the project statuses are read from the Zyloris source**, not written by hand, so "CONCEPT"
means it is genuinely still a concept.

the visitor counter is hardcoded to 1337. you knew that.

```
node build/dash-v3.js
```

</details>
