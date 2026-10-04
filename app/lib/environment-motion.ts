export const SCENE_TEMPO = { idle: 0.8, engaged: 1.3, accelerationMs: 900, decelerationMs: 1500 } as const;

/** Frame-rate independent momentum, integrated without changing the animation's phase. */
export function advanceTempo(rate: number, target: number, milliseconds: number) {
  const dt = Math.max(0, Math.min(milliseconds, 64));
  const inertia = target > rate ? SCENE_TEMPO.accelerationMs : SCENE_TEMPO.decelerationMs;
  const decay = Math.exp(-dt / inertia);
  return {
    rate: target + (rate - target) * decay,
    elapsed: target * dt + (rate - target) * inertia * (1 - decay),
  };
}

/** Both illustrations share momentum. Pointer position never changes a planet's position. */
export function createSceneTempo(element: HTMLElement) {
  const marker = element.querySelector<SVGCircleElement>(".scene-signal");
  let animations: Animation[] = [];
  let running = false;
  let hovered = false;
  let focused = false;
  let rate: number = SCENE_TEMPO.idle;
  let elapsed = 0;
  let previous: number | null = null;
  let frame = 0;

  const target = () => hovered || focused ? SCENE_TEMPO.engaged : SCENE_TEMPO.idle;
  const applyRate = () => {
    for (const animation of animations) animation.updatePlaybackRate(rate);
  };
  const paintMarker = () => {
    if (!marker) return;
    const phase = elapsed / 24000 * Math.PI * 2;
    const angle = -28 * Math.PI / 180;
    const x = 252 * Math.cos(phase);
    const y = 110 * Math.sin(phase);
    marker.style.transform = `translate(${x * Math.cos(angle) - y * Math.sin(angle)}px, ${x * Math.sin(angle) + y * Math.cos(angle)}px)`;
  };
  const tick = (time: number) => {
    frame = 0;
    if (!running) return;
    const before = rate;
    const next = advanceTempo(rate, target(), previous === null ? 0 : time - previous);
    previous = time;
    rate = next.rate;
    elapsed += next.elapsed;
    if (Math.abs(rate - target()) < 0.0001) rate = target();
    if (rate !== before) applyRate();
    paintMarker();
    // The lower scene runs natively at steady speed; only its speed ramp needs JS frames.
    if (marker || rate !== target()) frame = window.requestAnimationFrame(tick);
  };
  const wake = () => {
    if (running && !frame) {
      previous = null;
      frame = window.requestAnimationFrame(tick);
    }
  };
  const onEnter = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    hovered = true;
    wake();
  };
  const onLeave = () => { hovered = false; wake(); };
  const onFocus = () => { focused = true; wake(); };
  const onBlur = (event: FocusEvent) => {
    focused = event.relatedTarget instanceof Node && element.contains(event.relatedTarget);
    wake();
  };
  element.addEventListener("pointerenter", onEnter);
  element.addEventListener("pointerleave", onLeave);
  element.addEventListener("focusin", onFocus);
  element.addEventListener("focusout", onBlur);

  return {
    setRunning(allowed: boolean) {
      if (running === allowed) return;
      running = allowed;
      window.cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
      if (!allowed) {
        animations.forEach(animation => animation.pause());
        rate = SCENE_TEMPO.idle;
        return;
      }
      hovered = element.matches(":hover");
      focused = element.matches(":focus-within");
      animations = [...element.querySelectorAll<SVGElement>("[data-orbit-motion]")]
        .flatMap(layer => layer.getAnimations());
      applyRate();
      animations.forEach(animation => animation.play());
      wake();
    },
    dispose() {
      running = false;
      window.cancelAnimationFrame(frame);
      animations.forEach(animation => animation.pause());
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointerleave", onLeave);
      element.removeEventListener("focusin", onFocus);
      element.removeEventListener("focusout", onBlur);
    },
  };
}

/** Decorative proximity only: never translate reading surfaces or the page grid. */
export function fieldResponse(x: number, y: number, rect: { left: number; top: number; width: number; height: number }) {
  const dx = x - rect.left - rect.width / 2;
  const dy = y - rect.top - rect.height / 2;
  const reach = Math.max(rect.width, rect.height) / 2 + 160;
  const strength = Math.max(0, 1 - Math.hypot(dx, dy) / reach);
  return {
    x: Math.max(-1, Math.min(1, dx / Math.max(rect.width / 2, 1))) * 12 * strength,
    y: Math.max(-1, Math.min(1, dy / Math.max(rect.height / 2, 1))) * 12 * strength,
    strength,
  };
}

const fields = ".precision-scene, .selfhost-visual, .content-orbit";
const surfaces = ".catalog-grid > a, .route-card-grid > a, .atlas-portal, .atlas-skill, .external-source-card";

