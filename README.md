# ITZFIZZ — Scroll-Driven Hero

A recreation of the [car scroll animation](https://paraschaturvedi.github.io/car-scroll-animation)
reference. A pinned hero stage where a top-view supercar drives across a dark
road while it lights up a letter-spaced headline and activates four stat cards.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4** and
**GSAP 3 / ScrollTrigger**.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script          | Purpose                          |
| --------------- | -------------------------------- |
| `npm run dev`   | Dev server with fast refresh     |
| `npm run build` | Production build                 |
| `npm run start` | Serve the production build       |
| `npm run lint`  | ESLint (flat config, `core-web-vitals`) |

> If your shell exports `NODE_ENV=development`, prefix production builds with
> `$env:NODE_ENV="production"` — `next build` refuses to run otherwise.

## Deployment

Live at **https://itzfizz-scroll-hero-eta.vercel.app**

Deployed directly with the Vercel CLI (v54) against the `chiragsingh17` personal
account. No custom domain, no environment variables, and zero image requests —
the car is inline SVG, so there is nothing to configure.

```bash
npm i -g vercel
vercel login
vercel --prod --yes --name itzfizz-scroll-hero   # first deploy
vercel --prod --yes                              # subsequent deploys
```

Vercel auto-detects Next.js, so there is no `vercel.json`. The project is fully
static — `/`, `/_not-found` and `/icon.svg` are all prerendered at build time.

| Production URL | `https://itzfizz-scroll-hero-eta.vercel.app` |
| -------------- | -------------------------------------------- |
| Project        | `itzfizz-scroll-hero`                          |
| Build command  | `next build` (default)                         |
| Output         | Static prerender, `NODE_ENV=production`        |

The deployed build was verified in a real browser over the network: car position
and trail alignment match the local build to within 1px, all 14 letters and 4
cards activate in order, the pin engages and releases, there is no horizontal
overflow at 1440×900 or 390×844, and no console errors or failed requests.

## How the animation is put together

The whole scene is two GSAP timelines inside one `gsap.context()`, so
`ctx.revert()` on unmount restores every mutated style.

### 1. Load sequence (`components/HeroSection.js`)

A short one-shot timeline, independent of scroll: the eyebrow fades up, the
14 headline letters flip in on a stagger, the road wipes open with `scaleX`,
the car settles in, and the scroll hint rises.

### 2. Scroll scene

```js
const scene = gsap.timeline({
  defaults: { duration: 1, ease: "none" },
  onUpdate() { syncToProgress(this.progress()); },
  scrollTrigger: {
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    pin: stage,
    pinSpacing: true,
    anticipatePin: 1,
    scrub: 0.8,
    invalidateOnRefresh: true,
    onRefresh: (self) => { measure(); syncToProgress(self.progress); },
  },
});
```

The section is `280vh`; the stage is pinned for that whole run, so the scrub
range is the section height minus one viewport.

**The reveals hang off the timeline's `onUpdate`, not `ScrollTrigger.onUpdate`.**
`ScrollTrigger.onUpdate` fires on raw scroll events, which is ahead of the
smoothed playhead — letters and cards would flicker on before the car reached
them. The timeline's own `onUpdate` runs on every scrubbed frame, so the
reveals stay locked to the car's actual rendered position.

### 3. Position-driven reveal

`syncToProgress` derives the car's centre from progress and lights anything to
its left:

```js
const carCentre = -geo.carW * 0.5 + (geo.stageW + geo.carW) * progress;
if (!hit.lit && carCentre >= hit.x) { /* light the letter / switch the card on */ }
```

Trigger points are measured once per layout via `offsetWithin`, which walks the
`offsetLeft` / `offsetParent` chain — so CSS transforms applied by the animation
itself cannot corrupt the geometry. `invalidateOnRefresh` + `onRefresh` re-measure
on resize.

Reveals are **one-way latches**: once a letter is lit it stays lit, even if you
scroll back up. Everything else (car, trail, markings, headline drift, hint)
rewinds with the scrollbar. The message is meant to be fully readable at any
point, so the reveal never takes text away from you.

## Two non-obvious gotchas

These cost real debugging time and are worth not rediscovering.

### `querySelector` never matches the element it is called on

```js
// wrong — always null
const section = root.querySelector("[data-hero-section]");

// right
const section = root;
```

This was silent and nasty: with a `null` trigger, ScrollTrigger fell back to
degenerate numbers (`start: -0.011`, `end: -0.001`, `progress: 1`) and the whole
scene appeared to work while never actually animating on scroll.

### Resting state must match the tween's `from` value

With `scrub`, the very first rendered frame happens at `progress === 0`, and
GSAP renders the target's *pre-tween* state there. If that state differs from
your `from` value, the element visibly jumps on the first pixel of scroll.

Two fixes, one for each element:

- **Car** — a wrong render is *visible*, so the resting position is declared in
  CSS (`left: calc(var(--car-w) * -1)`) and the tween carries it from there:
  `fromTo(car, { x: 0 }, { x: stageW + carW })`. Rendered left is therefore
  `-carW + (stageW + carW) * p`, which is `-371 → 1440` at 1440px wide.
- **Trail** — a wrong render is *invisible* (it is clipped by the road), so
  either `scaleX: 0` or the true negative start works. The mathematically
  correct start is used, so the trail's right edge sits exactly on the car's
  centre at every progress value.

`--car-w` is derived in CSS from the 736×360 viewBox aspect ratio, so the
resting position can never drift out of sync with the artwork:

```css
.hero-stage {
  --road-h: clamp(104px, 19vh, 214px);
  --car-h: calc(var(--road-h) * 1.06);  /* car rides 6% proud of the tarmac */
  --car-w: calc(var(--car-h) * 2.0444);
}
```

## Layered transform ownership

Tweening the same property from two timelines makes them fight. Each wrapper
element owns exactly one animated property:

| Element                  | Property    | Driven by                |
| ------------------------ | ----------- | ------------------------ |
| `.hl__rise`              | `yPercent` | load sequence            |
| `.hl`                    | `yPercent` | scroll scene            |
| `.hl__lit`               | `opacity`  | reveal on car pass       |
| `.stat`                  | entrance   | load sequence            |
| `.stat__inner`           | `y`,`scale`| card activation          |
| `.hero-foot > div`       | `opacity`  | load sequence            |
| `.hero-foot`             | `opacity`  | scroll scene            |

## Performance

Everything animates `transform` and `opacity` only — no layout, no paint.
`will-change: transform` is set on the car, trail, letters and cards.
Road markings are a single `repeating-linear-gradient` moving via `xPercent`
over exactly one period (`0 → -50%`), so the loop never seams.

## Reduced motion

`prefers-reduced-motion: reduce` is honoured two ways:

- **JS** — the scene returns early: no ScrollTrigger, no pin, no dead scroll
  space. All letters render lit, all cards render in their final state and the
  count-ups print their final numbers.
- **CSS** — `.hero-section` collapses from `280vh` to `100svh`.

## Responsive

| Breakpoint  | Layout                                                      |
| ----------- | ----------------------------------------------------------- |
| > 1080px    | 4 stat cards in a row, full-size car                          |
| ≤ 1080px    | 2 × 2 card grid, even stagger removed                         |
| ≤ 560px     | Smaller road/car/cards, headline drops to `clamp(1.1rem, 7.2vw, 2.2rem)` |

All geometry is measured at runtime rather than hard-coded, so the scene holds
up across viewports. Verified with no horizontal overflow at 1440×900 and 390×844.

## Project structure

```
app/
  globals.css        theme tokens, hero/road/card/headline styling
  layout.js          metadata, viewport, body classes
  page.js            hero + closing notes section
components/
  CarTopView.js      inline top-view supercar SVG (no image requests)
  HeroSection.js     load timeline, measurement, scroll scene
  StatCard.js        count-up card with theme palettes
```

`CarTopView` is hand-authored SVG inlined as a component, so the hero makes zero
image requests and the car stays crisp at any size.

## Accessibility

- Real `<h2>` carrying `aria-label="WELCOME ITZFIZZ"`, so assistive tech reads
  one phrase rather than fourteen separate letter nodes.
- Road, trail, car, grain and veil are all `aria-hidden` decoration.
- Reduced motion fully disables the scroll choreography.
