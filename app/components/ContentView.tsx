import Link from "next/link";
import {
  GITHUB_ISSUES,
  GITHUB_WORLDVIEW,
  Locale,
  PageDefinition,
  SkillDefinition,
  localPath,
  releases,
  skills,
  tx,
} from "../lib/site-data";
import { ContactForm } from "./ContactForm";
import { SubscribeForm } from "./SubscribeForm";

const serviceRoutes = [
  ["deployment", "Installation & deployment", "安装部署"],
  ["managed-hosting", "Managed operation", "托管运行"],
  ["custom-skills", "Custom skills", "定制技能"],
  ["system-design", "Personal system design", "个人体系构造"],
  ["body-maintenance", "External-body maintenance", "外置身躯维护"],
  ["dedicated", "Dedicated stewardship", "专属共建"],
] as const;

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
  const isServices = path === "/services";
  const isSource = path === "/worldview/source";
  const isContribute = path === "/research/contribute";

  return (
    <main className="content-main">
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
      {isSubscribe && (
        <section className="form-section">
          <SubscribeForm locale={locale} />
        </section>
      )}
      {isContact && (
        <section className="contact-options">
          <div className="github-contact">
            <span>PUBLIC / GITHUB</span>
            <h2>{locale === "zh" ? "公开贡献走 GitHub" : "Public work goes through GitHub"}</h2>
            <p>
              {locale === "zh"
                ? "概念修正、来源核验、实现实验和公开文档，请提交到 worldview 仓库。"
                : "Use the worldview repository for conceptual corrections, source review, implementation experiments and public documentation."}
            </p>
            <a href={GITHUB_ISSUES} target="_blank" rel="noreferrer">
              {locale === "zh" ? "打开 GitHub Issues" : "Open GitHub Issues"}
              <i aria-hidden="true">↗</i>
            </a>
          </div>
          <ContactForm locale={locale} />
        </section>
      )}
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
                ? "已脱敏的世界观、四观推导、主体系统与 GripSky 公开演化记录。"
                : "Desensitized worldview, the four-view chain, subject systems and GripSky’s public history."}
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
            <h2>{locale === "zh" ? "从一个有边界的问题开始" : "Start with a bounded issue"}</h2>
            <p>
              {locale === "zh"
                ? "说明受影响层、现有证据、建议变化和公开边界。"
                : "State the affected layer, current evidence, proposed change and public boundary."}
            </p>
          </div>
          <a href={GITHUB_ISSUES} target="_blank" rel="noreferrer">
            {locale === "zh" ? "提交 Issue" : "Open an issue"}
            <i aria-hidden="true">↗</i>
          </a>
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
    <main className="content-main">
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
              ? "设备参数、凭据和当前状态不进入公开定义"
              : "Device parameters, credentials and current state stay outside the public definition"}
          </strong>
        </div>
      </section>
      <section className="content-sections">
        <article>
          <span>01</span>
          <div>
            <h2>{locale === "zh" ? "技能是什么" : "What the skill is"}</h2>
            <p>
              {locale === "zh"
                ? "技能是可重复调用的能力结构，不是一次运行产生的文档、数据或动作痕迹。"
                : "A skill is a callable capability structure, not the document, data or action trace produced by one run."}
            </p>
          </div>
        </article>
        <article>
          <span>02</span>
          <div>
            <h2>{locale === "zh" ? "公开要求" : "Release requirements"}</h2>
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
            <h2>{locale === "zh" ? "下一步" : "Next step"}</h2>
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
      <h1>{locale === "zh" ? "这个页面尚未进入公开体系。" : "This page is not in the public system."}</h1>
      <Link href={localPath(locale, "/")}>
        {locale === "zh" ? "返回首页" : "Return home"}
      </Link>
    </main>
  );
}
