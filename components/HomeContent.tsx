"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { getScrollFadeOpacity } from "@/lib/scroll-fade";

export default function HomeContent({ children }: { children: ReactNode }) {
  const content = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = content.current;
    if (!element) return;
    let targets: { element: HTMLElement; initialTop: number }[] = [];
    let frame = 0;
    let needsMeasure = true;
    let mounted = true;

    function update() {
      frame = 0;
      if (!element) return;
      const scrollY = window.scrollY;
      if (needsMeasure) {
        targets = Array.from(element.querySelectorAll<HTMLElement>("[data-scroll-fade]")).map((target) => ({
          element: target,
          initialTop: target.getBoundingClientRect().top + scrollY,
        }));
        needsMeasure = false;
      }
      for (const target of targets) {
        const opacity = getScrollFadeOpacity(target.initialTop - scrollY, target.initialTop);
        target.element.style.setProperty("--scroll-opacity", String(opacity));
      }
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    function scheduleMeasure() {
      if (!mounted) return;
      needsMeasure = true;
      scheduleUpdate();
    }

    update();
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(element);
    document.fonts.ready.then(scheduleMeasure);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      mounted = false;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleMeasure);
      for (const target of targets) target.element.style.removeProperty("--scroll-opacity");
    };
  }, []);

  return <main className="home-content" aria-label="Codebanas" ref={content}>{children}</main>;
}
