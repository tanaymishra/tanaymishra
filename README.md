<p align="center">
  <img src="assets/orb.svg" width="100%" alt="A cloud of particles that resolves into a name once per rotation">
</p>

<p align="center"><sub>wait for it.</sub></p>

---

<p align="center">
  <b>Auther</b> &nbsp;·&nbsp; authentication and user management for organizations<br>
  <b>Reliable</b> &nbsp;·&nbsp; uptime monitoring<br>
  <b>Zyloris</b> &nbsp;·&nbsp; <a href="https://ziloris.com">ziloris.com</a>
</p>

---

<details>
<summary><b>how this page works</b></summary>

<br>

There is no JavaScript on this page. GitHub's markdown sanitizer strips `<script>`, `<style>`,
and every event handler before your browser ever sees the file. So the animation above cannot
have a runtime.

It has a build step instead.

`build/orb.js` places 400 particles in real 3-D space and computes the full perspective
projection for all 48 keyframes of a rotation, ahead of time. Those frames ship as SMIL value
lists inside the SVG. The browser never calculates anything, it only interpolates between
positions that were already solved on my machine.

The illusion is anamorphic, the same trick as the skull in Holbein's *The Ambassadors*. Each
particle is dropped at a random depth along its own view ray, then its 3-D coordinates are
solved backwards so that at exactly yaw zero it projects onto a letterform. One angle out of
360 is legible. Everywhere else the geometry is honest and the image is noise.

The dwell at the top of the loop is not a pause in the animation. It is the rotation easing
through zero, which is also why the word arrives slowly and leaves fast.

```
node build/orb.js
```

</details>
