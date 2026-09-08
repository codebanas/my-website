"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type PricingCarouselProps = {
  children: ReactNode;
  count: number;
};

export function PricingCarousel({ children, count }: PricingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef({ itemsPerPage: 1, offsets: [0] });
  const scrollTargetRef = useRef<number | null>(null);
  const cancelSettleRef = useRef<(() => void) | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(count);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const scrollToPage = (page: number) => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const { offsets } = layoutRef.current;
    const nextPage = Math.min(Math.max(page, 0), offsets.length - 1);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    cancelSettleRef.current?.();
    scrollTargetRef.current = offsets[nextPage];
    scroller.scrollTo({
      left: offsets[nextPage],
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const scrollInDirection = (direction: -1 | 1) => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const { offsets } = layoutRef.current;
    let nextPage = direction === 1 ? offsets.length - 1 : 0;
    if (direction === 1) {
      const page = offsets.findIndex(offset => offset > scroller.scrollLeft + 1);
      if (page !== -1) nextPage = page;
    } else {
      for (let page = offsets.length - 1; page >= 0; page--) {
        if (offsets[page] < scroller.scrollLeft - 1) {
          nextPage = page;
          break;
        }
      }
    }
    scrollToPage(nextPage);
  };

  useEffect(() => {
    const scroller = scrollRef.current;
    const firstCard = scroller?.firstElementChild;
    if (!scroller || !(firstCard instanceof HTMLElement)) return;

    let animationFrame = 0;
    let settleTimer = 0;
    let touching = false;
    const cancelSettle = () => {
      window.clearTimeout(settleTimer);
      settleTimer = 0;
    };
    cancelSettleRef.current = cancelSettle;

    const settle = () => {
      settleTimer = 0;
      if (touching || scrollTargetRef.current !== null) return;
      const { offsets } = layoutRef.current;
      const target = offsets.reduce((nearest, offset) => (
        Math.abs(offset - scroller.scrollLeft) < Math.abs(nearest - scroller.scrollLeft)
          ? offset
          : nearest
      ), offsets[0]);
      if (Math.abs(target - scroller.scrollLeft) <= 1) return;
      scrollTargetRef.current = target;
      scroller.scrollTo({
        left: target,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    };

    const scheduleSettle = () => {
      cancelSettle();
      if (!touching && scrollTargetRef.current === null) {
        settleTimer = window.setTimeout(settle, 160);
      }
    };

    const interruptSettle = () => {
      cancelSettle();
      if (scrollTargetRef.current !== null) {
        scrollTargetRef.current = null;
        // Stop the previous animation before handing scrolling back to the user's gesture.
        scroller.scrollTo({ left: scroller.scrollLeft, behavior: "instant" });
      }
    };

    const startTouch = () => {
      touching = true;
      interruptSettle();
    };
    const endTouch = (event: TouchEvent) => {
      touching = event.touches.length > 0;
      scheduleSettle();
    };
    const updateActivePlan = () => {
      animationFrame = 0;
      const { offsets } = layoutRef.current;
      const nearestPage = offsets.reduce((nearest, offset, page) => (
        Math.abs(offset - scroller.scrollLeft) < Math.abs(offsets[nearest] - scroller.scrollLeft)
          ? page
          : nearest
      ), 0);
      setActivePage(nearestPage);
      const maxScroll = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
      setAtStart(scroller.scrollLeft <= 1);
      setAtEnd(maxScroll - scroller.scrollLeft <= 1);
    };

    const measureCards = () => {
      // The first grid track stays responsive; all following tracks use its pixel width.
      const cardWidth = firstCard.getBoundingClientRect().width;
      if (cardWidth <= 0) return;

      const gap = parseFloat(window.getComputedStyle(scroller).columnGap) || 0;
      const itemsPerPage = Math.max(1, Math.min(
        count,
        Math.round((scroller.clientWidth + gap) / (cardWidth + gap)),
      ));
      const fixedWidth = `${cardWidth}px`;
      if (scroller.style.getPropertyValue("--pricing-card-width") !== fixedWidth) {
        scroller.style.setProperty("--pricing-card-width", fixedWidth);
      }

      const maxScroll = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
      const pageWidth = itemsPerPage * (cardWidth + gap);
      const offsets = Array.from({ length: Math.ceil(count / itemsPerPage) }, (_, page) => (
        Math.min(page * pageWidth, maxScroll)
      ));
      const previousLayout = layoutRef.current;
      const layoutChanged = itemsPerPage !== previousLayout.itemsPerPage
        || offsets.length !== previousLayout.offsets.length
        || offsets.some((offset, page) => offset !== previousLayout.offsets[page]);
      if (layoutChanged) {
        interruptSettle();
        layoutRef.current = { itemsPerPage, offsets };
        setPageCount(offsets.length);
      }
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      updateActivePlan();
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateActivePlan);
      if (scrollTargetRef.current !== null) {
        if (Math.abs(scroller.scrollLeft - scrollTargetRef.current) <= 1) {
          scrollTargetRef.current = null;
        }
        return;
      }
      scheduleSettle();
    };

    measureCards();
    const resizeObserver = new ResizeObserver(measureCards);
    resizeObserver.observe(scroller);
    resizeObserver.observe(firstCard);
    scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
    scroller.addEventListener("touchstart", startTouch, { passive: true });
    scroller.addEventListener("touchend", endTouch, { passive: true });
    scroller.addEventListener("touchcancel", endTouch, { passive: true });
    scroller.addEventListener("wheel", interruptSettle, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", scheduleUpdate);
      scroller.removeEventListener("touchstart", startTouch);
      scroller.removeEventListener("touchend", endTouch);
      scroller.removeEventListener("touchcancel", endTouch);
      scroller.removeEventListener("wheel", interruptSettle);
      cancelSettle();
      cancelSettleRef.current = null;
      scrollTargetRef.current = null;
      resizeObserver.disconnect();
      scroller.style.removeProperty("--pricing-card-width");
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [count]);

  return (
    <div className="pricing-carousel">
      <div className="pricing-grid" ref={scrollRef}>{children}</div>
      <div className="pricing-carousel-controls" aria-label="Plan carousel controls">
        <button
          className="pricing-carousel-arrow"
          type="button"
          aria-label="Previous plans"
          disabled={atStart}
          onClick={() => scrollInDirection(-1)}
        >
          <img src="/pricing/arrow-no-stroke.svg" alt="" />
        </button>
        <div className="pricing-carousel-dots" aria-label={`Plan group ${activePage + 1} of ${pageCount}`}>
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              className={`pricing-carousel-dot${index === activePage ? " is-active" : ""}`}
              type="button"
              aria-label={`Go to plan group ${index + 1}`}
              aria-current={index === activePage ? "true" : undefined}
              onClick={() => scrollToPage(index)}
              key={index}
            />
          ))}
        </div>
        <button
          className="pricing-carousel-arrow pricing-carousel-arrow--next"
          type="button"
          aria-label="Next plans"
          disabled={atEnd}
          onClick={() => scrollInDirection(1)}
        >
          <img src="/pricing/arrow-no-stroke.svg" alt="" />
        </button>
      </div>
    </div>
  );
}
