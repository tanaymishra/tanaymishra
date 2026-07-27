<p align="center">
  <img src="assets/orb.svg" width="100%" alt="A cloud of particles that resolves into a name once per rotation">
</p>

<p align="center"><sub>wait for it.</sub></p>

---

<p align="center">
  <b>2021</b> &nbsp;a css button that glowed. that was the whole personality.<br>
  <b>2026</b> &nbsp;auth infra, uptime monitors, pipelines that deploy while i'm asleep.
</p>

<p align="center"><b>never stopped. not one gap year.</b></p>

<p align="center">
  <sub>the green squares lie btw. most of what i ship is private.</sub>
</p>

---

<p align="center">
  <b>build</b> &nbsp; typescript · node · postgres · flutter<br>
  <b>ship</b> &nbsp; docker · ci/cd · self-hosted · zero-downtime<br>
  <b>own</b> &nbsp; frontend to the server it dies on
</p>

---

<details>
<summary><b>how this page works</b></summary>

<br>

no javascript here. github strips `<script>`, `<style>` and every event handler before your
browser sees the file, so this page cannot have a runtime.

it has a build step instead. `build/orb.js` puts 400 particles in real 3-D space and solves the
full perspective projection for all 48 keyframes ahead of time. those ship as SMIL value lists.
the browser only interpolates between answers that were already worked out.

the reveal is anamorphic, same trick as the skull in Holbein's *The Ambassadors*. every particle
gets a random depth along its own view ray, then its coordinates are solved backwards so that at
yaw zero it lands on a letterform. the geometry is honest at every angle. exactly one angle is
readable.

```
node build/orb.js
```

</details>
