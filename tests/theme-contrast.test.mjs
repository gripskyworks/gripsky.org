import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = ["../app/globals.css", "../app/interior.css", "../app/atlas.css"]
  .map((path) => readFileSync(new URL(path, import.meta.url), "utf8")).join("\n");

function colorFrom(block, token) {
  const match = Array.from(block.matchAll(new RegExp(`--${token}:\\s*(#[0-9a-fA-F]{6})`, "g"))).at(-1);
  assert.ok(match, `Missing --${token}`);
  return match[1];
}

function luminance(hex) {
  const values = hex.slice(1).match(/../g).map((part) => Number.parseInt(part, 16) / 255);
  const linear = values.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

for (const theme of ["paper", "orbit", "retro", "liquid", "tide"]) {
  test(`${theme} keeps semantic text at WCAG AA contrast`, () => {
    const matches = Array.from(css.matchAll(
      new RegExp(`\\.site-shell\\[data-theme="${theme}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`, "g"),
    ));
    assert.ok(matches.length, `Missing ${theme} theme`);
    const block = matches.map((match) => match[1]).join("\n");
    const background = colorFrom(block, "ink");

    for (const token of ["paper", "muted", "muted-dark", "acid"]) {
      const ratio = contrast(background, colorFrom(block, token));
      assert.ok(ratio >= 4.5, `${theme} --${token} contrast is ${ratio.toFixed(2)}:1`);
    }

    const sourceRatio = contrast(colorFrom(block, "source-bg"), colorFrom(block, "source-muted"));
    assert.ok(sourceRatio >= 4.5, `${theme} source text contrast is ${sourceRatio.toFixed(2)}:1`);

    // The instrument plate and ownership spread have an independent palette.
    const defaults = Array.from(css.matchAll(/\.site-shell\s*\{([\s\S]*?)\n\}/g)).map(match => match[1]).join("\n");
    const field = `${defaults}\n${block}`;
    for (const token of ["field-ink", "field-muted"]) {
      const ratio = contrast(colorFrom(field, "field-surface"), colorFrom(field, token));
      assert.ok(ratio >= 4.5, `${theme} --${token} on the instrument plate: ${ratio.toFixed(2)}:1`);
    }
  });
}

test("content pages declare the visual families used by the expression system", () => {
  for (const family of ["worldview", "skills", "body", "research", "updates", "services", "identity"]) {
    assert.match(css, new RegExp(`data-page-family="${family}"`));
  }
});
