const llmsIndex = `# GripSky

> GripSky is the public body of a personal system maintained by Lin Guan (临观). It publishes an evolving worldview, the skills derived from it, research questions, release history, self-hosting paths and a managed-service layer.

GripSky separates public definitions from private runtime state. Public skills should remain inspectable, portable and self-hostable; credentials, personal records and device-specific state do not travel with a public release.

## Start here

- [Homepage](https://gripsky.org/): Public entrance and current system map
- [FAQ](https://gripsky.org/faq): Stable definitions, maintainer, audience, openness and operating model
- [Worldview](https://gripsky.org/worldview): The revisable judgment layer
- [Skill catalog](https://gripsky.org/skills/catalog): Public skills, maturity, openness and self-host status
- [External body](https://gripsky.org/body): Memory, interfaces, computation and runtime
- [Research](https://gripsky.org/research): Open questions and contribution paths
- [Updates and contact](https://gripsky.org/contact): Release history, subscriptions and direct contact
- [Services](https://gripsky.org/services): Deployment, managed operation, custom systems and stewardship

## Public sources and identity

- [GripSky GitHub organization](https://github.com/gripskyworks)
- [Public worldview source](https://github.com/weakdreamer/worldview)
- [Lin Guan ORCID](https://orcid.org/0009-0009-9675-5355)
- [About GripSky](https://gripsky.org/about)

## Contact

- [Contact page](https://gripsky.org/contact): Public directory for service and collaboration enquiries
- Email: contact@gripsky.org
- WeChat ID: gripsky

## Update channels

- [Release feed](https://gripsky.org/feed.xml)
- [Email subscription](https://gripsky.org/updates/subscribe)
- [Public contribution](https://gripsky.org/research/contribute)

## Languages

English pages use paths without a language prefix. Simplified Chinese pages use the \`/zh\` prefix, for example [中文 FAQ](https://gripsky.org/zh/faq). Canonical and \`hreflang\` links connect each language pair.
`;

export function GET() {
  return new Response(llmsIndex, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
