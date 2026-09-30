import HeroSection from "@/components/HeroSection";

const NOTES = [
  {
    k: "Scroll coupling",
    v: "Pinned stage, scrub 0.8",
  },
  {
    k: "Interpolation",
    v: "Linear on scroll, eased on reveal",
  },
  {
    k: "Motion budget",
    v: "transform / opacity only",
  },
];

export default function Page() {
  return (
    <main>
      <HeroSection />

      <section className="relative z-10 w-full bg-ink px-6 py-20 sm:py-28">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-[.6rem] font-bold uppercase tracking-[.42em] text-white/40">
            The journey ends here
          </p>
          <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
            Motion is tied to scroll progress, never to a clock.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/55">
            The car position, the trailing gradient, the road-marking parallax
            and the letter-by-letter headline reveal are all derived from a
            single scrubbed timeline. Every property written per frame is a
            compositor-only transform, so the scene stays pinned at 60fps.
          </p>

          <dl className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
            {NOTES.map((note) => (
              <div key={note.k} className="bg-ink p-6">
                <dt className="text-[.58rem] font-bold uppercase tracking-[.3em] text-white/35">
                  {note.k}
                </dt>
                <dd className="mt-2 text-base font-semibold text-white/90">
                  {note.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
