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

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let sections: { element: HTMLElement; top: number; height: number; bodyHeight: number; targetScale: number }[] = [];
    let animationFrame = 0;

    const updateStack = () => {
      animationFrame = 0;

      sections.forEach(({ element: section, top, height, bodyHeight, targetScale }, index) => {
        section.style.zIndex = String(index + 1);
        const consumed = Math.min(Math.max(scrollArea.scrollTop - top, 0), bodyHeight);
        section.style.transformOrigin = `center ${consumed}px`;

        if (reduceMotion.matches || index === sections.length - 1) {
          section.style.transform = "none";
          section.style.setProperty("--stack-scale", "1");
          return;
        }

        const nextTop = sections[index + 1].top - scrollArea.scrollTop;
        const overlapDistance = Math.max(height, 1);
        const progress = Math.min(Math.max((overlapDistance - nextTop) / overlapDistance, 0), 1);

        if (progress <= 0) {
          section.style.transform = "none";
          section.style.setProperty("--stack-scale", "1");
          return;
        }

        const scale = 1 - (1 - targetScale) * progress;

        section.style.transform = `scale(${scale.toFixed(4)})`;
        section.style.setProperty("--stack-scale", scale.toFixed(4));
      });
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateStack);
    };

    const observedElements = new Set<Element>();
    const resizeObserver = new ResizeObserver(() => measureStack());
    const observe = (element: Element) => {
      if (!observedElements.has(element)) {
        observedElements.add(element);
        resizeObserver.observe(element);
      }
    };
    const measureStack = () => {
      let nextTop = 0;
      sections = Array.from(scrollArea.querySelectorAll<HTMLElement>(":scope > .stack-section")).map(section => {
        const header = section.querySelector<HTMLElement>(".stack-header");
        const styles = window.getComputedStyle(section);
        const height = parseFloat(styles.height) || section.offsetHeight;
        const headerHeight = header
          ? parseFloat(window.getComputedStyle(header).height) || header.offsetHeight
          : height;
        const bodyHeight = Math.max(height - headerHeight, 0);
        const horizontalMargin = parseFloat(styles.paddingLeft) || 0;
        const top = nextTop + (parseFloat(styles.marginTop) || 0);
        nextTop = top + height + (parseFloat(styles.marginBottom) || 0);
        section.style.setProperty("--stack-body-height", `${bodyHeight}px`);
        observe(section);
        if (header) observe(header);
        return { element: section, top, height, bodyHeight,
          targetScale: Math.max((section.offsetWidth - horizontalMargin * 2) / section.offsetWidth, 0.8) };
      });
      const lastSection = sections[sections.length - 1];
      // A short final section still needs enough travel to cover the preceding header.
      scrollArea.style.setProperty("--stack-end-space", `${Math.max(
        scrollArea.clientHeight - (lastSection?.height ?? scrollArea.clientHeight), 0,
      )}px`);
      scheduleUpdate();
    };

    measureStack();
    scrollArea.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", measureStack);
    reduceMotion.addEventListener("change", scheduleUpdate);

    return () => {
      scrollArea.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", measureStack);
      resizeObserver.disconnect();
      reduceMotion.removeEventListener("change", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [children]);

  return <div className="page-content" ref={scrollRef}>{children}</div>;
}
