/** Drift cards left until the visitor interacts; hover alone pauses temporarily. */
export function startCardAutoScroll(viewport: HTMLElement, interactionArea: HTMLElement) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let stopped = viewport.dataset.autoScrollStopped === "true";
  let hovered = window.matchMedia("(hover: hover)").matches && interactionArea.matches(":hover");
  let onScreen = false;
  let frame = 0;
  let previousTime: number | undefined;
  let position = viewport.scrollLeft;
  let lastWritten = position;

  function canRun() {
    return !stopped && !hovered && onScreen && !document.hidden && !reducedMotion.matches
      && viewport.scrollWidth > viewport.clientWidth;
  }

  function sync() {
    if (!canRun()) {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = undefined;
      return;
    }
    if (!frame) {
      // Keep snap disabled while paused too, so stopping does not move the cards.
      viewport.dataset.autoScroll = "true";
      position = viewport.scrollLeft;
      lastWritten = position;
      previousTime = undefined;
      frame = window.requestAnimationFrame(tick);
    }
  }

  function tick(time: number) {
    frame = 0;
    if (!canRun()) {
      sync();
      return;
    }
    // Accommodate the existing centering behavior on resize and favorite grouping.
    if (viewport.scrollLeft !== lastWritten) position = viewport.scrollLeft;
    if (previousTime !== undefined) {
      position += Math.min(time - previousTime, 64) * 0.024;
    }
    previousTime = time;
    const end = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    position = Math.min(position, end);
    viewport.scrollLeft = position;
    lastWritten = viewport.scrollLeft;
    if (position >= end) {
      stopped = true;
      sync();
      return;
    }
    frame = window.requestAnimationFrame(tick);
  }

  function stop() {
    stopped = true;
    viewport.dataset.autoScrollStopped = "true";
    sync();
  }

  function enter(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    hovered = true;
    sync();
  }

  function leave(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    hovered = false;
    sync();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) stop();
  }

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  visibilityObserver.observe(viewport);
  const sizeObserver = new ResizeObserver(sync);
  sizeObserver.observe(viewport);
  if (viewport.firstElementChild) sizeObserver.observe(viewport.firstElementChild);
  interactionArea.addEventListener("pointerenter", enter);
  interactionArea.addEventListener("pointerleave", leave);
  interactionArea.addEventListener("focusin", stop);
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("scroll", stop, { passive: true });
  window.addEventListener("pointerdown", stop, { passive: true });
  window.addEventListener("click", stop);
  window.addEventListener("keydown", onKeyDown);
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);

  return () => {
    window.cancelAnimationFrame(frame);
    visibilityObserver.disconnect();
    sizeObserver.disconnect();
    interactionArea.removeEventListener("pointerenter", enter);
    interactionArea.removeEventListener("pointerleave", leave);
    interactionArea.removeEventListener("focusin", stop);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("scroll", stop);
    window.removeEventListener("pointerdown", stop);
    window.removeEventListener("click", stop);
    window.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("visibilitychange", sync);
    reducedMotion.removeEventListener("change", sync);
    delete viewport.dataset.autoScroll;
  };
}
