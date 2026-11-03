import test from "node:test";
import assert from "node:assert/strict";
import { getEventListeners } from "node:events";
import { startCardAutoScroll, wrapCardScroll } from "../lib/card-auto-scroll.ts";

function setup(t, options = {}) {
  const windowTarget = new EventTarget();
  const documentTarget = Object.assign(new EventTarget(), { hidden: false });
  const motion = Object.assign(new EventTarget(), { matches: options.reducedMotion ?? false });
  const area = Object.assign(new EventTarget(), { hovered: options.hovered ?? false, focusVisible: false });
  area.matches = (selector) => selector === ":hover" ? area.hovered : area.focusVisible;
  area.contains = (target) => target === area;
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
  const timers = new Map();
  let now = 0;
  let nextTimer = 0;
  let nextFrame = 0;
  let intersection;
  const observers = [];
  Object.assign(windowTarget, {
    matchMedia: (query) => query.includes("reduced-motion") ? motion : { matches: options.hoverCapable ?? true },
    requestAnimationFrame: (callback) => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout: (callback, delay) => { timers.set(++nextTimer, { callback, at: now + delay }); return nextTimer; },
    clearTimeout: (id) => timers.delete(id),
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
  const cleanup = startCardAutoScroll(viewport, area, () => options.loopWidth ?? 0);
  const emit = (target, type, properties = {}) => {
    if (target === area && type === "pointerenter") area.hovered = true;
    if (target === area && type === "pointerleave") area.hovered = false;
    return target.dispatchEvent(Object.assign(new Event(type), properties));
  };
  const visible = (value) => intersection([{ isIntersecting: value }]);
  function advance(milliseconds) {
    now += milliseconds;
    const due = [...timers].filter(([, timer]) => timer.at <= now);
    for (const [id, timer] of due) {
      timers.delete(id);
      timer.callback();
    }
  }
  function frame(time) {
    if (time !== undefined && time > now) advance(time - now);
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(now));
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
  return { viewport, area, motion, frames, timers, observers, windowTarget, documentTarget, emit, visible, frame, advance, dispose };
}

test("cards drift left even when the browser rounds small scroll increments", (t) => {
  const env = setup(t, { quantized: true });
  for (const time of [0, 16, 32, 48, 64]) env.frame(time);
  assert.ok(env.viewport.scrollLeft > 1000);
  env.emit(env.viewport, "scroll");
  assert.equal(env.viewport.dataset.autoScrollStopped, undefined);
  assert.equal(env.frames.size, 1);
  assert.equal(env.timers.size, 0);
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

for (const action of ["wheel", "scroll", "click"]) {
  test(`${action} pauses autoplay and resumes after interaction settles`, (t) => {
    const env = setup(t);
    env.frame(0);
    env.frame(16);
    if (action === "scroll") env.viewport.scrollLeft += 10;
    const pausedAt = env.viewport.scrollLeft;
    env.emit(action === "scroll" ? env.viewport : env.area, action);
    env.emit(env.area, "pointerleave", { pointerType: "mouse" });
    env.advance(1199);
    assert.equal(env.viewport.scrollLeft, pausedAt);
    assert.equal(env.frames.size, 0);
    env.advance(1);
    assert.equal(env.frames.size, 1);
    env.frame();
    assert.equal(env.viewport.scrollLeft, pausedAt);
    env.frame(1232);
    assert.ok(env.viewport.scrollLeft > pausedAt);
  });
}

test("a held pointer or drag keeps autoplay paused until release and idle", (t) => {
  const env = setup(t);
  env.emit(env.area, "pointerdown", { pointerId: 1 });
  env.advance(5000);
  assert.equal(env.frames.size, 0);
  env.emit(env.windowTarget, "pointerup", { pointerId: 1 });
  env.advance(1199);
  assert.equal(env.frames.size, 0);
  env.advance(1);
  assert.equal(env.frames.size, 1);
});

test("hover and clicking must both finish before autoplay resumes", (t) => {
  const env = setup(t);
  env.emit(env.area, "pointerenter", { pointerType: "mouse" });
  env.emit(env.area, "click");
  env.advance(1200);
  assert.equal(env.frames.size, 0);
  env.emit(env.area, "pointerleave", { pointerType: "mouse" });
  assert.equal(env.frames.size, 1);
});

test("horizontal touch momentum extends the pause after pointer cancellation", (t) => {
  const env = setup(t);
  env.emit(env.area, "pointerdown", { pointerId: 2, pointerType: "touch" });
  env.emit(env.windowTarget, "pointercancel", { pointerId: 2 });
  env.advance(1000);
  env.viewport.scrollLeft += 100;
  env.emit(env.viewport, "scroll");
  env.advance(1000);
  assert.equal(env.frames.size, 0);
  env.viewport.scrollLeft += 50;
  env.emit(env.viewport, "scroll");
  env.advance(1199);
  assert.equal(env.frames.size, 0);
  env.advance(1);
  assert.equal(env.frames.size, 1);
});

test("touch devices resume after release without a sticky hover pause", (t) => {
  const env = setup(t, { hoverCapable: false });
  env.emit(env.area, "pointerenter", { pointerType: "touch" });
  assert.equal(env.frames.size, 1);
  env.emit(env.area, "pointerdown", { pointerType: "touch", pointerId: 3 });
  assert.equal(env.frames.size, 0);
  env.emit(env.windowTarget, "pointerup", { pointerType: "touch", pointerId: 3 });
  env.advance(1200);
  assert.equal(env.frames.size, 1);
  env.frame(0);
  env.frame(1216);
  assert.ok(env.viewport.scrollLeft > 1000);
});

test("keyboard navigation pauses temporarily without treating modifier keys as scrolling", (t) => {
  const env = setup(t);
  env.emit(env.area, "keydown", { key: "Shift" });
  assert.equal(env.frames.size, 1);
  env.emit(env.area, "keydown", { key: "ArrowRight" });
  assert.equal(env.frames.size, 0);
  env.advance(1200);
  assert.equal(env.frames.size, 1);
});

test("interactions anywhere outside the gallery keep autoplay running", (t) => {
  const env = setup(t);
  env.frame(0);
  for (const [type, details] of [
    ["wheel", {}],
    ["scroll", {}],
    ["pointerdown", { pointerId: 7, pointerType: "touch" }],
    ["pointerup", { pointerId: 7, pointerType: "touch" }],
    ["click", {}],
    ["keydown", { key: "ArrowDown" }],
  ]) {
    env.emit(env.windowTarget, type, details);
    assert.equal(env.frames.size, 1);
    assert.equal(env.timers.size, 0);
  }
  env.frame(16);
  assert.ok(env.viewport.scrollLeft > 1000);
});

test("outside input cannot extend a gallery pause or hold a pointer after release", (t) => {
  const env = setup(t);
  env.emit(env.area, "pointerdown", { pointerId: 8 });
  assert.equal(env.frames.size, 0);
  env.advance(1500);
  assert.equal(env.frames.size, 0);
  env.emit(env.windowTarget, "pointerup", { pointerId: 8 });
  env.advance(1000);
  for (const type of ["wheel", "scroll", "click", "pointerdown", "keydown"]) {
    env.emit(env.windowTarget, type, { pointerId: 9, key: "ArrowDown" });
  }
  env.advance(200);
  assert.equal(env.frames.size, 1);
  env.emit(env.windowTarget, "scroll");
  assert.equal(env.frames.size, 1);
});

test("pointer focus does not keep autoplay stopped after the interaction ends", (t) => {
  const env = setup(t);
  env.emit(env.area, "focusin");
  assert.equal(env.frames.size, 0);
  env.advance(1200);
  assert.equal(env.frames.size, 1);
});

test("keyboard focus holds the pause until focus leaves the gallery", (t) => {
  const env = setup(t);
  env.area.focusVisible = true;
  env.emit(env.area, "focusin");
  env.advance(1200);
  assert.equal(env.frames.size, 0);
  env.emit(env.area, "focusout", { relatedTarget: null });
  assert.equal(env.frames.size, 1);
});

test("window blur clears a lost pointer so returning does not leave autoplay stuck", (t) => {
  const env = setup(t);
  env.emit(env.area, "pointerdown", { pointerId: 1 });
  env.emit(env.windowTarget, "blur");
  env.advance(5000);
  assert.equal(env.frames.size, 0);
  env.emit(env.windowTarget, "focus");
  env.advance(1200);
  assert.equal(env.frames.size, 1);
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

test("looped autoplay carries on across the end without resetting its visual phase", (t) => {
  const cycle = 6048;
  const env = setup(t, { scrollWidth: cycle * 3, start: cycle * 2 - 0.1, loopWidth: cycle });
  env.frame(0);
  env.frame(16);
  assert.ok(Math.abs(env.viewport.scrollLeft - (cycle + 0.284)) < 1e-8);
  assert.equal(env.frames.size, 1);
  assert.equal(env.viewport.dataset.autoScrollStopped, undefined);
  env.frame(32);
  assert.ok(env.viewport.scrollLeft > cycle + 0.284);
});

test("manual sliding wraps in both directions and preserves fractional positions", () => {
  const cycle = 6048;
  assert.equal(wrapCardScroll(cycle - 12.5, cycle), cycle * 2 - 12.5);
  assert.equal(wrapCardScroll(cycle * 2 + 12.5, cycle), cycle + 12.5);
  assert.equal(wrapCardScroll(cycle + 300.25, cycle), cycle + 300.25);
  assert.equal(wrapCardScroll(0, cycle), cycle);
});

test("recycling across many runs keeps the same cards, gaps, and color order", () => {
  const stride = 288;
  const cycle = stride * 21;
  for (const scroll of [-cycle * 10 - 20.25, -1, 0, cycle - 0.5, cycle * 2, cycle * 15 + 12.5]) {
    const wrapped = wrapCardScroll(scroll, cycle);
    assert.ok(wrapped >= cycle && wrapped < cycle * 2);
    assert.ok(Math.abs((wrapped - scroll) / cycle - Math.round((wrapped - scroll) / cycle)) < 1e-8);
    const oldIndex = Math.floor(scroll / stride);
    const newIndex = Math.floor(wrapped / stride);
    assert.equal(((oldIndex % 7) + 7) % 7, newIndex % 7);
  }
});

test("an unmeasured loop leaves the scroll offset alone", () => {
  assert.equal(wrapCardScroll(250, 0), 250);
  assert.equal(wrapCardScroll(250, Number.NaN), 250);
});

test("external centering is preserved instead of being overwritten next frame", (t) => {
  const env = setup(t);
  env.frame(0);
  env.viewport.scrollLeft = 2500;
  env.frame(16);
  assert.ok(env.viewport.scrollLeft >= 2500 && env.viewport.scrollLeft < 2501);
});

test("the old permanent-stop flag no longer prevents autoplay from resuming", (t) => {
  const env = setup(t, { alreadyStopped: true });
  assert.equal(env.frames.size, 1);
  assert.equal(env.viewport.dataset.autoScrollStopped, undefined);
});

test("cleanup removes animation, listeners, and observers", (t) => {
  const env = setup(t);
  env.emit(env.area, "wheel");
  assert.equal(env.timers.size, 1);
  env.dispose();
  assert.equal(env.frames.size, 0);
  assert.equal(env.timers.size, 0);
  assert.equal(env.viewport.dataset.autoScroll, undefined);
  for (const name of ["wheel", "scroll", "pointerdown", "pointerup", "pointercancel", "click", "keydown", "blur", "focus"]) {
    assert.equal(getEventListeners(env.windowTarget, name).length, 0);
  }
  for (const name of ["pointerenter", "pointerleave", "focusin", "focusout", "wheel", "pointerdown", "click", "keydown"]) {
    assert.equal(getEventListeners(env.area, name).length, 0);
  }
  assert.equal(getEventListeners(env.viewport, "scroll").length, 0);
  assert.equal(getEventListeners(env.motion, "change").length, 0);
  assert.ok(env.observers.every((observer) => observer.disconnected));
});
