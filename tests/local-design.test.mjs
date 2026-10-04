import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("the motion controller explicitly suspends hidden, reduced-motion and coarse-pointer scenes", () => {
  const scene = read("app/lib/environment-motion.ts");
  assert.match(scene, /IntersectionObserver/);
  assert.match(scene, /!document\.hidden/);
  assert.match(scene, /!reduced\.matches/);
  assert.match(scene, /fine\.matches/);
  assert.match(scene, /elapsed \/ 24000/);
  assert.match(scene, /cancelAnimationFrame\(frame\)/);
  assert.match(scene, /observer\.disconnect\(\)/);
  assert.doesNotMatch(scene, /setInterval|setTimeout/);
});

test("responsive geometry keeps an explicit mobile composition and does not shrink its labels", () => {
  const css = read("app/atlas.css");
  assert.match(css, /@media \(max-width: 767px\)/);
  assert.match(css, /\.precision-chart \{ aspect-ratio: auto; height: 330px;/);
  assert.match(css, /\.precision-node b \{ font-size: 14px;/);
  assert.match(css, /\.scene-ticks \{ display: none; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("this candidate has a loopback-only entry and an explicit local mail binding", () => {
  const config = read("vite.config.ts");
  const scripts = JSON.parse(read("package.json")).scripts;
  assert.match(config, /vars: \{ LOCAL_EMAIL_PREVIEW: "true" \}/);
  assert.match(scripts["preview:local"], /--host 127\.0\.0\.1 -p 3014/);
  assert.match(scripts["start:local"], /HOST=127\.0\.0\.1 PORT=3014 LOCAL_EMAIL_PREVIEW=true/);
  assert.match(read(".gitignore"), /\.dev\.vars/);
});

test("the redesign stylesheet follows rather than replaces the functional stylesheet", () => {
  const layout = read("app/layout.tsx");
  assert.ok(layout.indexOf('import "./atlas.css"') > layout.indexOf('import "./globals.css"'));
  const chrome = read("app/components/SiteChrome.tsx");
  assert.match(chrome, /gripsky-precision-theme/);
  assert.doesNotMatch(chrome, /normalizedX|--motion-x|--pointer-x/);
});
