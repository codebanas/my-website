import test from "node:test";
import assert from "node:assert/strict";
import { getEventListeners } from "node:events";
import { startCardAutoScroll } from "../lib/card-auto-scroll.ts";

function setup(t, options = {}) {
  const windowTarget = new EventTarget();
  const documentTarget = Object.assign(new EventTarget(), { hidden: false });
  const motion = Object.assign(new EventTarget(), { matches: options.reducedMotion ?? false });
  const area = Object.assign(new EventTarget(), { matches: () => options.hovered ?? false });
  const viewport = Object.assign(new EventTarget(), {
    dataset: options.alreadyStopped ? { autoScrollStopped: "true" } : {},
    clientWidth: 1000,
    scrollWidth: options.scrollWidth ?? 5000,
    firstElementChild: {},
  });
  let position = options.start ?? 1000;
  Object.defineProperty(viewport, "scrollLeft", {
    get: () => position,
    set: (value) => { position = options.quantized ? Math.round(value) : value; },
  });
  const frames = new Map();
  let nextFrame = 0;
  let intersection;
  const observers = [];
  Object.assign(windowTarget, {
    matchMedia: (query) => query.includes("reduced-motion") ? motion : { matches: true },
    requestAnimationFrame: (callback) => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
  });
  const globals = {
    window: windowTarget,
    document: documentTarget,
    IntersectionObserver: class {
      constructor(callback) { intersection = callback; observers.push(this); }
      observe() {}
      disconnect() { this.disconnected = true; }
    },
    ResizeObserver: class {
      constructor() { observers.push(this); }
      observe() {}
      disconnect() { this.disconnected = true; }
    },
  };
  const original = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
  }
  const cleanup = startCardAutoScroll(viewport, area);
  const emit = (target, type, properties = {}) => target.dispatchEvent(Object.assign(new Event(type), properties));
  const visible = (value) => intersection([{ isIntersecting: value }]);
  function frame(time) {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(time));
  }
  let disposed = false;
  function dispose() {
    if (disposed) return;
    cleanup();
    for (const [key, descriptor] of original) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    disposed = true;
  }
  t.after(dispose);
  visible(true);
  return { viewport, area, motion, frames, observers, windowTarget, documentTarget, emit, visible, frame, dispose };
}

test("cards drift left even when the browser rounds small scroll increments", (t) => {
  const env = setup(t, { quantized: true });
  for (const time of [0, 16, 32, 48, 64]) env.frame(time);
  assert.ok(env.viewport.scrollLeft > 1000);
  env.emit(env.viewport, "scroll");
  assert.equal(env.viewport.dataset.autoScrollStopped, undefined);
  assert.equal(env.frames.size, 1);
});

test("hover pauses and leaving resumes without a jump or catch-up movement", (t) => {
  const env = setup(t);
  env.frame(0);
  env.frame(16);
  const pausedAt = env.viewport.scrollLeft;
  env.emit(env.area, "pointerenter", { pointerType: "mouse" });
  assert.equal(env.frames.size, 0);
  env.emit(env.area, "pointerleave", { pointerType: "mouse" });
  env.frame(10000);
  assert.equal(env.viewport.scrollLeft, pausedAt);
  env.frame(10016);
  assert.ok(env.viewport.scrollLeft > pausedAt && env.viewport.scrollLeft < pausedAt + 1);
});

for (const action of ["wheel", "scroll", "pointerdown", "click"]) {
  test(`${action} stops autoplay for the visit, including after hover ends`, (t) => {
    const env = setup(t);
    env.frame(0);
    env.frame(16);
    const pausedAt = env.viewport.scrollLeft;
    env.emit(env.windowTarget, action);
    env.emit(env.area, "pointerleave", { pointerType: "mouse" });
    env.frame(1000);
    assert.equal(env.viewport.scrollLeft, pausedAt);
    assert.equal(env.frames.size, 0);
    assert.equal(env.viewport.dataset.autoScrollStopped, "true");
  });
}

test("keyboard navigation stops autoplay without treating modifier keys as scrolling", (t) => {
  const env = setup(t);
  env.emit(env.windowTarget, "keydown", { key: "Shift" });
  assert.equal(env.frames.size, 1);
  env.emit(env.windowTarget, "keydown", { key: "ArrowRight" });
  assert.equal(env.frames.size, 0);
  assert.equal(env.viewport.dataset.autoScrollStopped, "true");
});

test("focusing a card stops autoplay", (t) => {
  const env = setup(t);
  env.emit(env.area, "focusin");
  assert.equal(env.frames.size, 0);
  assert.equal(env.viewport.dataset.autoScrollStopped, "true");
});

test("reduced motion disables autoplay and follows preference changes", (t) => {
  const env = setup(t, { reducedMotion: true });
  assert.equal(env.frames.size, 0);
  env.motion.matches = false;
  env.emit(env.motion, "change");
  assert.equal(env.frames.size, 1);
  env.motion.matches = true;
  env.emit(env.motion, "change");
  assert.equal(env.frames.size, 0);
});

test("offscreen and hidden-tab pauses do not permanently stop the slider", (t) => {
  const env = setup(t);
  env.visible(false);
  assert.equal(env.frames.size, 0);
  env.visible(true);
  assert.equal(env.frames.size, 1);
  env.documentTarget.hidden = true;
  env.emit(env.documentTarget, "visibilitychange");
  assert.equal(env.frames.size, 0);
  env.documentTarget.hidden = false;
  env.emit(env.documentTarget, "visibilitychange");
  assert.equal(env.frames.size, 1);
  assert.equal(env.viewport.dataset.autoScrollStopped, undefined);
});

test("autoplay stops at the last card without wrapping or overshooting", (t) => {
  const env = setup(t, { scrollWidth: 1003, start: 2.9 });
  env.frame(0);
  env.frame(16);
  assert.equal(env.viewport.scrollLeft, 3);
  assert.equal(env.frames.size, 0);
});

test("external centering is preserved instead of being overwritten next frame", (t) => {
  const env = setup(t);
  env.frame(0);
  env.viewport.scrollLeft = 2500;
  env.frame(16);
  assert.ok(env.viewport.scrollLeft >= 2500 && env.viewport.scrollLeft < 2501);
});

test("a prior visitor interaction remains stopped after data updates", (t) => {
  const env = setup(t, { alreadyStopped: true });
  assert.equal(env.frames.size, 0);
});

test("cleanup removes animation, listeners, and observers", (t) => {
  const env = setup(t);
  env.dispose();
  assert.equal(env.frames.size, 0);
  assert.equal(env.viewport.dataset.autoScroll, undefined);
  for (const name of ["wheel", "scroll", "pointerdown", "click", "keydown"]) {
    assert.equal(getEventListeners(env.windowTarget, name).length, 0);
  }
  assert.equal(getEventListeners(env.area, "pointerenter").length, 0);
  assert.equal(getEventListeners(env.motion, "change").length, 0);
  assert.ok(env.observers.every((observer) => observer.disconnected));
});
