/** Route normal page gestures into the final link window without moving the page. */
export function startQuickLinksScroll(navigation: HTMLElement, {
  isAtEnd, getActiveIndex, selectLink, linkCount,
}: {
  isAtEnd: () => boolean;
  getActiveIndex: () => number;
  selectLink: (index: number) => void;
  linkCount: number;
}) {
  let wheelDistance = 0;
  let wheelDirection = 0;
  let lastWheelTime = -Infinity;
  let lastWheelStep = -Infinity;
  let touch: { x: number; y: number; direction: number; lastStep: number } | undefined;

  function canHandle(event: Event) {
    // Read the current page position for every event, including mid-swipe arrival.
    if (isAtEnd()) return true;
    const bounds = navigation.getBoundingClientRect();
    return bounds.bottom > 0 && bounds.top < window.innerHeight
      && navigation.contains(event.target as Node | null);
  }

  function canMove(step: number) {
    const next = getActiveIndex() + step;
    return next >= 0 && next < linkCount;
  }

  function onWheel(event: WheelEvent) {
    if (event.defaultPrevented || event.ctrlKey || !event.deltaY
      || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !canHandle(event)) return;
    const step = Math.sign(event.deltaY);
    if (!canMove(step)) {
      if (step > 0) event.preventDefault();
      return;
    }
    event.preventDefault();
    const now = window.performance.now();
    if (step !== wheelDirection || now - lastWheelTime > 180) {
      wheelDistance = 0;
      lastWheelStep = -Infinity;
    }
    wheelDirection = step;
    lastWheelTime = now;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? navigation.clientHeight : 1;
    wheelDistance += Math.abs(event.deltaY) * unit;
    if (wheelDistance >= 32 && now - lastWheelStep >= 180) {
      selectLink(getActiveIndex() + step);
      wheelDistance = 0;
      lastWheelStep = now;
    }
  }

  function onTouchStart(event: TouchEvent) {
    touch = event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY, direction: 0, lastStep: -Infinity }
      : undefined;
  }

  function onTouchMove(event: TouchEvent) {
    if (event.defaultPrevented || !touch || event.touches.length !== 1) return;
    const point = event.touches[0];
    if (!canHandle(event)) {
      // Keep tracking ordinary page scrolling so the same swipe can enter the menu.
      touch.x = point.clientX;
      touch.y = point.clientY;
      return;
    }
    const delta = touch.y - point.clientY;
    if (Math.abs(delta) < 8 || Math.abs(touch.x - point.clientX) > Math.abs(delta)) return;
    const step = Math.sign(delta);
    if (!canMove(step)) {
      if (step > 0) event.preventDefault();
      return;
    }
    event.preventDefault();
    const now = window.performance.now();
    if (step !== touch.direction) touch.lastStep = -Infinity;
    touch.direction = step;
    if (Math.abs(delta) >= 28 && now - touch.lastStep >= 180) {
      selectLink(getActiveIndex() + step);
      touch.x = point.clientX;
      touch.y = point.clientY;
      touch.lastStep = now;
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || !isAtEnd()) return;
    const target = event.target as Element | null;
    if (target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    if (event.key === " " && target?.closest?.("button, a")) return;
    const step = event.key === " " ? (event.shiftKey ? -1 : 1)
      : ["ArrowDown", "PageDown"].includes(event.key) ? 1
      : ["ArrowUp", "PageUp"].includes(event.key) ? -1 : 0;
    if (!step || !canMove(step)) {
      if (step > 0) event.preventDefault();
      return;
    }
    event.preventDefault();
    const next = getActiveIndex() + step;
    selectLink(next);
    if (navigation.contains(event.target as Node | null)) {
      navigation.querySelectorAll("button")[next]?.focus({ preventScroll: true });
    }
  }

  const endTouch = () => { touch = undefined; };
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", endTouch);
  window.addEventListener("touchcancel", endTouch);
  window.addEventListener("keydown", onKeyDown);
  return () => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", endTouch);
    window.removeEventListener("touchcancel", endTouch);
    window.removeEventListener("keydown", onKeyDown);
  };
}
