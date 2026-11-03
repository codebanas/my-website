"use client";

import { useEffect, useRef, useState } from "react";
import { getQuickLinkCueState } from "@/lib/quick-links";

export default function QuickLinksCue() {
  const cue = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const element = cue.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    function updateArrow() {
      frame = 0;
      if (!element) return;
      const viewportHeight = window.innerHeight;
      const { progress, atEnd: finished } = getQuickLinkCueState({
        scrollTop: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight,
        viewportHeight,
        cueBottom: element.getBoundingClientRect().bottom + window.scrollY,
        reducedMotion: reducedMotion.matches,
      });
      setAtEnd(finished);

      // Expand the arrow's layout space from zero so the whole row stays centered.
      const expansion = progress * progress * (3 - 2 * progress);
      element.style.setProperty("--arrow-expansion", String(expansion));
      element.style.setProperty("--arrow-line-progress", String(Math.min(1, progress / 0.88)));
      element.style.setProperty("--arrow-head-progress", String(Math.max(0, (progress - 0.88) / 0.12)));
      element.style.setProperty("--arrow-line-visible", progress > 0 ? "1" : "0");
      element.style.setProperty("--arrow-head-visible", progress > 0.88 ? "1" : "0");
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateArrow);
    }

    updateArrow();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.documentElement);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="quick-links-cue" ref={cue} data-at-end={atEnd}>
      <div className="quick-links-cue-content">
        <span className="quick-links-arrow-slot" aria-hidden="true">
          <svg
            className="quick-links-arrow"
            width="96"
            height="24"
            viewBox="0 0 96 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="quick-links-arrow-line" pathLength="1" d="M0 0H80A16 16 0 0 1 96 16V24" />
            <path className="quick-links-arrow-head" pathLength="1" d="M91 19L96 24L101 19" />
          </svg>
        </span>
        <button
          className="back-to-top"
          type="button"
          aria-label="Back to top"
          aria-hidden={!atEnd}
          disabled={!atEnd}
          onClick={() => window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
          })}
        >
          <img src="/nav/circle-up-arrow.svg" alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}
