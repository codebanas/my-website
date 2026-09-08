"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type PricingCarouselProps = {
  children: ReactNode;
  count: number;
};

export function PricingCarousel({ children, count }: PricingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef({ itemsPerPage: 1, offsets: [0] });
  const activePageRef = useRef(0);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(count);

  const scrollToPage = (page: number) => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const { offsets } = layoutRef.current;
    const nextPage = Math.min(Math.max(page, 0), offsets.length - 1);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scroller.scrollTo({
      left: offsets[nextPage],
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  useEffect(() => {
    const scroller = scrollRef.current;
    const firstCard = scroller?.firstElementChild;
    if (!scroller || !(firstCard instanceof HTMLElement)) return;

    let animationFrame = 0;
    const updateActivePlan = () => {
      animationFrame = 0;
      const { offsets } = layoutRef.current;
      const nearestPage = offsets.reduce((nearest, offset, page) => (
        Math.abs(offset - scroller.scrollLeft) < Math.abs(offsets[nearest] - scroller.scrollLeft)
          ? page
          : nearest
      ), 0);
      activePageRef.current = nearestPage;
      setActivePage(nearestPage);
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
      if (!layoutChanged) return;

      const firstVisibleCard = Math.min(
        activePageRef.current * previousLayout.itemsPerPage,
        Math.max(count - previousLayout.itemsPerPage, 0),
      );
      const nextPage = Math.min(
        itemsPerPage === previousLayout.itemsPerPage
          ? activePageRef.current
          : Math.floor(firstVisibleCard / itemsPerPage),
        offsets.length - 1,
      );

      layoutRef.current = { itemsPerPage, offsets };
      setPageCount(offsets.length);
      // Only real layout changes reposition the slider; swiping remains native.
      scroller.scrollTo({ left: offsets[nextPage], behavior: "auto" });
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      updateActivePlan();
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateActivePlan);
    };

    measureCards();
    const resizeObserver = new ResizeObserver(measureCards);
    resizeObserver.observe(scroller);
    resizeObserver.observe(firstCard);
    scroller.addEventListener("scroll", scheduleUpdate, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", scheduleUpdate);
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
