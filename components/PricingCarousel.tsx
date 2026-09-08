"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

const SWIPE_THRESHOLD = 48;

type Swipe = {
  pointerId: number;
  startX: number;
  startY: number;
  startPage: number;
  horizontal: boolean;
  advanced: boolean;
};

type PricingCarouselProps = {
  children: ReactNode;
  count: number;
};

export function PricingCarousel({ children, count }: PricingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<Swipe | null>(null);
  const suppressClickRef = useRef(false);
  const [activePage, setActivePage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const pageCount = Math.ceil(count / itemsPerPage);

  const scrollToPage = (page: number) => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const nextPage = Math.min(Math.max(page, 0), pageCount - 1);
    const lastPageStart = Math.max(count - itemsPerPage, 0);
    const targetIndex = Math.min(nextPage * itemsPerPage, lastPageStart);
    const target = scroller.children.item(targetIndex) as HTMLElement | null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetLeft = target
      ? target.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft
      : nextPage * scroller.clientWidth;

    scroller.scrollTo({
      left: targetLeft,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const startSwipe = (event: PointerEvent<HTMLDivElement>) => {
    suppressClickRef.current = false;
    if (!event.isPrimary) {
      swipeRef.current = null;
      return;
    }
    if (event.pointerType === "mouse" || event.button !== 0) return;

    const scroller = event.currentTarget;
    if (scroller.scrollWidth <= scroller.clientWidth) return;

    swipeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPage: activePage,
      horizontal: false,
      advanced: false,
    };
  };

  const moveSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current;
    if (!swipe || swipe.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - swipe.startX;
    const deltaY = event.clientY - swipe.startY;

    if (!swipe.horizontal) {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) return;
      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        swipeRef.current = null;
        return;
      }

      swipe.horizontal = true;
      suppressClickRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    // Advance once per gesture; native vertical scrolling and pinch zoom remain available.
    if (!swipe.advanced && Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      swipe.advanced = true;
      scrollToPage(swipe.startPage + (deltaX < 0 ? 1 : -1));
    }
  };

  const endSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (swipeRef.current?.pointerId !== event.pointerId) return;
    swipeRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    const twoUpQuery = window.matchMedia("(min-width: 1101px) and (max-width: 1200px)");
    const updateItemsPerPage = () => {
      setItemsPerPage(twoUpQuery.matches ? 2 : 1);
      setActivePage(0);
      scrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
    };

    updateItemsPerPage();
    twoUpQuery.addEventListener("change", updateItemsPerPage);
    return () => twoUpQuery.removeEventListener("change", updateItemsPerPage);
  }, []);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    let animationFrame = 0;
    const updateActivePlan = () => {
      animationFrame = 0;
      const maxScroll = Math.max(scroller.scrollWidth - scroller.clientWidth, 1);
      const nextPage = Math.round((scroller.scrollLeft / maxScroll) * (pageCount - 1));
      setActivePage(Math.min(Math.max(nextPage, 0), pageCount - 1));
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateActivePlan);
    };

    scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      scroller.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [pageCount]);

  return (
    <div className="pricing-carousel">
      <div
        className="pricing-grid"
        ref={scrollRef}
        onPointerDown={startSwipe}
        onPointerMove={moveSwipe}
        onPointerUp={endSwipe}
        onPointerCancel={endSwipe}
        onLostPointerCapture={(event) => {
          if (event.target === event.currentTarget) endSwipe(event);
        }}
        onClickCapture={(event) => {
          if (suppressClickRef.current && event.detail !== 0) {
            event.preventDefault();
            event.stopPropagation();
          }
          suppressClickRef.current = false;
        }}
      >
        {children}
      </div>
      <div className="pricing-carousel-controls" aria-label="Plan carousel controls">
        <button
          className="pricing-carousel-arrow"
          type="button"
          aria-label="Previous plans"
          disabled={activePage === 0}
          onClick={() => scrollToPage(activePage - 1)}
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
          disabled={activePage === pageCount - 1}
          onClick={() => scrollToPage(activePage + 1)}
        >
          <img src="/pricing/arrow-no-stroke.svg" alt="" />
        </button>
      </div>
    </div>
  );
}
