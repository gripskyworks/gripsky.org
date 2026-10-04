import Link from "next/link";
import {
  FOUNDER_ORCID,
  GITHUB_ISSUES,
  GITHUB_ORGANIZATION,
  GITHUB_WORLDVIEW,
  CONTACT_EMAIL,
  Locale,
  PageDefinition,
  SkillDefinition,
  localPath,
  navGroups,
  releases,
  skills,
  tx,
  WECHAT_ID,
} from "../lib/site-data";
import { ContactForm } from "./ContactForm";
import { SubscriptionCenter } from "./SubscribeForm";
import { PublicPageSchema } from "./PublicPageSchema";
import { publicPageName } from "../lib/public-metadata";

const serviceRoutes = [
  ["deployment", "Installation & deployment", "安装部署"],
  ["managed-hosting", "Managed operation", "托管运行"],
  ["custom-skills", "Custom skills", "定制技能"],
  ["system-design", "Personal system design", "个人体系构造"],
  ["body-maintenance", "External-body maintenance", "外置身躯维护"],
  ["dedicated", "Dedicated stewardship", "专属共建"],
] as const;

function pageFamily(path: string) {
  if (path.startsWith("/worldview")) return "worldview";
  if (path.startsWith("/skills")) return "skills";
  if (path.startsWith("/body")) return "body";
  if (path.startsWith("/research")) return "research";
  if (path.startsWith("/updates")) return "updates";
  if (path.startsWith("/services")) return "services";
  return "identity";
}

