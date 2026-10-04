import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../app/lib/environment-motion.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { fieldResponse, attachEnvironmentMotion, advanceTempo, createSceneTempo, SCENE_TEMPO } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("tempo has continuous, frame-independent acceleration and a heavier coast-down", () => {
  let rate = SCENE_TEMPO.idle;
  let travelled = 0;
  for (let i = 0; i < 60; i++) {
    const step = advanceTempo(rate, SCENE_TEMPO.engaged, 16);
    assert.ok(step.rate >= rate && step.rate < SCENE_TEMPO.engaged);
    assert.ok(step.elapsed >= rate * 16 && step.elapsed <= step.rate * 16);
    rate = step.rate; travelled += step.elapsed;
  }
  let coarseRate = SCENE_TEMPO.idle;
  let coarseTravelled = 0;
  for (let i = 0; i < 30; i++) {
    const step = advanceTempo(coarseRate, SCENE_TEMPO.engaged, 32);
    coarseRate = step.rate; coarseTravelled += step.elapsed;
  }
  assert.ok(Math.abs(rate - coarseRate) < 1e-10);
  assert.ok(Math.abs(travelled - coarseTravelled) < 1e-8);
  const braking = advanceTempo(SCENE_TEMPO.engaged, SCENE_TEMPO.idle, 16);
  const accelerating = advanceTempo(SCENE_TEMPO.idle, SCENE_TEMPO.engaged, 16);
  assert.ok(SCENE_TEMPO.engaged - braking.rate < accelerating.rate - SCENE_TEMPO.idle);
  assert.deepEqual(advanceTempo(1, 1.3, 0), { rate: 1, elapsed: 0 });
  assert.ok(advanceTempo(1, 1.3, 60000).elapsed < 84, "background time cannot jump the scene");
});

test("scene tempo ramps on dwell, preserves phase and disposes all work", () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const frames = new Map(); let sequence = 0;
  const listeners = new Map();
  const animation = { currentTime: 12345, playbackRate: 1, playState: "paused",
    updatePlaybackRate(rate) { this.playbackRate = rate; },
    play() { this.playState = "running"; }, pause() { this.playState = "paused"; } };
  const element = { querySelector: () => null, querySelectorAll: () => [{ getAnimations: () => [animation] }],
    matches: () => false, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    requestAnimationFrame: fn => { frames.set(++sequence, fn); return sequence; }, cancelAnimationFrame: id => frames.delete(id),
  } });
  const tick = time => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(time)); };
  try {
    const controller = createSceneTempo(element);
    controller.setRunning(true); tick(0);
    assert.equal(animation.playbackRate, 0.8);
    assert.equal(frames.size, 0, "steady native animation needs no JS loop");
    listeners.get("pointerenter")({ pointerType: "touch" });
    assert.equal(frames.size, 0);
    listeners.get("pointerenter")({ pointerType: "mouse" });
    assert.equal(animation.playbackRate, 0.8, "hover does not snap speed");
    tick(10); tick(26);
    assert.ok(animation.playbackRate > .8 && animation.playbackRate < .82);
    for (let i = 2; i <= 80; i++) tick(10 + 16 * i);
    const beforeLeave = animation.playbackRate;
    listeners.get("pointerleave")();
    assert.equal(animation.playbackRate, beforeLeave, "leaving does not snap speed");
    tick(1306);
    assert.ok(animation.playbackRate < beforeLeave && animation.playbackRate > 1);
    assert.equal(animation.currentTime, 12345, "the controller never rewinds native phase");
    controller.setRunning(false);
    assert.equal(frames.size, 0); assert.equal(animation.playState, "paused");
    controller.setRunning(true); controller.dispose();
    assert.equal(frames.size, 0); assert.equal(listeners.size, 0);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
  }
});

test("proximity is bounded, falls off with distance and leaves the centre stable", () => {
  const rect = { left: 100, top: 100, width: 400, height: 400 };
  assert.deepEqual(fieldResponse(300, 300, rect), { x: 0, y: 0, strength: 1 });
  const near = fieldResponse(430, 350, rect);
  assert.ok(near.x > 0 && near.y > 0 && near.strength > 0);
  for (const [x, y] of [[-10000, 200], [10000, 10000], [499, 499]]) {
    const response = fieldResponse(x, y, rect);
    assert.ok(Math.abs(response.x) <= 12 && Math.abs(response.y) <= 12);
    assert.ok(response.strength >= 0 && response.strength <= 1);
  }
  assert.equal(fieldResponse(10000, 10000, rect).strength, 0);
});

