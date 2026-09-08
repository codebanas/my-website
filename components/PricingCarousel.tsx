"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type PricingCarouselProps = {
  children: ReactNode;
  count: number;
};

export function PricingCarousel({ children, count }: PricingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const pageCount = Math.ceil(count / itemsPerPage);

  const scrollToPage = (page: number) => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const nextPage = Math.min(Math.max(page, 0), pageCount - 1);
    const lastPageStart = Math.max(count - itemsPerPage, 0);
    const targetIndex = Math.min(nextPage * itemsPerPage, lastPageStart);
    const target = scroller.children.item(targetIndex) as HTMLElement | null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetLeft = nextPage === pageCount - 1
      ? scroller.scrollWidth - scroller.clientWidth
      : target
        ? target.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft
        : nextPage * scroller.clientWidth;

    scroller.scrollTo({
      left: targetLeft,
      behavior: reduceMotion ? "auto" : "smooth",
    });
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

    const getNearestPage = () => {
      const maxScroll = Math.max(scroller.scrollWidth - scroller.clientWidth, 1);
      return Math.min(
        Math.max(Math.round((scroller.scrollLeft / maxScroll) * (pageCount - 1)), 0),
        pageCount - 1,
      );
    };

    const updateActivePlan = () => {
      animationFrame = 0;
      const maxScroll = Math.max(scroller.scrollWidth - scroller.clientWidth, 1);
      setActivePage(getNearestPage());
      setAtStart(scroller.scrollLeft <= 1);
      setAtEnd(maxScroll - scroller.scrollLeft <= 1);
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateActivePlan);
    };

    updateActivePlan();
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
      <div className="pricing-grid" ref={scrollRef}>{children}</div>
      <div className="pricing-carousel-controls" aria-label="Plan carousel controls">
        <button
          className="pricing-carousel-arrow"
          type="button"
          aria-label="Previous plans"
          disabled={atStart}
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
          disabled={atEnd}
          onClick={() => scrollToPage(activePage + 1)}
        >
          <img src="/pricing/arrow-no-stroke.svg" alt="" />
        </button>
      </div>
    </div>
  );
}
