"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import QuickLinksArtwork from "@/components/QuickLinksArtwork";
import { getQuickLinkWindow, hasReachedPageEnd, quickLinks as links } from "@/lib/quick-links";

export default function QuickLinks() {
  const navigation = useRef<HTMLElement>(null);
  const pageAtEnd = useRef(false);
  const activeIndex = useRef(0);
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [artworkVisible, setArtworkVisible] = useState(false);
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
      pageAtEnd.current = atEnd;
      setArtworkVisible(atEnd);
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
    let distance = 0;
    let direction = 0;
    let gestureUsed = false;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;
    let touch: { x: number; y: number; used: boolean } | undefined;

    const canMove = (step: number) => activeIndex.current + step >= 0
      && activeIndex.current + step < links.length;

    function onWheel(event: WheelEvent) {
      if (!pageAtEnd.current || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
      const step = Math.sign(event.deltaY);
      if (!gestureUsed && !canMove(step)) {
        if (step > 0) event.preventDefault();
        return;
      }
      event.preventDefault();
      if (resetTimer !== undefined) clearTimeout(resetTimer);
      // Treat trackpad momentum as one gesture, rather than skipping every link.
      resetTimer = setTimeout(() => {
        distance = 0;
        direction = 0;
        gestureUsed = false;
      }, 180);
      if (gestureUsed) return;
      if (direction !== step) distance = 0;
      direction = step;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element!.clientHeight : 1;
      distance += Math.abs(event.deltaY) * unit;
      if (distance >= 32) {
        selectLink(activeIndex.current + step);
        gestureUsed = true;
      }
    }

    function onTouchStart(event: TouchEvent) {
      if (!pageAtEnd.current || event.touches.length !== 1) {
        touch = undefined;
        return;
      }
      touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, used: false };
    }

    function onTouchMove(event: TouchEvent) {
      if (!pageAtEnd.current || !touch || event.touches.length !== 1) return;
      const delta = touch.y - event.touches[0].clientY;
      if (Math.abs(delta) < 8 || Math.abs(touch.x - event.touches[0].clientX) > Math.abs(delta)) return;
      const step = Math.sign(delta);
      if (!touch.used && !canMove(step)) {
        if (step > 0) event.preventDefault();
        return;
      }
      event.preventDefault();
      if (!touch.used && Math.abs(delta) >= 28) {
        selectLink(activeIndex.current + step);
        touch.used = true;
      }
    }

    const endTouch = () => { touch = undefined; };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", endTouch);
    window.addEventListener("touchcancel", endTouch);
    return () => {
      if (resetTimer !== undefined) clearTimeout(resetTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", endTouch);
      window.removeEventListener("touchcancel", endTouch);
    };
  }, [selectLink]);

  return (
    <>
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
      <QuickLinksArtwork visible={artworkVisible} />
    </>
  );
}
