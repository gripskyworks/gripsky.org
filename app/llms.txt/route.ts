import { skills } from "../lib/site-data";

const skillDocuments = skills.flatMap((skill) => (skill.documents ?? []).map((document) =>
  `- [${document.label.en}](${document.href}): ${document.note.en}`,
)).join("\n");

const llmsIndex = `# GripSky

> GripSky is maintained by Lin Guan (临观) as a public expression of his personal system. It draws on his evolving worldview to study how people understand, change and extend themselves, with skills and information bodies as practical areas of exploration. Reusable skills and self-hosting are still being developed; each catalog entry states its current scope. Commissioned work has a separately agreed scope.

GripSky separates public definitions from private runtime state. Public skills should remain inspectable, portable and self-hostable; credentials, personal records and device-specific state do not travel with a public release.

## Current scope

Worldview, development, life and values constrain and inform one another; personal choices and practice can revise them. This is not a one-way scientific deduction.

The external body's architecture remains exploratory. The earlier seven-layer view is not a fixed partition, and skills are not automatically organs. LIFS (Linguan InfoFS) addresses some identity, location and cross-endpoint continuity questions; it does not represent completion of the whole Xuan framework.

The catalog distinguishes public source documents, internally used methods and exploratory definitions. Body calibration is exploratory, without systematic practice records or validated effectiveness. Public concepts are not necessarily runnable packages. Consult the visible pages and each entry's status before treating an ability as available.

## Start here

- [Homepage](https://gripsky.org/): Worldview, skills and research, with a conceptual map
- [FAQ](https://gripsky.org/faq): Current scope, maintainer, audience, public sources and ways to use the work
- [Worldview](https://gripsky.org/worldview): The revisable judgment layer
- [Skill catalog](https://gripsky.org/skills/catalog): Practice, public-source and self-hosting status for each entry
- [External body](https://gripsky.org/body): Memory, interfaces, computation and runtime
- [Research](https://gripsky.org/research): Open questions and contribution paths
- [Updates and contact](https://gripsky.org/contact): Release history, subscriptions and direct contact
- [Services](https://gripsky.org/services): Deployment, managed operation, custom systems and stewardship

## Public sources and identity

- [GripSky GitHub organization](https://github.com/gripskyworks)
- [Public worldview source](https://github.com/weakdreamer/worldview)
- [Lin Guan ORCID](https://orcid.org/0009-0009-9675-5355)
- [About GripSky](https://gripsky.org/about)

## Skill documents

${skillDocuments}

Other catalog entries do not yet have public skill files. A source document or earlier background model is not a runnable release.

## Contact

- [Contact page](https://gripsky.org/contact): Public directory for service and collaboration enquiries
- Email: contact@gripsky.org
- WeChat ID: gripsky

## Update channels

- [Release feed](https://gripsky.org/feed.xml)
- [Email subscription](https://gripsky.org/updates/subscribe)
- [Public contribution](https://gripsky.org/research/contribute)

## Languages

English pages use paths without a language prefix. Simplified Chinese pages use the \`/zh\` prefix, for example [中文常见问题](https://gripsky.org/zh/faq). Canonical and \`hreflang\` links connect each language pair.
`;

export function GET() {
  return new Response(llmsIndex, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
