import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../app/lib/form-feedback.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { formErrorMessage } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("every existing public form API error has a bilingual display mapping", () => {
  const routes = ["contact", "subscription/request-code", "subscription/verify", "subscription/preferences"];
  const errors = new Set();
  for (const route of routes) {
    const file = readFileSync(new URL(`../app/api/${route}/route.ts`, import.meta.url), "utf8");
    for (const match of file.matchAll(/\{\s*error:\s*"([^"\n]+)"/g)) errors.add(match[1]);
  }
  assert.ok(errors.size >= 12, "Cover the API errors, not just a sample of the UI.");
  for (const error of errors) {
    assert.ok(source.includes(`${JSON.stringify(error)}: {`), `No display translation for API error: ${error}`);
    assert.match(formErrorMessage(new Error(error), "zh", "request-code"), /[\u3400-\u9fff]/);
    assert.ok(formErrorMessage(new Error(error), "en", "request-code").length > 0);
  }
});

test("unknown failures use action-specific wording without exposing internal messages", () => {
  for (const action of ["request-code", "verify-code", "contact", "load-preferences", "save-preferences"]) {
    const error = new Error("synthetic-private-provider-error /internal/test-only");
    for (const locale of ["en", "zh"]) {
      const message = formErrorMessage(error, locale, action);
      assert.ok(message.length > 0);
      assert.doesNotMatch(message, /synthetic-private|internal|Request failed|Failed to fetch/);
      if (locale === "zh") assert.match(message, /[\u3400-\u9fff]/);
    }
  }
  assert.match(formErrorMessage(null, "en", "contact"), /contact@gripsky\.org/);
});

test("invalid subscription links and connection failures remain different cases", () => {
  for (const locale of ["en", "zh"]) {
    const invalid = formErrorMessage("This subscription link is unavailable.", locale, "load-preferences");
    const network = formErrorMessage(new TypeError("Failed to fetch"), locale, "load-preferences");
    assert.notEqual(invalid, network);
  }
});
