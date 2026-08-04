import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function colorFrom(block, token) {
  const match = block.match(new RegExp(`--${token}:\\s*(#[0-9a-fA-F]{6})`));
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
    const match = css.match(
      new RegExp(`\\.site-shell\\[data-theme="${theme}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`),
    );
    assert.ok(match, `Missing ${theme} theme`);
    const block = match[1];
    const background = colorFrom(block, "ink");

    for (const token of ["paper", "muted", "muted-dark", "acid"]) {
      const ratio = contrast(background, colorFrom(block, token));
      assert.ok(ratio >= 4.5, `${theme} --${token} contrast is ${ratio.toFixed(2)}:1`);
    }

    const sourceRatio = contrast(colorFrom(block, "source-bg"), colorFrom(block, "source-muted"));
    assert.ok(sourceRatio >= 4.5, `${theme} source text contrast is ${sourceRatio.toFixed(2)}:1`);
  });
}

test("content pages declare the visual families used by the expression system", () => {
  for (const family of ["worldview", "skills", "body", "research", "updates", "services", "identity"]) {
    assert.match(css, new RegExp(`data-page-family="${family}"`));
  }
});