test("environment controller coalesces events, respects input/visibility preferences and cleans up", () => {
  class Target {
    listeners = new Map();
    addEventListener(name, fn) { this.listeners.set(name, fn); }
    removeEventListener(name) { this.listeners.delete(name); }
    emit(name, event) { this.listeners.get(name)?.(event); }
  }
  class Element extends Target {
    dataset = {};
    properties = new Map();
    style = { setProperty: (key, value) => this.properties.set(key, value), removeProperty: (key) => this.properties.delete(key) };
    children = [];
    rect = { left: 100, top: 100, width: 400, height: 400 };
    querySelectorAll() { return this.children; }
    querySelector() { return null; }
    hasAttribute() { return false; }
    getBoundingClientRect() { return this.rect; }
    closest() { return this.isSurface ? this : null; }
  }
  const root = new Element();
  const field = new Element();
  const node = new Element();
  node.rect = { left: 420, top: 260, width: 6, height: 6 };
  field.children = [node];
  root.children = [field];
  const card = new Element();
  card.isSurface = true;
  const reduced = new Target(); reduced.matches = false;
  const fine = new Target(); fine.matches = true;
  const windowMock = new Target();
  const documentMock = new Target(); documentMock.hidden = false;
  const frames = new Map(); let frameId = 0; let observerCallback; let mutationCallback; let disconnected = false; let contentDisconnected = false;
  Object.assign(windowMock, {
    matchMedia: (query) => query.includes("reduced") ? reduced : fine,
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
  });
  const replacements = { window: windowMock, document: documentMock, Element,
    IntersectionObserver: class {
      constructor(callback) { observerCallback = callback; }
      observe() {}
      unobserve() {}
      disconnect() { disconnected = true; }
    },
    MutationObserver: class {
      constructor(callback) { mutationCallback = callback; }
      observe(_target, options) { assert.equal(options.attributes, undefined); }
      disconnect() { contentDisconnected = true; }
    },
  };
  const previous = Object.fromEntries(Object.keys(replacements).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(replacements)) Object.defineProperty(globalThis, key, { value, configurable: true });
  const flush = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((fn) => fn()); };
  const move = (type = "mouse") => root.emit("pointermove", { clientX: 430, clientY: 270, pointerType: type, target: card });
  try {
    const detach = attachEnvironmentMotion(root);
    assert.equal(field.dataset.motionRunning, "false");
    observerCallback([{ target: field, isIntersecting: true }]);
    assert.equal(field.dataset.motionRunning, "true");
    const streamed = new Element();
    root.children = [streamed]; mutationCallback();
    assert.equal(field.dataset.motionRunning, undefined);
    assert.equal(streamed.dataset.motionRunning, "false");
    root.children = [field]; mutationCallback();
    observerCallback([{ target: field, isIntersecting: true }]);
    for (let i = 0; i < 100; i++) move();
    assert.equal(frames.size, 1);
    flush();
    assert.ok(Number.parseFloat(field.properties.get("--field-x")) > 0);
    assert.ok(Number(node.properties.get("--node-proximity")) > 0.9);
    assert.ok(card.properties.has("--tilt-x"));
    assert.equal(frames.size, 0, "no permanent pointer loop");
    windowMock.emit("scroll");
    assert.equal(field.properties.size, 0);
    move(); reduced.matches = true; reduced.emit("change");
    assert.equal(frames.size, 0);
    assert.equal(field.dataset.motionRunning, "false");
    move(); assert.equal(frames.size, 0);
    reduced.matches = false; reduced.emit("change");
    fine.matches = false; fine.emit("change");
    move(); assert.equal(frames.size, 0);
    assert.equal(field.dataset.motionRunning, "false");
    fine.matches = true; fine.emit("change");
    move("touch"); assert.equal(frames.size, 0);
    documentMock.hidden = true; documentMock.emit("visibilitychange");
    assert.equal(field.dataset.motionRunning, "false");
    move(); assert.equal(frames.size, 0);
    documentMock.hidden = false; documentMock.emit("visibilitychange");
    observerCallback([{ target: field, isIntersecting: false }]);
    assert.equal(field.dataset.motionRunning, "false");
    move(); detach();
    assert.ok(disconnected);
    assert.ok(contentDisconnected);
    assert.equal(frames.size, 0);
    assert.equal(field.dataset.motionRunning, undefined);
    for (const target of [root, windowMock, documentMock, reduced, fine]) assert.equal(target.listeners.size, 0);
  } finally {
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});

test("feedback moves accent layers, not the fixed ring, grid, labels or form", () => {
  const css = readFileSync(new URL("../app/atlas.css", import.meta.url), "utf8");
  assert.match(css, /\.scene-rotor[\s\S]*animation-play-state: paused/);
  assert.match(css, /data-motion-running="true"/);
  assert.match(css, /translateY\(-9px\)[^;]*scale\(1\.025\)/);
  assert.match(css, /@media \(hover: none\), \(pointer: coarse\)/);
  assert.match(css, /\.scene-response \{ opacity: 0; \}/);
  assert.doesNotMatch(source, /--surface-x|--pointer-x|setInterval|setTimeout/);
  assert.doesNotMatch(source.split("const surfaces = ")[1].split(";")[0], /subscription|contact-form/);
});
