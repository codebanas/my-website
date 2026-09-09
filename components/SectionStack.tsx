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

    const nav = scrollArea.querySelector<HTMLElement>(":scope > .nav");
    const observedElements = new Set<Element>();
    const resizeObserver = new ResizeObserver(() => measureStack());
    const observe = (element: Element) => {
      if (!observedElements.has(element)) {
        observedElements.add(element);
        resizeObserver.observe(element);
      }
    };
    const measureStack = () => {
      const availableHeight = Math.max(scrollArea.clientHeight - (nav?.offsetHeight ?? 0), 0);
      const sectionHeights = Array.from(scrollArea.querySelectorAll<HTMLElement>(":scope > .stack-section")).map((section, index) => {
        const header = section.querySelector<HTMLElement>(".stack-header");
        const styles = window.getComputedStyle(section);
        const height = parseFloat(styles.height) || section.offsetHeight;
        const headerHeight = header
          ? parseFloat(window.getComputedStyle(header).height) || header.offsetHeight
          : height;
        const bodyHeight = Math.max(height - headerHeight, 0);
        section.style.zIndex = String(index + 1);
        section.style.setProperty("--stack-body-height", `${bodyHeight}px`);
        observe(section);
        if (header) observe(header);
        return height;
      });
      const lastSectionHeight = sectionHeights[sectionHeights.length - 1] ?? availableHeight;
      // A short final section still needs enough travel to cover the preceding header.
      scrollArea.style.setProperty("--stack-end-space", `${Math.max(
        availableHeight - lastSectionHeight, 0,
      )}px`);
    };

    observe(scrollArea);
    if (nav) observe(nav);
    measureStack();
    window.addEventListener("resize", measureStack);

    return () => {
      window.removeEventListener("resize", measureStack);
      resizeObserver.disconnect();
    };
  }, [children]);

  return (
    <div className="page-content" ref={scrollRef} tabIndex={0} role="region" aria-label="Page navigation and sections">
      {children}
    </div>
  );
}
