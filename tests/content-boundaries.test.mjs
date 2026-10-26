import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

async function sourceModule(path) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

const { pages, skills, releases, navGroups } = await sourceModule("app/lib/site-data.ts");
const { publicPageNames, homeDescription } = await sourceModule("app/lib/public-metadata.ts");

test("the full public copy inventory keeps 45 bilingual routes and their real navigation targets", () => {
  assert.equal(Object.keys(pages).length, 38);
  assert.equal(skills.length, 6);
  assert.deepEqual(Object.keys(publicPageNames).sort(), Object.keys(pages).sort());
  const paths = new Set(["/", ...Object.keys(pages), ...skills.map((skill) => `/skills/${skill.slug}`)]);
  assert.equal(paths.size, 45);
  const checkTexts = (value) => {
    if (!value || typeof value !== "object") return;
    if ("en" in value || "zh" in value) {
      assert.equal(typeof value.en, "string");
      assert.equal(typeof value.zh, "string");
      assert.ok(value.en.trim().length > 0);
      assert.match(value.zh, /[\u3400-\u9fff]/);
    }
    for (const child of Object.values(value)) checkTexts(child);
  };
  for (const value of [pages, skills, releases, navGroups, publicPageNames, homeDescription]) checkTexts(value);
  const navigation = navGroups.flatMap((group) => [group, ...group.items]);
  const related = Object.values(pages).flatMap((page) => page.related ?? []);
  for (const { href } of [...navigation, ...related]) {
    if (href.startsWith("/") && !href.startsWith("//")) assert.ok(paths.has(href.split("#")[0]), href);
  }
});

test("skill conceptualization retains its named early relation without turning exploratory questions into a compulsory workflow", () => {
  const skill = skills.find((item) => item.number === "S-001");
  const beginning = skill.sections[0].body;
  assert.match(beginning.en, /An early sketch.*knowledge supports skills, and personality puts those skills to use/);
  assert.match(beginning.en, /Exploration can start by asking/);
  assert.match(beginning.zh, /提纯知识 → 知识支撑技能 → 人格操作技能/);
  assert.match(beginning.zh, /可以从几个问题入手/);
  assert.equal(skill.maturity.en, "Public concept · evolving");
  assert.equal(skill.selfHost.en, "Documentation first");
});

test("public source, background material and a validated runnable skill remain different states", () => {
  const calibration = skills.find((item) => item.number === "E-001");
  const inheritance = skills.find((item) => item.number === "M-001");
  assert.equal(calibration.maturity.en, "Exploratory · not validated");
  assert.equal(calibration.selfHost.en, "No runnable package");
  const caution = calibration.sections.map((section) => section.body.en).join(" ");
  assert.match(caution, /not a validated training or health protocol/);
  assert.match(caution, /systematic body of practice records/);
  assert.equal(calibration.documents[0].relationship, "definition");
  assert.equal(inheritance.openness.en, "Public definition planned");
  assert.equal(inheritance.documents[0].relationship, "background");
  assert.equal(pages["/legal/business"].status.en, "Public fields under review");
  assert.match(pages["/legal/terms"].intro.en, /separate confirmed scope and delivery agreement/);
});

test("copy editing does not rewrite historical release objects or create a new publication event", () => {
  // These are the existing public records, not events from this local revision.
  assert.deepEqual(releases, [
    {
      version: "worldview · v0.1", date: "2026-06-14",
      title: {
        en: "The worldview–development–life–value chain receives a first complete public shape.",
        zh: "世界观—发展观—人生观—价值观推导链形成第一版公开结构。",
      },
      type: { en: "Worldview", zh: "世界观" },
    },
    {
      version: "skills · catalog-01", date: "2026-07-30",
      title: {
        en: "The first public skill catalog separates source, runtime and private operating state.",
        zh: "首个公开技能目录区分技能来源、运行实现与私有运行态。",
      },
      type: { en: "Skills", zh: "技能" },
    },
    {
      version: "site · 0.2.0", date: "2026-07-30",
      title: {
        en: "GripSky changes from a service landing page into the public entrance of the system.",
        zh: "GripSky 从服务落地页转为世界观与技能体系的公共入口。",
      },
      type: { en: "Interface", zh: "界面" },
    },
  ]);
});
