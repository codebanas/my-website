"use client";

import { useEffect, useRef, type ReactNode } from "react";

type SectionStackProps = {
  children: ReactNode;
};

export function SectionStack({ children }: SectionStackProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollArea = scrollRef.current;

    if (!scrollArea) return;

    const sections = Array.from(scrollArea.querySelectorAll<HTMLElement>(".stack-section"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const updateStack = () => {
      animationFrame = 0;

      sections.forEach((section, index) => {
        section.style.zIndex = String(index + 1);

        if (reduceMotion.matches || index === sections.length - 1) {
          section.style.setProperty("--stack-scale", "1");
          return;
        }

        const nextSection = sections[index + 1];
        const nextTop = nextSection.offsetTop - scrollArea.scrollTop;
        const overlapDistance = Math.max(section.offsetHeight, 1);
        const progress = Math.min(Math.max((overlapDistance - nextTop) / overlapDistance, 0), 1);
        const styles = window.getComputedStyle(section);
        const horizontalMargin = parseFloat(styles.paddingLeft) || 0;
        const targetScale = Math.max((section.offsetWidth - horizontalMargin * 2) / section.offsetWidth, 0.8);
        const scale = 1 - (1 - targetScale) * progress;

        section.style.setProperty("--stack-scale", scale.toFixed(4));
      });
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateStack);
    };

    scheduleUpdate();
    scrollArea.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reduceMotion.addEventListener("change", scheduleUpdate);

    return () => {
      scrollArea.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reduceMotion.removeEventListener("change", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <div className="page-content" ref={scrollRef}>{children}</div>;
}