function InteriorMap({ locale, path }: { locale: Locale; path: string }) {
  const family = pageFamily(path);
  const group = navGroups.find((candidate) => candidate.href === `/${family}` || (family === "updates" && candidate.href === "/contact"));
  if (!group) return null;
  const isRoot = path === group.href || (family === "updates" && path === "/updates");
  const links = group.items.filter((item) => !item.href.includes("#") && item.href !== path);

  return (
    <aside className={`interior-map interior-map-${family}`} aria-label={locale === "zh" ? `${tx(group.label, locale)}相关页面` : `${tx(group.label, locale)} pages`}>
      <svg className="interior-map-drawing" viewBox="0 0 520 310" fill="none" aria-hidden="true">
        <path className="map-axis" d="M18 254H502M260 16V294" />
        {family === "worldview" && <><circle cx="260" cy="156" r="126" /><circle cx="260" cy="156" r="70" /><path d="M88 240L438 68M121 83L397 235" /><circle className="map-emphasis" cx="260" cy="156" r="9" /></>}
        {family === "skills" && <><path d="M60 248H168L260 156L352 248H460M260 156V54M168 248V286M352 248V286" /><circle className="map-emphasis" cx="260" cy="156" r="12" /><circle cx="260" cy="54" r="14" /><circle cx="168" cy="248" r="14" /><circle cx="352" cy="248" r="14" /></>}
        {family === "body" && <><rect x="106" y="54" width="308" height="205" /><rect x="142" y="82" width="236" height="150" /><rect x="177" y="111" width="166" height="95" /><path d="M106 54L177 111M414 54L343 111M106 259L177 206M414 259L343 206" /><circle className="map-emphasis" cx="260" cy="156" r="11" /></>}
        {family === "research" && <><ellipse cx="260" cy="156" rx="209" ry="90" transform="rotate(-22 260 156)" /><path d="M83 229L416 74M103 72L433 238" /><circle className="map-emphasis" cx="260" cy="156" r="11" /><circle cx="405" cy="89" r="8" /><circle cx="131" cy="214" r="8" /></>}
        {family === "services" && <><path d="M84 250V69H436V250H84ZM84 116H436M178 116V250M339 116V250" /><path d="M113 91H155M366 91H407M209 191H307" /><circle className="map-emphasis" cx="260" cy="191" r="8" /></>}
        {family === "updates" && <><path d="M78 156H438M123 64V249M260 64V249M397 64V249" /><circle cx="123" cy="156" r="19" /><circle className="map-emphasis" cx="260" cy="156" r="19" /><circle cx="397" cy="156" r="19" /></>}
      </svg>
      <div className="interior-map-head">
        <span>{isRoot ? (locale === "zh" ? "栏目路径" : "Explore this section") : (locale === "zh" ? "同一栏目" : "In this section")}</span>
        <strong>{tx(group.label, locale)}</strong>
      </div>
      <nav>
        {links.map((item, index) => (
          <Link href={localPath(locale, item.href)} key={item.href}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{tx(item.label, locale)}</strong>
            <i aria-hidden="true">↗</i>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function ContentView({
  locale,
  path,
  content,
  skill,
}: {
  locale: Locale;
  path: string;
  content?: PageDefinition;
  skill?: SkillDefinition;
}) {
  if (skill) return <SkillDetail locale={locale} skill={skill} />;
  if (!content) return <NotFound locale={locale} />;

  const isCatalog = path === "/skills/catalog";
  const isReleases = path === "/updates/releases";
  const isSubscribe = path === "/updates/subscribe";
  const isContact = path === "/contact";
  const isFaq = path === "/faq";
  const isAbout = path === "/about";
  const isServices = path === "/services";
  const isSource = path === "/worldview/source";
  const isContribute = path === "/research/contribute";

  if (isSubscribe) {
    return (
      <main className="content-main subscription-page" data-page-family="updates">
        <PublicPageSchema locale={locale} path={path} name={publicPageName(path, locale, tx(content.title, locale))} description={tx(content.intro, locale)} />
        <section className="subscription-page-layout">
          <div className="subscription-intro">
            <div className="subscription-intro-orbit" aria-hidden="true"><span /><i /></div>
            <p className="eyebrow">{tx(content.eyebrow, locale)}</p>
            <h1>{tx(content.title, locale)}</h1>
            <p className="subscription-lead">{tx(content.intro, locale)}</p>
            <div className="subscription-notes">
              {content.sections.map((section, index) => (
                <article key={tx(section.title, locale)}>
                  <span>0{index + 1}</span>
                  <div>
                    <h2>{tx(section.title, locale)}</h2>
                    <p>{tx(section.body, locale)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <SubscriptionCenter locale={locale} />
        </section>
      </main>
    );
  }

  if (isContact) {
    const releaseItems = [...releases].reverse();
    const contactPageUrl = `https://gripsky.org${locale === "zh" ? "/zh" : ""}/contact`;
    const contactPageStructuredData = {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": `${contactPageUrl}#webpage`,
      url: contactPageUrl,
      name: publicPageName(path, locale, tx(content.title, locale)),
      description: tx(content.intro, locale),
      inLanguage: locale === "zh" ? "zh-CN" : "en",
      author: { "@id": "https://gripsky.org/#founder" },
      publisher: { "@id": "https://gripsky.org/#organization" },
      isPartOf: { "@id": "https://gripsky.org/#website" },
      about: { "@id": "https://gripsky.org/#organization" },
      mainEntity: { "@id": "https://gripsky.org/#organization" },
      significantLink: [
        `https://gripsky.org${locale === "zh" ? "/zh" : ""}/updates/releases`,
        `https://gripsky.org${locale === "zh" ? "/zh" : ""}/updates/subscribe`,
        "https://gripsky.org/feed.xml",
        GITHUB_ISSUES,
      ],
    };

    return (
      <main className="content-main updates-contact-page" data-page-family="updates">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(contactPageStructuredData).replace(/</g, "\\u003c"),
          }}
        />
        <section className="updates-contact-first">
          <header className="updates-contact-masthead">
            <p className="eyebrow">{tx(content.eyebrow, locale)}</p>
            <h1>{tx(content.title, locale)}</h1>
            <p>{tx(content.intro, locale)}</p>
          </header>

          <div className="updates-contact-portals">
            <section className="updates-subscription-portal" aria-labelledby="contact-subscription-title">
              <div className="updates-portal-heading">
                <span>SUBSCRIBE / SELF-SERVICE</span>
                <div>
                  <h2 id="contact-subscription-title">{locale === "zh" ? "订阅更新" : "Follow releases"}</h2>
                  <p>
                    {locale === "zh"
                      ? "选择主题、验证邮箱；已有订阅也可以在同一处解除。"
                      : "Choose topics and verify your email address. You can also unsubscribe here."}
                  </p>
                </div>
              </div>
              <SubscriptionCenter locale={locale} />
            </section>

            <div className="updates-contact-work">
              <section className="contact-directory" id="service-contact">
                <div className="contact-directory-heading">
                  <span>DIRECT / PUBLIC</span>
                  <div>
                    <h2>{locale === "zh" ? "业务与协作联系" : "Work and collaboration"}</h2>
                    <p>
                      {locale === "zh"
                        ? "邮件用于正式沟通和材料确认，微信用于先建立联系；公开修正与贡献留在 GitHub。"
                        : "Use email for formal correspondence and confirming materials, WeChat for initial contact, and GitHub for public corrections and contributions."}
                    </p>
                  </div>
                </div>
                <div className="contact-channel-grid">
                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    <span>{locale === "zh" ? "邮箱" : "Email"}</span>
                    <strong>{CONTACT_EMAIL}</strong>
                    <i aria-hidden="true">↗</i>
                  </a>
                  <div>
                    <span>{locale === "zh" ? "微信 ID" : "WeChat ID"}</span>
                    <strong>{WECHAT_ID}</strong>
                    <i aria-hidden="true">●</i>
                  </div>
                </div>
                <a className="contact-github-link" href={GITHUB_ISSUES} target="_blank" rel="noreferrer">
                  <span>{locale === "zh" ? "公开协作与问题反馈" : "Public collaboration and issue reports"}</span>
                  <strong>GitHub Issues</strong>
                  <i aria-hidden="true">↗</i>
                </a>
              </section>
              <ContactForm locale={locale} compact />
            </div>
          </div>
        </section>

        <section className="updates-release-stream" aria-labelledby="release-stream-title">
          <header className="updates-release-heading">
            <p className="eyebrow">07 / RELEASE STREAM</p>
            <h2 id="release-stream-title">
              {locale === "zh" ? "更新记录。" : "Release history."}
            </h2>
            <p>
              {locale === "zh"
                ? "世界观、技能、界面与兼容性变化按日期排列。需要了解影响范围与细节时，可查看版本发布和变更记录。"
                : "Worldview, skill, interface and compatibility changes are listed by date. Open a record for its scope and details."}
            </p>
            <nav aria-label={locale === "zh" ? "版本记录入口" : "Release history links"}>
              <Link href={localPath(locale, "/updates/releases")}>{locale === "zh" ? "全部版本" : "All releases"}<i aria-hidden="true">↗</i></Link>
              <Link href={localPath(locale, "/updates/changelog")}>{locale === "zh" ? "变更记录" : "Changelog"}<i aria-hidden="true">↗</i></Link>
              <a href="/feed.xml">RSS<i aria-hidden="true">↗</i></a>
            </nav>
          </header>
          <div className="updates-release-list">
            {releaseItems.map((release, index) => (
              <article key={release.version}>
                <span className="release-stream-number">{String(releaseItems.length - index).padStart(2, "0")}</span>
                <time dateTime={release.date}>{release.date}</time>
                <div>
                  <span>{tx(release.type, locale)} · {release.version}</span>
                  <h3>{tx(release.title, locale)}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="content-main" data-page-family={pageFamily(path)} data-page-depth={path.split("/").filter(Boolean).length === 1 ? "root" : "detail"}>
      <PublicPageSchema locale={locale} path={path} name={publicPageName(path, locale, tx(content.title, locale))} description={tx(content.intro, locale)} />
      {isFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "@id": `https://gripsky.org${locale === "zh" ? "/zh" : ""}/faq#faq`,
              inLanguage: locale === "zh" ? "zh-CN" : "en",
              mainEntity: content.sections.map((section) => ({
                "@type": "Question",
                name: tx(section.title, locale),
                acceptedAnswer: {
                  "@type": "Answer",
                  text: tx(section.body, locale),
                },
              })),
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <section className="content-hero">
        <div className="content-heading">
          <p className="eyebrow">{tx(content.eyebrow, locale)}</p>
          {content.status && <span className="status-pill"><i />{tx(content.status, locale)}</span>}
          <h1>{tx(content.title, locale)}</h1>
          <p>{tx(content.intro, locale)}</p>
        </div>
        <InteriorMap locale={locale} path={path} />
      </section>

      {content.sections.length > 0 && (
        <section className="content-sections">
          {content.sections.map((section, index) => (
            <article key={tx(section.title, locale)}>
              <span>0{index + 1}</span>
              <div>
                <h2>{tx(section.title, locale)}</h2>
                <p>{tx(section.body, locale)}</p>
                {section.bullets && (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={tx(bullet, locale)}>{tx(bullet, locale)}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {isCatalog && <SkillCatalog locale={locale} />}
      {isReleases && <ReleaseIndex locale={locale} />}
      {isServices && (
        <section className="route-card-grid">
          {serviceRoutes.map(([slug, en, zh], index) => (
            <Link href={localPath(locale, `/services/${slug}`)} key={slug}>
              <span>0{index + 1}</span>
              <h2>{locale === "zh" ? zh : en}</h2>
              <i aria-hidden="true">↗</i>
            </Link>
          ))}
        </section>
      )}
      {isSource && (
        <section className="external-source-card">
          <div>
            <span>GIT / PUBLIC</span>
            <h2>weakdreamer/worldview</h2>
            <p>
              {locale === "zh"
                ? "这里保存经过脱敏的世界观、四观推导、主体系统，以及 GripSky 的公开演化记录。"
                : "The repository holds the privacy-reviewed worldview, its four-view chain, work on the subject system and GripSky’s public history."}
            </p>
          </div>
          <a href={GITHUB_WORLDVIEW} target="_blank" rel="noreferrer">
            {locale === "zh" ? "打开仓库" : "Open repository"}
            <i aria-hidden="true">↗</i>
          </a>
        </section>
      )}
      {isContribute && (
        <section className="external-source-card">
          <div>
            <span>CONTRIBUTE / GITHUB</span>
            <h2>{locale === "zh" ? "先把问题的边界说清楚。" : "Define the problem’s boundaries first."}</h2>
            <p>
              {locale === "zh"
                ? "写下受影响的层级、手里的证据、希望发生的变化，以及哪些内容可以公开。"
                : "Name the affected layer, the evidence at hand, the change you want and what can be shared publicly."}
            </p>
          </div>
          <a href={GITHUB_ISSUES} target="_blank" rel="noreferrer">
            {locale === "zh" ? "提交 Issue" : "Open an issue"}
            <i aria-hidden="true">↗</i>
          </a>
        </section>
      )}
      {isAbout && (
        <section className="external-source-card identity-source-card">
          <div>
            <span>IDENTITY / PUBLIC REFERENCES</span>
            <h2>{locale === "zh" ? "同一个维护者，清楚分开的主体。" : "One maintainer, clearly separated entities."}</h2>
            <p>
              {locale === "zh"
                ? "ORCID 提供持久的自然人标识；GitHub Organization 承载 GripSky 的公开代码与协作记录。两处都指回本组织站。"
                : "ORCID gives the maintainer a persistent identifier. The GitHub organization holds GripSky’s public code and collaboration history. Both link back to this site."}
            </p>
          </div>
          <div className="identity-links">
            <a href={FOUNDER_ORCID} target="_blank" rel="me noreferrer">
              {locale === "zh" ? "临观的 ORCID" : "Lin Guan on ORCID"}
              <i aria-hidden="true">↗</i>
            </a>
            <a href={GITHUB_ORGANIZATION} target="_blank" rel="me noreferrer">
              {locale === "zh" ? "GripSky 的 GitHub" : "GripSky on GitHub"}
              <i aria-hidden="true">↗</i>
            </a>
          </div>
        </section>
      )}

      {content.related && content.related.length > 0 && (
        <section className="related-links">
          <span>{locale === "zh" ? "继续阅读" : "Continue"}</span>
          {content.related.map((item) => (
            <Link href={localPath(locale, item.href)} key={item.href}>
              {tx(item.label, locale)}
              <i aria-hidden="true">→</i>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}

function SkillCatalog({ locale }: { locale: Locale }) {
  return (
    <section className="catalog-grid">
      {skills.map((skill) => (
        <Link href={localPath(locale, `/skills/${skill.slug}`)} key={skill.slug}>
          <div className="catalog-card-top">
            <span>{skill.number}</span>
            <i className={`source-state ${skill.source}`} />
          </div>
          <small>{tx(skill.kind, locale)}</small>
          <h2>{tx(skill.name, locale)}</h2>
          <p>{tx(skill.summary, locale)}</p>
          <dl>
            <div>
              <dt>{locale === "zh" ? "实践状态" : "Practice status"}</dt>
              <dd>{tx(skill.maturity, locale)}</dd>
            </div>
            <div>
              <dt>{locale === "zh" ? "公开状态" : "Public status"}</dt>
              <dd>{tx(skill.openness, locale)}</dd>
            </div>
            <div>
              <dt>{locale === "zh" ? "自托管" : "Self-hosting"}</dt>
              <dd>{tx(skill.selfHost, locale)}</dd>
            </div>
          </dl>
          <b>{locale === "zh" ? "查看技能" : "View skill"} <i aria-hidden="true">↗</i></b>
        </Link>
      ))}
    </section>
  );
}

function ReleaseIndex({ locale }: { locale: Locale }) {
  return (
    <section className="release-index">
      {releases.map((release, index) => (
        <article key={release.version}>
          <span>0{index + 1}</span>
          <time>{release.date}</time>
          <small>{tx(release.type, locale)}</small>
          <h2>{tx(release.title, locale)}</h2>
          <b>{release.version}</b>
        </article>
      ))}
    </section>
  );
}

function SkillDetail({ locale, skill }: { locale: Locale; skill: SkillDefinition }) {
  const sections = skill.sections ?? [
    {
      title: { en: "What remains", zh: "它留下什么" },
      body: {
        en: "A run leaves documents, data and traces of action. Whether its method can become a skill depends on whether it can be used, checked and revised again.",
        zh: "一次使用会留下文档、数据和操作记录。能否成为技能，要看其中的方法是否还能被使用、检查和修正。",
      },
    },
    {
      title: { en: "What travels with a release", zh: "公开时必须带上" },
      body: {
        en: "A public release must document inputs, outputs, dependencies, boundaries, checks, failure modes, upgrades and removal impact.",
        zh: "公开版本需要说明输入、输出、依赖、边界、验收、失败方式、升级和移除影响。",
      },
    },
    {
      title: { en: "What comes next", zh: "接下来" },
      body: skill.source === "public"
        ? {
          en: "Current public material will be shaped into stable releases and self-hosting instructions.",
          zh: "当前公开材料将继续整理成稳定版本和自托管说明。",
        }
        : {
          en: "The generic definition will be separated from internal runtime state, reviewed and released.",
          zh: "先从内部运行态中分离通用定义，再进行脱敏、核验和公开发布。",
        },
    },
  ];
  return (
    <main className="content-main" data-page-family="skills" data-page-depth="detail">
      <PublicPageSchema locale={locale} path={`/skills/${skill.slug}`} name={tx(skill.name, locale)} description={tx(skill.summary, locale)} documents={skill.documents} />
      <section className="content-hero skill-detail-hero">
        <div className="content-heading">
          <p className="eyebrow">{skill.number} / {tx(skill.kind, locale)}</p>
          <span className="status-pill"><i />{tx(skill.maturity, locale)}</span>
          <h1>{tx(skill.name, locale)}</h1>
          <p>{tx(skill.summary, locale)}</p>
        </div>
        <InteriorMap locale={locale} path={`/skills/${skill.slug}`} />
      </section>
      <section className="skill-facts">
        <div>
          <span>{locale === "zh" ? "公开状态" : "Public status"}</span>
          <strong>{tx(skill.openness, locale)}</strong>
        </div>
        <div>
          <span>{locale === "zh" ? "自托管状态" : "Self-hosting status"}</span>
          <strong>{tx(skill.selfHost, locale)}</strong>
        </div>
        <div>
          <span>{locale === "zh" ? "运行边界" : "Runtime boundary"}</span>
          <strong>
            {locale === "zh"
              ? "公开定义不携带设备参数、凭据和眼下的运行状态"
              : "Public definitions exclude device settings, credentials and current runtime state"}
          </strong>
        </div>
      </section>
      <section className="skill-documents" aria-label={locale === "zh" ? "技能源文件" : "Skill source documents"}>
        {skill.documents?.length ? skill.documents.map((document) => (
          <div className="external-source-card" key={document.href}>
            <div>
              <span>{document.relationship === "definition" ? "SOURCE / GITHUB" : "BACKGROUND / GITHUB"}</span>
              <p>{tx(document.note, locale)}</p>
            </div>
            <a href={document.href} target="_blank" rel="noreferrer">
              {tx(document.label, locale)} <i aria-hidden="true">↗</i>
            </a>
          </div>
        )) : (
          <div className="external-source-card">
            <div>
              <span>PUBLIC FILE / PENDING</span>
              <p>{locale === "zh"
                ? "这项技能的通用文件尚未公开，目前可以阅读本站介绍。公开后，这里会提供对应文件的直接链接。"
                : "The generic skill file is not public yet. This page describes its current scope; a direct file link will be added when it is published."}</p>
            </div>
          </div>
        )}
      </section>
      <section className="content-sections">
        {sections.map((section, index) => (
          <article key={section.title.en}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{tx(section.title, locale)}</h2>
              <p>{tx(section.body, locale)}</p>
            </div>
          </article>
        ))}
      </section>
      <section className="related-links">
        <span>{locale === "zh" ? "相关入口" : "Related"}</span>
        <Link href={localPath(locale, "/skills/catalog")}>
          {locale === "zh" ? "返回技能目录" : "Back to catalog"} <i aria-hidden="true">→</i>
        </Link>
        <Link href={localPath(locale, "/updates/subscribe")}>
          {locale === "zh" ? "订阅技能版本" : "Subscribe to skill releases"} <i aria-hidden="true">→</i>
        </Link>
      </section>
    </main>
  );
}

function NotFound({ locale }: { locale: Locale }) {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>{locale === "zh" ? "这里还没有公开页面。" : "There is no public page here yet."}</h1>
      <Link href={localPath(locale, "/")}>
        {locale === "zh" ? "返回首页" : "Return home"}
      </Link>
    </main>
  );
}
