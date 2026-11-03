/** Move a scroll offset into the middle run without changing its visual phase. */
export function wrapCardScroll(position: number, cycleWidth: number): number {
  if (!Number.isFinite(position) || !Number.isFinite(cycleWidth) || cycleWidth <= 0) return position;
  if (position >= cycleWidth && position < cycleWidth * 2) return position;
  return cycleWidth + ((position - cycleWidth) % cycleWidth + cycleWidth) % cycleWidth;
}

/** Drift left whenever the slider is visible and no visitor interaction is active. */
export function startCardAutoScroll(
  viewport: HTMLElement,
  interactionArea: HTMLElement,
  getLoopWidth: () => number = () => 0,
) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  delete viewport.dataset.autoScrollStopped;
  let hovered = window.matchMedia("(hover: hover)").matches && interactionArea.matches(":hover");
  let keyboardFocused = false;
  let windowActive = true;
  let idle = false;
  let idleTimer: number | undefined;
  const pressedPointers = new Set<number>();
  let onScreen = false;
  let frame = 0;
  let previousTime: number | undefined;
  let position = viewport.scrollLeft;
  let lastWritten = position;

  function canRun() {
    const end = viewport.scrollWidth - viewport.clientWidth;
    return !hovered && !keyboardFocused && !idle && pressedPointers.size === 0
      && windowActive && onScreen && !document.hidden && !reducedMotion.matches && end > 0
      && (getLoopWidth() > 0 || viewport.scrollLeft < end);
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
    const loopWidth = getLoopWidth();
    position = loopWidth > 0 ? wrapCardScroll(position, loopWidth) : Math.min(position, end);
    viewport.scrollLeft = position;
    lastWritten = viewport.scrollLeft;
    if (loopWidth <= 0 && position >= end) {
      sync();
      return;
    }
    frame = window.requestAnimationFrame(tick);
  }

  function isQuickLinksInteraction(event: Event) {
    const target = event.target as Element | null;
    // Direct card interactions still pause, including during the final scene.
    if (target && interactionArea.contains(target)) return false;
    return !!target?.closest?.(".quick-links-section")
      || !!document.querySelector('.quick-links-end-content[data-at-end="true"]');
  }

  function pauseForInteraction(event?: Event) {
    if (event && isQuickLinksInteraction(event)) return;
    idle = true;
    if (idleTimer !== undefined) window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      idleTimer = undefined;
      idle = false;
      sync();
    }, 1200);
    sync();
  }

  function onViewportScroll() {
    // Autoplay's own scroll events must not restart the interaction timeout.
    if (viewport.scrollLeft === lastWritten) return;
    lastWritten = viewport.scrollLeft;
    pauseForInteraction();
  }

  function onPointerDown(event: PointerEvent) {
    if (isQuickLinksInteraction(event)) return;
    pressedPointers.add(event.pointerId);
    keyboardFocused = false;
    pauseForInteraction();
  }

  function onPointerEnd(event: PointerEvent) {
    if (!pressedPointers.delete(event.pointerId)) return;
    pauseForInteraction();
  }

  function onFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement | null;
    keyboardFocused = !!target?.matches(":focus-visible");
    pauseForInteraction();
  }

  function onFocusOut(event: FocusEvent) {
    const target = event.relatedTarget as HTMLElement | null;
    keyboardFocused = !!target && interactionArea.contains(target) && target.matches(":focus-visible");
    sync();
  }

  function onWindowBlur() {
    windowActive = false;
    pressedPointers.clear();
    hovered = false;
    sync();
  }

  function onWindowFocus() {
    windowActive = true;
    hovered = window.matchMedia("(hover: hover)").matches && interactionArea.matches(":hover");
    pauseForInteraction();
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
    if (isQuickLinksInteraction(event)) return;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
      keyboardFocused = !!document.activeElement && interactionArea.contains(document.activeElement);
      pauseForInteraction();
    }
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
  interactionArea.addEventListener("focusin", onFocusIn);
  interactionArea.addEventListener("focusout", onFocusOut);
  viewport.addEventListener("scroll", onViewportScroll, { passive: true });
  window.addEventListener("wheel", pauseForInteraction, { passive: true });
  window.addEventListener("scroll", pauseForInteraction, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerup", onPointerEnd, { passive: true });
  window.addEventListener("pointercancel", onPointerEnd, { passive: true });
  window.addEventListener("click", pauseForInteraction);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("blur", onWindowBlur);
  window.addEventListener("focus", onWindowFocus);
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);

  return () => {
    window.cancelAnimationFrame(frame);
    if (idleTimer !== undefined) window.clearTimeout(idleTimer);
    visibilityObserver.disconnect();
    sizeObserver.disconnect();
    interactionArea.removeEventListener("pointerenter", enter);
    interactionArea.removeEventListener("pointerleave", leave);
    interactionArea.removeEventListener("focusin", onFocusIn);
    interactionArea.removeEventListener("focusout", onFocusOut);
    viewport.removeEventListener("scroll", onViewportScroll);
    window.removeEventListener("wheel", pauseForInteraction);
    window.removeEventListener("scroll", pauseForInteraction);
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointerup", onPointerEnd);
    window.removeEventListener("pointercancel", onPointerEnd);
    window.removeEventListener("click", pauseForInteraction);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("blur", onWindowBlur);
    window.removeEventListener("focus", onWindowFocus);
    document.removeEventListener("visibilitychange", sync);
    reducedMotion.removeEventListener("change", sync);
    delete viewport.dataset.autoScroll;
  };
}
