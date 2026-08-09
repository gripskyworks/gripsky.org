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
  releases,
  skills,
  tx,
  WECHAT_ID,
} from "../lib/site-data";
import { ContactForm } from "./ContactForm";
import { SubscriptionCenter } from "./SubscribeForm";

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
    const latestReleases = releases.slice(-2).reverse();

    return (
      <main className="content-main updates-contact-page" data-page-family="updates">
        <section className="updates-contact-layout">
          <div className="updates-contact-summary">
            <div className="updates-contact-orbit" aria-hidden="true"><span /><i /></div>
            <div className="updates-contact-intro">
              <p className="eyebrow">{tx(content.eyebrow, locale)}</p>
              <h1>{tx(content.title, locale)}</h1>
              <p>{tx(content.intro, locale)}</p>
            </div>

            <section className="latest-updates" aria-labelledby="latest-updates-title">
              <div className="latest-updates-heading">
                <div>
                  <span>RELEASES</span>
                  <h2 id="latest-updates-title">{locale === "zh" ? "最近发布" : "Latest releases"}</h2>
                </div>
                <Link href={localPath(locale, "/updates/releases")}>
                  {locale === "zh" ? "全部版本" : "All releases"}<i aria-hidden="true">↗</i>
                </Link>
              </div>
              <div className="latest-update-list">
                {latestReleases.map((release) => (
                  <article key={release.version}>
                    <time dateTime={release.date}>{release.date}</time>
                    <div>
                      <span>{tx(release.type, locale)} · {release.version}</span>
                      <p>{tx(release.title, locale)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <nav className="update-entry-links" aria-label={locale === "zh" ? "更新入口" : "Update channels"}>
              <Link href={localPath(locale, "/updates/subscribe")}>
                <span>{locale === "zh" ? "邮件订阅" : "Email subscription"}</span><i aria-hidden="true">→</i>
              </Link>
              <Link href={localPath(locale, "/updates/changelog")}>
                <span>{locale === "zh" ? "变更记录" : "Changelog"}</span><i aria-hidden="true">→</i>
              </Link>
              <a href="/feed.xml">
                <span>RSS</span><i aria-hidden="true">→</i>
              </a>
            </nav>
          </div>

          <div className="updates-contact-work">
            <section className="contact-directory" id="service-contact">
              <div className="contact-directory-heading">
                <span>DIRECT / PUBLIC</span>
                <h2>{locale === "zh" ? "直接联系" : "Direct contact"}</h2>
                <p>
                  {locale === "zh"
                    ? "邮件适合正式沟通和材料确认；微信适合先建立联系。公开修正与贡献请留在 GitHub。"
                    : "Use email for formal correspondence and material review, WeChat to establish contact, and GitHub for public corrections and contributions."}
                </p>
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
        </section>
      </main>
    );
  }

  return (
    <main className="content-main" data-page-family={pageFamily(path)}>
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
        <div className="content-orbit" aria-hidden="true">
          <span />
          <span />
          <i />
        </div>
        <div className="content-heading">
          <p className="eyebrow">{tx(content.eyebrow, locale)}</p>
          {content.status && <span className="status-pill"><i />{tx(content.status, locale)}</span>}
          <h1>{tx(content.title, locale)}</h1>
          <p>{tx(content.intro, locale)}</p>
        </div>
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
                ? "这里保存经过脱敏的世界观、四观推导、主体系统，以及 GripSky 一路公开留下的变化。"
                : "The repository holds the desensitized worldview, its four-view chain, subject-system work and GripSky’s public history."}
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
            <h2>{locale === "zh" ? "先把问题的边界说清楚。" : "Begin with the edge of the problem."}</h2>
            <p>
              {locale === "zh"
                ? "写下受影响的层级、手里的证据、希望发生的变化，以及哪些内容可以公开。"
                : "Name the affected layer, the evidence at hand, the change you want and what may remain public."}
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
                : "ORCID provides the maintainer’s persistent person identifier. The GitHub organization carries GripSky’s public code and collaboration history. Both point back to this organization site."}
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
              <dt>{locale === "zh" ? "成熟度" : "Maturity"}</dt>
              <dd>{tx(skill.maturity, locale)}</dd>
            </div>
            <div>
              <dt>{locale === "zh" ? "公开状态" : "Openness"}</dt>
              <dd>{tx(skill.openness, locale)}</dd>
            </div>
            <div>
              <dt>{locale === "zh" ? "自托管" : "Self-host"}</dt>
              <dd>{tx(skill.selfHost, locale)}</dd>
            </div>
          </dl>
          <b>{locale === "zh" ? "查看技能" : "Open skill"} <i aria-hidden="true">↗</i></b>
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
  return (
    <main className="content-main" data-page-family="skills">
      <section className="content-hero skill-detail-hero">
        <div className="content-heading">
          <p className="eyebrow">{skill.number} / {tx(skill.kind, locale)}</p>
          <span className="status-pill"><i />{tx(skill.maturity, locale)}</span>
          <h1>{tx(skill.name, locale)}</h1>
          <p>{tx(skill.summary, locale)}</p>
        </div>
      </section>
      <section className="skill-facts">
        <div>
          <span>{locale === "zh" ? "公开状态" : "Openness"}</span>
          <strong>{tx(skill.openness, locale)}</strong>
        </div>
        <div>
          <span>{locale === "zh" ? "自托管状态" : "Self-host status"}</span>
          <strong>{tx(skill.selfHost, locale)}</strong>
        </div>
        <div>
          <span>{locale === "zh" ? "运行边界" : "Runtime boundary"}</span>
          <strong>
            {locale === "zh"
              ? "公开定义不携带设备参数、凭据和眼下的运行状态"
              : "The public definition travels without device parameters, credentials or current operating state"}
          </strong>
        </div>
      </section>
      <section className="content-sections">
        <article>
          <span>01</span>
          <div>
            <h2>{locale === "zh" ? "它留下什么" : "What remains"}</h2>
            <p>
              {locale === "zh"
                ? "一次运行会留下文档、数据和动作痕迹；技能留下的是下一次仍能调用、检查和修正的能力。"
                : "A run leaves documents, data and traces of action. The skill is what can still be called, checked and revised next time."}
            </p>
          </div>
        </article>
        <article>
          <span>02</span>
          <div>
            <h2>{locale === "zh" ? "公开时必须带上" : "What travels with a release"}</h2>
            <p>
              {locale === "zh"
                ? "公开版本需要说明输入、输出、依赖、边界、验收、失败方式、升级和移除影响。"
                : "A public release must document inputs, outputs, dependencies, boundaries, checks, failure modes, upgrades and removal impact."}
            </p>
          </div>
        </article>
        <article>
          <span>03</span>
          <div>
            <h2>{locale === "zh" ? "接下来" : "What comes next"}</h2>
            <p>
              {skill.source === "public"
                ? locale === "zh"
                  ? "当前公开材料将继续整理成稳定版本和自托管说明。"
                  : "Current public material will be shaped into stable releases and self-hosting instructions."
                : locale === "zh"
                  ? "先从内部运行态中分离通用定义，再进行脱敏、核验和公开发布。"
                  : "The generic definition will be separated from internal runtime state, reviewed and released."}
            </p>
          </div>
        </article>
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
