"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CarTopView from "./CarTopView";
import StatCard from "./StatCard";

gsap.registerPlugin(ScrollTrigger);

const HEADLINE = ["W", "E", "L", "C", "O", "M", "E"];
const HEADLINE_TAIL = ["I", "T", "Z", "F", "I", "Z", "Z"];

const STATS = [
  { value: 58, label: "Increase in pick-up point usage", theme: "lime" },
  { value: 23, label: "Decrease in customer phone calls", theme: "sky" },
  { value: 27, label: "Faster average order fulfilment", theme: "ink" },
  { value: 40, label: "Growth in repeat customers", theme: "orange" },
];

/** Distance from `el` to the left edge of `rootEl`, ignoring CSS transforms. */
function offsetWithin(el, rootEl) {
  let total = 0;
  let node = el;
  while (node && node !== rootEl) {
    total += node.offsetLeft;
    node = node.offsetParent;
  }
  return total;
}

export default function HeroSection() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      // the section *is* the context root, and querySelector() never matches the
      // element it is called on — so reference it directly.
      const section = root;
      const eyebrow = root.querySelector("[data-eyebrow]");
      const road = root.querySelector("[data-road]");
      const roadInner = root.querySelector("[data-road-inner]");
      const marks = root.querySelector("[data-marks]");
      const trail = root.querySelector("[data-trail]");
      const car = root.querySelector("[data-car]");
      const hint = root.querySelector("[data-hint]");
      const hintInner = root.querySelector("[data-hint-inner]");

      const letters = gsap.utils.toArray("[data-letter]");
      const letterRises = gsap.utils.toArray("[data-letter-rise]");
      const letterLits = gsap.utils.toArray("[data-letter-lit]");
      const cards = gsap.utils.toArray("[data-stat]");
      const cardInners = gsap.utils.toArray("[data-stat-inner]");

      /* ------------------------------------------------ static load state */

      gsap.set(letterLits, { opacity: 0.16 });
      cards.forEach((card) => {
        card.dataset.on = "false";
      });
      gsap.set(cardInners, { y: 0, scale: 1 });

      if (reduceMotion) {
        gsap.set(letterLits, { opacity: 1 });
        cards.forEach((card) => {
          card.dataset.on = "true";
        });
        return;
      }

      /* ------------------------------------------------- 1. load sequence */

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .from(eyebrow, { opacity: 0, y: 20, duration: 0.85 }, 0.04)
        .from(
          letterRises,
          {
            opacity: 0,
            yPercent: 54,
            rotateX: -80,
            duration: 1.35,
            stagger: 0.032,
            ease: "power4.out",
          },
          0.12,
        )
        .from(
          roadInner,
          {
            scaleX: 0,
            duration: 1.55,
            ease: "expo.out",
          },
          0.24,
        )
        .from(car, { scale: 0.94, duration: 1.7 }, 0.62)
        .from(hintInner, { opacity: 0, y: 18, duration: 0.95 }, 0.95);

      /* --------------------------------------- 2. scroll-tied measurement */

      const geo = { stageW: 0, carW: 0 };
      const letterHits = letterLits.map((el) => ({
        el,
        x: 0,
        lit: false,
      }));
      const cardHits = cards.map((card, i) => ({
        el: card,
        inner: cardInners[i],
        x: 0,
        active: false,
      }));

      const measure = () => {
        geo.stageW = stage.offsetWidth;
        geo.carW = car.offsetWidth;

        letterHits.forEach((hit, i) => {
          hit.x = offsetWithin(letters[i], stage) + letters[i].offsetWidth / 2;
        });

        cardHits.forEach((hit, i) => {
          hit.x = offsetWithin(cards[i], stage) + cards[i].offsetWidth / 2;
        });
      };

      measure();

      /* ------------------- 3. progress logic: reveal + activate the markers */

      function syncToProgress(progress) {
        const carCentre =
          -geo.carW * 0.5 + (geo.stageW + geo.carW) * progress;

        for (let i = 0; i < letterHits.length; i++) {
          const hit = letterHits[i];
          if (!hit.lit && carCentre >= hit.x) {
            hit.lit = true;
            gsap.to(hit.el, {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
            });
            gsap.fromTo(
              hit.el,
              { scale: 1.3 },
              { scale: 1, duration: 0.78, ease: "power3.out" },
            );
          }
        }

        for (let i = 0; i < cardHits.length; i++) {
          const hit = cardHits[i];
          if (!hit.active && carCentre >= hit.x) {
            hit.active = true;
            hit.el.dataset.on = "true";
            gsap.to(hit.inner, {
              y: -12,
              scale: 1.045,
              duration: 0.72,
              ease: "power3.out",
            });
          }
        }
      }

      /* ----------------------------------------- 4. the scroll-driven scene */

      const scene = gsap.timeline({
        defaults: { duration: 1, ease: "none" },
        // Driven by the timeline rather than by ScrollTrigger.onUpdate, because
        // ScrollTrigger only reports raw scroll events. This fires on every
        // scrubbed frame, so the reveals stay locked to the smoothed position
        // of the car instead of jumping ahead of it.
        onUpdate: function syncScene() {
          syncToProgress(this.progress());
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          pin: stage,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            measure();
            syncToProgress(self.progress);
          },
        },
      });

      // the timeline is authored as one unit of progress; keep it exactly 1
      scene.to({}, { duration: 1 }, 0);

      // Car drives in from off-screen left and out past the right edge. The
      // resting position is supplied by CSS (`left: -carW`), so this tween
      // only has to carry the car from there to one viewport width further.
      scene.fromTo(
        car,
        { x: 0 },
        { x: () => stage.offsetWidth + car.offsetWidth },
        0,
      );

      // Trail. Its right edge must land exactly on the car's centre, i.e.
      // roadW * scaleX === -carW/2 + (stageW + carW) * p, which is a straight
      // line in p — so scaleX itself is linear in scroll progress and can be
      // authored as a plain two-value tween with no per-frame JavaScript.
      // The start value is negative, which parks the trail off the left edge
      // (clipped by the road) until the car actually enters the frame.
      scene.fromTo(
        trail,
        {
          scaleX: () => -(car.offsetWidth * 0.5) / road.offsetWidth,
        },
        {
          scaleX: () =>
            (stage.offsetWidth + car.offsetWidth * 0.5) / road.offsetWidth,
        },
        0,
      );

      // road markings parallax — one full gradient period, so it never seams
      scene.fromTo(marks, { xPercent: 0 }, { xPercent: -50 }, 0);

      // headline drifts up and recedes as the journey progresses
      scene.to(
        letters,
        {
          yPercent: -15,
          scale: 0.962,
          duration: 0.84,
          stagger: 0.012,
        },
        0,
      );

      // scroll affordance retires as soon as scrolling begins
      scene.to(
        hint,
        { opacity: 0, y: 30, duration: 0.13, ease: "power1.out" },
        0,
      );
    }, root);

    return () => ctx.revert();
  }, []);

  const renderWord = (chars, keyPrefix) =>
    chars.map((char, i) => (
      <span className="hl" data-letter key={`${keyPrefix}-${char}-${i}`}>
        <span className="hl__rise" data-letter-rise>
          <span className="hl__lit" data-letter-lit>
            {char}
          </span>
        </span>
      </span>
    ));

  return (
    <section ref={rootRef} data-hero-section className="hero-section relative h-[280vh] w-full bg-ink">
      <div ref={stageRef} className="hero-stage">
        <div className="hero-veil" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />

        <div className="hero-content">
          <p
            data-eyebrow
            className="mb-[clamp(14px,2.4vh,30px)] text-[clamp(.56rem,.72vw,.68rem)] font-bold uppercase tracking-[.42em] text-ink/55"
          >
            Scroll driven hero
          </p>

          <h2 className="headline" aria-label="WELCOME ITZFIZZ">
            {renderWord(HEADLINE, "a")}
            <span className="hl__gap" aria-hidden="true" />
            {renderWord(HEADLINE_TAIL, "b")}
          </h2>

          <div className="stats-grid">
            {STATS.map((stat, i) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                theme={stat.theme}
                index={i}
              />
            ))}
          </div>
        </div>

        <div className="road" data-road aria-hidden="true">
          <div className="road__inner" data-road-inner>
            <span className="road__marks" data-marks />
            <span className="trail" data-trail />
            <div className="car" data-car>
              <CarTopView className="h-full w-full" />
            </div>
          </div>
        </div>

        <div className="hero-foot" data-hint>
          <div data-hint-inner>
            <span className="hint">
              <span className="hint__dot" aria-hidden="true" />
              Scroll to drive
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
