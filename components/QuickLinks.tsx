"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { getQuickLinkWindow, hasReachedPageEnd, quickLinks as links } from "@/lib/quick-links";
import { startQuickLinksScroll } from "@/lib/quick-links-scroll";

export default function QuickLinks() {
  const navigation = useRef<HTMLElement>(null);
  const activeIndex = useRef(0);
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [atPageEnd, setAtPageEnd] = useState(false);
  const visibleWindow = getQuickLinkWindow(active, links.length);

  const selectLink = useCallback((index: number) => {
    activeIndex.current = index;
    setActive(index);
  }, []);

  useEffect(() => {
    const element = navigation.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      if (visible) setRevealed(true);
    }, { threshold: [0, 0.2] });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    let mounted = true;

    function updateScene() {
      frame = 0;
      const root = document.documentElement;
      const atEnd = hasReachedPageEnd(window.scrollY, root.scrollHeight, root.clientHeight);
      setAtPageEnd(atEnd);
    }

    function scheduleUpdate() {
      if (mounted && !frame) frame = window.requestAnimationFrame(updateScene);
    }

    updateScene();
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.documentElement);
    document.fonts.ready.then(scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      mounted = false;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    const element = navigation.current;
    if (!element) return;
    return startQuickLinksScroll(element, {
      isAtEnd: () => {
        const root = document.documentElement;
        return hasReachedPageEnd(window.scrollY, root.scrollHeight, root.clientHeight);
      },
      getActiveIndex: () => activeIndex.current,
      selectLink,
      linkCount: links.length,
    });
  }, [selectLink]);

  return (
    <div className="quick-links-end-content" data-at-end={atPageEnd}>
      <nav
        className="quick-links"
        aria-label="Quick links"
        ref={navigation}
        data-revealed={revealed}
        onKeyDown={(event) => {
          const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
          if (!step && event.key !== "Home" && event.key !== "End") return;
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1
            : Math.max(0, Math.min(links.length - 1, activeIndex.current + step));
          selectLink(next);
          navigation.current?.querySelectorAll("button")[next]?.focus({ preventScroll: true });
        }}
      >
        <div className="quick-links-viewport">
          <div
            className="quick-links-list"
            style={{ "--quick-link-window-start": visibleWindow.start } as CSSProperties}
          >
            {links.map((label, index) => {
              const visible = index >= visibleWindow.start && index < visibleWindow.end;
              return (
                <button
                  className="pill-button quick-link"
                  type="button"
                  key={label}
                  aria-pressed={active === index}
                  aria-hidden={visible ? undefined : true}
                  tabIndex={visible ? 0 : -1}
                  onClick={() => selectLink(index)}
                >
                  <span>{label}</span>
                  {active === index && (
                    <img src="/nav/arrow-white-circle.svg" alt="" width={16} height={16} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      <p className="hero-description quick-links-terms">Terms &amp; Conditions</p>
    </div>
  );
}
