"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type PricingCarouselProps = {
  children: ReactNode;
  count: number;
};

export function PricingCarousel({ children, count }: PricingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToPlan = (index: number) => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const nextIndex = Math.min(Math.max(index, 0), count - 1);
    const target = scroller.children.item(nextIndex) as HTMLElement | null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scroller.scrollTo({
      left: target?.offsetLeft ?? nextIndex * scroller.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    let animationFrame = 0;
    const updateActivePlan = () => {
      animationFrame = 0;
      const plans = Array.from(scroller.children) as HTMLElement[];
      const closestIndex = plans.reduce((closest, plan, index) => {
        const currentDistance = Math.abs(plan.offsetLeft - scroller.scrollLeft);
        const closestDistance = Math.abs(plans[closest].offsetLeft - scroller.scrollLeft);
        return currentDistance < closestDistance ? index : closest;
      }, 0);
      setActiveIndex(closestIndex);
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
  }, []);

  return (
    <div className="pricing-carousel">
      <div className="pricing-grid" ref={scrollRef}>{children}</div>
      <div className="pricing-carousel-controls" aria-label="Plan carousel controls">
        <button
          className="pricing-carousel-arrow"
          type="button"
          aria-label="Previous plan"
          disabled={activeIndex === 0}
          onClick={() => scrollToPlan(activeIndex - 1)}
        >
          <img src="/pricing/arrow-no-stroke.svg" alt="" />
        </button>
        <div className="pricing-carousel-dots" aria-label={`Plan ${activeIndex + 1} of ${count}`}>
          {Array.from({ length: count }, (_, index) => (
            <button
              className={`pricing-carousel-dot${index === activeIndex ? " is-active" : ""}`}
              type="button"
              aria-label={`Go to plan ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => scrollToPlan(index)}
              key={index}
            />
          ))}
        </div>
        <button
          className="pricing-carousel-arrow pricing-carousel-arrow--next"
          type="button"
          aria-label="Next plan"
          disabled={activeIndex === count - 1}
          onClick={() => scrollToPlan(activeIndex + 1)}
        >
          <img src="/pricing/arrow-no-stroke.svg" alt="" />
        </button>
      </div>
    </div>
  );
}
