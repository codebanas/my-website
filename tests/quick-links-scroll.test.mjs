import test from "node:test";
import assert from "node:assert/strict";
import { getEventListeners } from "node:events";
import { startQuickLinksScroll } from "../lib/quick-links-scroll.ts";

function setup(t) {
  let now = 0;
  const state = { atEnd: false, active: 0 };
  const windowTarget = Object.assign(new EventTarget(), { innerHeight: 800, performance: { now: () => now } });
  const navigation = {
    clientHeight: 156,
    getBoundingClientRect: () => ({ top: 500, bottom: 656 }),
    contains: (target) => target === navigation,
  };
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { value: windowTarget, configurable: true });
  const cleanup = startQuickLinksScroll(navigation, {
    isAtEnd: () => state.atEnd,
    getActiveIndex: () => state.active,
    selectLink: (index) => { state.active = index; },
    linkCount: 9,
  });
  t.after(() => {
    cleanup();
    if (original) Object.defineProperty(globalThis, "window", original);
    else delete globalThis.window;
  });
  function emit(type, values = {}, target) {
    const event = Object.assign(new Event(type, { cancelable: true }), values);
    if (target) Object.defineProperty(event, "target", { value: target });
    windowTarget.dispatchEvent(event);
    return event;
  }
  const wheel = (deltaY = 40, target) => emit("wheel", { deltaY, deltaX: 0, deltaMode: 0 }, target);
  const touch = (type, x, y) => emit(type, { touches: [{ clientX: x, clientY: y }] });
  return { state, navigation, windowTarget, cleanup, emit, wheel, touch, advance: (ms) => { now += ms; } };
}

test("ordinary page scrolling reaches the scene before controlling the link window", (t) => {
  const env = setup(t);
  assert.equal(env.wheel().defaultPrevented, false);
  assert.equal(env.state.active, 0);
  env.state.atEnd = true;
  assert.equal(env.wheel().defaultPrevented, true);
  assert.equal(env.state.active, 1);
});

test("continuous wheel input anywhere keeps advancing at a controlled pace", (t) => {
  const env = setup(t);
  env.state.atEnd = true;
  env.wheel();
  env.advance(90);
  env.wheel();
  assert.equal(env.state.active, 1);
  env.advance(90);
  env.wheel();
  assert.equal(env.state.active, 2);
  env.advance(180);
  env.wheel();
  assert.equal(env.state.active, 3);
  env.wheel(-40);
  assert.equal(env.state.active, 2);
});

test("scrolling directly over visible links also works before the page endpoint", (t) => {
  const env = setup(t);
  assert.equal(env.wheel(40, env.navigation).defaultPrevented, true);
  assert.equal(env.state.active, 1);
});

test("a mobile or tablet swipe can start on the page and continue through links", (t) => {
  const env = setup(t);
  env.touch("touchstart", 200, 600);
  assert.equal(env.touch("touchmove", 200, 500).defaultPrevented, false);
  env.state.atEnd = true;
  assert.equal(env.touch("touchmove", 200, 450).defaultPrevented, true);
  assert.equal(env.state.active, 1);
  env.advance(180);
  env.touch("touchmove", 200, 400);
  assert.equal(env.state.active, 2);
  env.emit("touchend");
  env.touch("touchmove", 200, 300);
  assert.equal(env.state.active, 2);
});

test("scrolling up from Home exits the scene and scrolling down at Contact stays bounded", (t) => {
  const env = setup(t);
  env.state.atEnd = true;
  assert.equal(env.wheel(-40).defaultPrevented, false);
  env.state.active = 8;
  assert.equal(env.wheel().defaultPrevented, true);
  assert.equal(env.state.active, 8);
});

test("horizontal gestures, zoom, and multi-touch retain their normal behavior", (t) => {
  const env = setup(t);
  env.state.atEnd = true;
  assert.equal(env.emit("wheel", { deltaY: 20, deltaX: 40 }).defaultPrevented, false);
  assert.equal(env.emit("wheel", { deltaY: 40, deltaX: 0, ctrlKey: true }).defaultPrevented, false);
  env.touch("touchstart", 200, 600);
  assert.equal(env.touch("touchmove", 100, 580).defaultPrevented, false);
  env.emit("touchstart", { touches: [{}, {}] });
  assert.equal(env.touch("touchmove", 200, 400).defaultPrevented, false);
  assert.equal(env.state.active, 0);
});

test("normal page keys control links at the endpoint without overriding editable fields", (t) => {
  const env = setup(t);
  assert.equal(env.emit("keydown", { key: "PageDown" }).defaultPrevented, false);
  env.state.atEnd = true;
  assert.equal(env.emit("keydown", { key: "PageDown" }).defaultPrevented, true);
  assert.equal(env.state.active, 1);
  env.emit("keydown", { key: "ArrowDown" }, { closest: () => ({}) });
  assert.equal(env.state.active, 1);
  env.emit("keydown", { key: " ", shiftKey: true });
  assert.equal(env.state.active, 0);
  assert.equal(env.emit("keydown", { key: "PageUp" }).defaultPrevented, false);
});

test("cleanup removes every global gesture handler", (t) => {
  const env = setup(t);
  env.cleanup();
  for (const type of ["wheel", "touchstart", "touchmove", "touchend", "touchcancel", "keydown"]) {
    assert.equal(getEventListeners(env.windowTarget, type).length, 0);
  }
});
