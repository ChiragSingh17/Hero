"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const THEME = {
  lime: { fill: "#def54f", on: "#101012", off: "#f6f7f2" },
  sky: { fill: "#6ac9ff", on: "#0d1a24", off: "#f6f7f2" },
  ink: { fill: "#2f3136", on: "#f7f8f4", off: "#f6f7f2" },
  orange: { fill: "#fa7328", on: "#241004", off: "#f6f7f2" },
};

export default function StatCard({ value, label, theme = "lime", index = 0 }) {
  const cardRef = useRef(null);
  const innerRef = useRef(null);
  const numberRef = useRef(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const number = numberRef.current;
    if (!card || !number) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      number.textContent = String(value);
      gsap.set(card, { opacity: 1, y: 0 });
      return;
    }

    const counter = { n: 0 };
    const countTween = gsap.to(counter, {
      n: value,
      duration: 1.7,
      ease: "power3.out",
      delay: 0.55 + index * 0.12,
      onUpdate: () => {
        number.textContent = String(Math.round(counter.n));
      },
    });

    const entrance = gsap.from(card, {
      opacity: 0,
      y: 46,
      duration: 1.15,
      delay: 0.3 + index * 0.12,
      ease: "power3.out",
    });

    return () => {
      countTween.kill();
      entrance.kill();
    };
  }, [value, index]);

  const palette = THEME[theme] ?? THEME.lime;

  return (
    <article
      ref={cardRef}
      data-stat
      className="stat"
      style={{
        "--stat-fill": palette.fill,
        "--stat-on": palette.on,
        "--stat-off": palette.off,
      }}
      data-on="false"
    >
      <span className="stat__fill" aria-hidden="true" />
      <div className="stat__inner" ref={innerRef} data-stat-inner>
        <p className="stat__value">
          <span ref={numberRef}>{value}</span>
          <span className="stat__unit" aria-hidden="true">
            %
          </span>
        </p>
        <p className="stat__label">{label}</p>
      </div>
    </article>
  );
}
