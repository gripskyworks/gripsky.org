import { localPath, type Locale, type SkillDefinition } from "../lib/site-data";

/** Visible public page facts only. Do not infer publication dates or validation. */
export function PublicPageSchema({ locale, path, name, description, documents }: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  documents?: SkillDefinition["documents"];
}) {
  const url = `https://gripsky.org${localPath(locale, path)}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    isPartOf: { "@id": "https://gripsky.org/#website" },
    author: { "@id": "https://gripsky.org/#founder" },
    publisher: { "@id": "https://gripsky.org/#organization" },
    ...(path === "/research/codetaker" ? {
      mainEntity: {
        "@type": "CreativeWork",
        "@id": "https://codetaker.gripsky.org/#project",
        name: "Codetaker",
        alternateName: "Vibe 把妹王",
        url: "https://codetaker.gripsky.org/",
        creator: { "@id": "https://gripsky.org/#founder" },
        creativeWorkStatus: "In development",
      },
    } : {}),
    ...(documents?.length ? { citation: documents.map((document) => document.href) } : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
