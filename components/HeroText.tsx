"use client";

import { useEffect, useState } from "react";

const endings = ["\\", "\\>", "*"] as const;

export default function HeroText() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;

    const syncAnimation = () => {
      if (timer !== undefined) clearInterval(timer);
      setFrame(0);
      if (!reducedMotion.matches) {
        timer = setInterval(() => setFrame((current) => (current + 1) % endings.length), 800);
      }
    };

    syncAnimation();
    reducedMotion.addEventListener("change", syncAnimation);
    return () => {
      if (timer !== undefined) clearInterval(timer);
      reducedMotion.removeEventListener("change", syncAnimation);
    };
  }, []);

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <h1 className="hero-title" id="hero-title">
        <span className="hero-title-line">Supporters With Benefits</span>
        <span className="hero-title-line">
          Made Simple &amp; Real.
          <span className="hero-ending" aria-hidden="true">
            <span className="hero-ending-measure">{endings[1]}</span>
            <span className="hero-ending-value">{endings[frame]}</span>
          </span>
        </span>
      </h1>
      <p className="hero-description">
        Support what we&apos;re building and discover opportunities to receive something back from the
        community you help grow.
      </p>
    </section>
  );
}
