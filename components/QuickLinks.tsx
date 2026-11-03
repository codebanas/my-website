"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const links = ["Home", "How It Works?", "Buy Me a Coffee"] as const;

export default function QuickLinks() {
  const navigation = useRef<HTMLElement>(null);
  const activeIndex = useRef(0);
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const selectLink = useCallback((index: number) => {
    activeIndex.current = index;
    setActive(index);
  }, []);

  useEffect(() => {
    const element = navigation.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setRevealed(true);
      observer.disconnect();
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
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
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
      const step = Math.sign(event.deltaY);
      if (!gestureUsed && !canMove(step)) return;
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
      if (event.touches.length !== 1) {
        touch = undefined;
        return;
      }
      touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, used: false };
    }

    function onTouchMove(event: TouchEvent) {
      if (!touch || event.touches.length !== 1) return;
      const delta = touch.y - event.touches[0].clientY;
      if (Math.abs(delta) < 8 || Math.abs(touch.x - event.touches[0].clientX) > Math.abs(delta)) return;
      const step = Math.sign(delta);
      if (!touch.used && !canMove(step)) return;
      event.preventDefault();
      if (!touch.used && Math.abs(delta) >= 28) {
        selectLink(activeIndex.current + step);
        touch.used = true;
      }
    }

    const endTouch = () => { touch = undefined; };
    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchmove", onTouchMove, { passive: false });
    element.addEventListener("touchend", endTouch);
    element.addEventListener("touchcancel", endTouch);
    return () => {
      if (resetTimer !== undefined) clearTimeout(resetTimer);
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchend", endTouch);
      element.removeEventListener("touchcancel", endTouch);
    };
  }, [selectLink]);

  return (
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
        navigation.current?.querySelectorAll("button")[next]?.focus();
      }}
    >
      {links.map((label, index) => (
        <button
          className="pill-button quick-link"
          type="button"
          key={label}
          aria-pressed={active === index}
          onClick={() => selectLink(index)}
        >
          <span>{label}</span>
          {active === index && (
            <img src="/nav/arrow-white-circle.svg" alt="" width={16} height={16} />
          )}
        </button>
      ))}
    </nav>
  );
}