/** One demand-driven pointer frame, with visibility and input-preference gates. */
export function attachEnvironmentMotion(root: HTMLElement) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  let geometry: HTMLElement[] = [];
  const tempos = new Map<HTMLElement, ReturnType<typeof createSceneTempo>>();
  const visible = new Set<HTMLElement>();
  const moved = new Set<HTMLElement>();
  let frame = 0;
  let pointer: { x: number; y: number; target: Element | null } | null = null;
  let previousSurface: HTMLElement | null = null;
  let windowBlurred = false;

  const enabled = () => !reduced.matches && fine.matches && !document.hidden && !windowBlurred;
  const reset = () => {
    window.cancelAnimationFrame(frame);
    frame = 0;
    pointer = null;
    previousSurface = null;
    for (const element of moved) {
      for (const property of ["--field-x", "--field-y", "--field-strength", "--tilt-x", "--tilt-y", "--node-proximity"]) {
        element.style.removeProperty(property);
      }
    }
    moved.clear();
  };
  const reconcile = () => {
    const allowed = enabled();
    for (const element of geometry) {
      const running = allowed && visible.has(element);
      element.dataset.motionRunning = String(running);
      tempos.get(element)?.setRunning(running);
    }
    if (!allowed) reset();
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const element = entry.target as HTMLElement;
      if (entry.isIntersecting) visible.add(element);
      else visible.delete(element);
    }
    reconcile();
  }, { threshold: 0.12 });
  const refreshGeometry = () => {
    const next = [...root.querySelectorAll<HTMLElement>(fields)];
    for (const element of geometry) {
      if (next.includes(element)) continue;
      observer.unobserve(element);
      visible.delete(element);
      tempos.get(element)?.dispose();
      tempos.delete(element);
      delete element.dataset.motionRunning;
    }
    for (const element of next) if (!geometry.includes(element)) {
      if (element.hasAttribute("data-scene-tempo")) tempos.set(element, createSceneTempo(element));
      observer.observe(element);
    }
    geometry = next;
    reconcile();
  };
  // Streamed route content can arrive after usePathname changes. Observe structure,
  // not style attributes, so animation writes never trigger another discovery pass.
  const contentObserver = new MutationObserver(refreshGeometry);
  contentObserver.observe(root.querySelector("#main-content") ?? root, { childList: true, subtree: true });
  refreshGeometry();

  const update = () => {
    frame = 0;
    if (!pointer || !enabled()) return;
    // Read all bounds first, then write styles; pointer movement cannot force repeated layouts.
    const fieldUpdates = [...visible].map((element) => ({
      element, response: fieldResponse(pointer!.x, pointer!.y, element.getBoundingClientRect()),
      nodes: [...element.querySelectorAll<HTMLElement>(".precision-node i")].map((node) => ({
        node, rect: node.getBoundingClientRect(),
      })),
    }));
    const surface = pointer.target?.closest<HTMLElement>(surfaces) ?? null;
    const bounds = surface?.getBoundingClientRect();
    if (previousSurface !== surface && previousSurface) {
      previousSurface.style.removeProperty("--tilt-x");
      previousSurface.style.removeProperty("--tilt-y");
    }
    previousSurface = surface;
    for (const { element, response, nodes } of fieldUpdates) {
      if (!tempos.has(element)) {
        element.style.setProperty("--field-x", `${response.x.toFixed(2)}px`);
        element.style.setProperty("--field-y", `${response.y.toFixed(2)}px`);
      }
      element.style.setProperty("--field-strength", response.strength.toFixed(3));
      moved.add(element);
      for (const { node, rect } of nodes) {
        const distance = Math.hypot(pointer.x - rect.left - rect.width / 2, pointer.y - rect.top - rect.height / 2);
        node.style.setProperty("--node-proximity", Math.max(0, 1 - distance / 150).toFixed(3));
        moved.add(node);
      }
    }
    if (surface && bounds) {
      const x = Math.max(-1, Math.min(1, (pointer.x - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (pointer.y - bounds.top) / bounds.height * 2 - 1));
      surface.style.setProperty("--tilt-x", `${(-y * 1.6).toFixed(2)}deg`);
      surface.style.setProperty("--tilt-y", `${(x * 1.6).toFixed(2)}deg`);
      moved.add(surface);
    }
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !enabled()) return;
    pointer = { x: event.clientX, y: event.clientY, target: event.target instanceof Element ? event.target : null };
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  // Scroll invalidates hover geometry; return to rest until a fresh pointer event arrives.
  root.addEventListener("pointermove", onPointerMove, { passive: true });
  root.addEventListener("pointerleave", reset);
  const onWindowBlur = () => { windowBlurred = true; reconcile(); };
  const onWindowFocus = () => { windowBlurred = false; reconcile(); };
  window.addEventListener("scroll", reset, { passive: true });
  window.addEventListener("blur", onWindowBlur);
  window.addEventListener("focus", onWindowFocus);
  document.addEventListener("visibilitychange", reconcile);
  reduced.addEventListener("change", reconcile);
  fine.addEventListener("change", reconcile);
  reconcile();

  return () => {
    reset();
    observer.disconnect();
    contentObserver.disconnect();
    tempos.forEach(tempo => tempo.dispose());
    tempos.clear();
    geometry.forEach((element) => delete element.dataset.motionRunning);
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerleave", reset);
    window.removeEventListener("scroll", reset);
    window.removeEventListener("blur", onWindowBlur);
    window.removeEventListener("focus", onWindowFocus);
    document.removeEventListener("visibilitychange", reconcile);
    reduced.removeEventListener("change", reconcile);
    fine.removeEventListener("change", reconcile);
  };
}
