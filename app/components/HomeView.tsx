import Link from "next/link";
import {
  Locale,
  GITHUB_WORLDVIEW,
  localPath,
  releases,
  skills,
  tx,
} from "../lib/site-data";

const homeCopy = {
  en: {
    kicker: "OPEN WORLDVIEW · OPEN SKILLS · SELF-HOSTABLE",
    titleA: "Worldview into skills.",
    titleB: "Skills into a body",
    titleC: "you control.",
    intro:
      "GripSky publishes an evolving worldview and the skill systems derived from it. Read the source, run public skills in your own environment, or contribute to the research.",
    primary: "Browse the skill system",
    secondary: "Read the worldview",
    systemLabel: "CURRENT PUBLIC CHAIN",
    nodes: ["Systems theory", "Worldview", "Subject", "Skills", "External body"],
    relationTitle: "Three ways to use GripSky",
    relationIntro:
      "The public system stays open. Payment begins only when GripSky takes on implementation, operation, customization or continuing responsibility.",
    relations: [
      {
        number: "01",
        title: "Use",
        text: "Read the source, follow releases and self-host public skills.",
        link: "Start with the catalog",
        href: "/skills/catalog",
      },
      {
        number: "02",
        title: "Participate",
        text: "Review sources, test a skill, open an issue or contribute an implementation.",
        link: "Join the research",
        href: "/research/contribute",
      },
      {
        number: "03",
        title: "Commission",
        text: "Ask GripSky to deploy, adapt or maintain a system when you do not want to operate it alone.",
        link: "See service scope",
        href: "/services",
      },
    ],
    skillsKicker: "PUBLIC CATALOG / FIRST SET",
    skillsTitle: "Skills are published with their boundaries.",
    skillsIntro:
      "Each entry shows what is public, what still depends on private runtime state, and whether a self-hosted package exists.",
    allSkills: "Open the full catalog",
    bodyKicker: "SELF-HOSTING",
    bodyTitle: "The hosted service is optional.",
    bodyText:
      "The target form is portable: public definitions, documented dependencies, local operating state and a clean removal path. Managed operation is one delivery option built on the same base.",
    bodyLink: "Read the self-hosting direction",
    releasesKicker: "RELEASE STREAM",
    releasesTitle: "Follow changes to the system.",
    releasesIntro:
      "Worldview releases, skill packages, compatibility changes and research calls share one versioned update stream.",
    allReleases: "View all releases",
    subscribeTitle: "Subscribe to updates, not marketing.",
    subscribeText:
      "Choose worldview, skill, compatibility or research notices. Verification is by email, and the basic subscription is free.",
    subscribe: "Choose update topics",
    serviceTitle: "Need someone to run it?",
    serviceText:
      "GripSky provides deployment, managed operation, custom skills, personal-system construction and continuing maintenance of an external information body.",
    serviceLink: "Read the service boundary",
  },
  zh: {
    kicker: "开放世界观 · 开放技能 · 允许自托管",
    titleA: "世界观生成技能，",
    titleB: "技能组成由你掌握的",
    titleC: "外置信息身躯。",
    intro:
      "GripSky 公开一套持续演化的世界观，以及从中生长出来的技能体系。你可以阅读源文件、在自己的环境中运行公共技能，也可以参与研究。",
    primary: "浏览技能体系",
    secondary: "阅读世界观",
    systemLabel: "当前公开推导链",
    nodes: ["系统论", "世界观", "主体", "技能", "外置身躯"],
    relationTitle: "使用 GripSky 的三种方式",
    relationIntro:
      "公共体系保持开放。只有在需要 GripSky 承担实施、运行、定制或持续责任时，才进入付费服务。",
    relations: [
      {
        number: "01",
        title: "使用",
        text: "阅读公开源、跟踪版本，并自行托管公共技能。",
        link: "从技能目录开始",
        href: "/skills/catalog",
      },
      {
        number: "02",
        title: "参与",
        text: "核验来源、测试技能、提交 Issue 或贡献实现。",
        link: "参与研究",
        href: "/research/contribute",
      },
      {
        number: "03",
        title: "委托",
        text: "不想独自运行时，可以委托 GripSky 部署、定制或持续维护。",
        link: "查看服务范围",
        href: "/services",
      },
    ],
    skillsKicker: "公开目录 / 第一批",
    skillsTitle: "公开技能时，也公开它的边界。",
    skillsIntro:
      "每个条目标明哪些内容已经公开、哪些仍依赖私有运行态，以及自托管包是否可用。",
    allSkills: "打开完整目录",
    bodyKicker: "自托管",
    bodyTitle: "托管服务不是必选项。",
    bodyText:
      "目标形态是可迁移的：公开定义、明确依赖、局部运行态和可彻底移除的路径。托管运行只是建立在同一基础上的一种交付方式。",
    bodyLink: "查看自托管方向",
    releasesKicker: "版本流",
    releasesTitle: "跟踪整个体系的变化。",
    releasesIntro:
      "世界观版本、技能包、兼容性变化和研究协作，共用一条带版本的更新流。",
    allReleases: "查看全部版本",
    subscribeTitle: "订阅版本，不订阅营销。",
    subscribeText:
      "选择世界观、技能、兼容性或研究通知，通过邮箱完成验证，基础订阅免费。",
    subscribe: "选择更新主题",
    serviceTitle: "需要有人负责运行？",
    serviceText:
      "GripSky 提供安装部署、托管运行、定制技能、个人体系构造，以及外置信息身躯的持续维护。",
    serviceLink: "查看服务边界",
  },
};

export function HomeView({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];

  return (
    <main className="home-main">
      <section className="home-hero">
        <div className="ambient ambient-one" />
        <div className="hero-copy">
          <p className="eyebrow">{copy.kicker}</p>
          {locale === "zh" ? (
            <h1 className="zh-home-title">
              <span>世界观生成技能。</span>
              <span>技能组成</span>
              <span>由你掌握的</span>
              <em>外置信息身躯。</em>
            </h1>
          ) : (
            <h1>
              <span>{copy.titleA}</span>
              <span>{copy.titleB}</span>
              <em>{copy.titleC}</em>
            </h1>
          )}
          <p className="hero-intro">{copy.intro}</p>
          <div className="hero-actions">
            <Link className="primary-button" href={localPath(locale, "/skills/catalog")}>
              {copy.primary}
              <span aria-hidden="true">↘</span>
            </Link>
            <Link className="text-link" href={localPath(locale, "/worldview")}>
              {copy.secondary}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="system-constellation" aria-label={copy.systemLabel}>
          <div className="constellation-grid" aria-hidden="true" />
          <div className="constellation-core">
            <span>G</span>
          </div>
          <div className="constellation-path" aria-hidden="true" />
          {copy.nodes.map((node, index) => (
            <div className={`constellation-node node-${index + 1}`} key={node}>
              <i />
              <span>0{index + 1}</span>
              <b>{node}</b>
            </div>
          ))}
          <p>{copy.systemLabel}</p>
        </div>
      </section>

      <section className="home-section relation-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">01 / ACCESS</p>
            <h2>{copy.relationTitle}</h2>
          </div>
          <p>{copy.relationIntro}</p>
        </div>
        <div className="relation-grid">
          {copy.relations.map((relation) => (
            <article key={relation.number}>
              <span>{relation.number}</span>
              <h3>{relation.title}</h3>
              <p>{relation.text}</p>
              <Link href={localPath(locale, relation.href)}>
                {relation.link}
                <i aria-hidden="true">↗</i>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section skill-preview">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">{copy.skillsKicker}</p>
            <h2>{copy.skillsTitle}</h2>
          </div>
          <p>{copy.skillsIntro}</p>
        </div>
        <div className="skill-list">
          {skills.slice(0, 4).map((skill) => (
            <Link
              className="skill-row"
              href={localPath(locale, `/skills/${skill.slug}`)}
              key={skill.slug}
            >
              <span className="skill-code">{skill.number}</span>
              <div>
                <small>{tx(skill.kind, locale)}</small>
                <h3>{tx(skill.name, locale)}</h3>
              </div>
              <p>{tx(skill.summary, locale)}</p>
              <div className="skill-state">
                <i />
                {tx(skill.openness, locale)}
              </div>
              <span className="row-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        <Link className="section-link" href={localPath(locale, "/skills/catalog")}>
          {copy.allSkills}
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="home-section selfhost-section">
        <div className="selfhost-visual" aria-hidden="true">
          <div className="host-ring ring-a" />
          <div className="host-ring ring-b" />
          <div className="host-core">LOCAL</div>
          <span className="host-node host-a">SOURCE</span>
          <span className="host-node host-b">SKILLS</span>
          <span className="host-node host-c">STATE</span>
          <span className="host-node host-d">EXPORT</span>
        </div>
        <div className="selfhost-copy">
          <p className="eyebrow">{copy.bodyKicker}</p>
          <h2>{copy.bodyTitle}</h2>
          <p>{copy.bodyText}</p>
          <Link className="primary-button" href={localPath(locale, "/body/self-host")}>
            {copy.bodyLink}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="home-section release-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">{copy.releasesKicker}</p>
            <h2>{copy.releasesTitle}</h2>
          </div>
          <p>{copy.releasesIntro}</p>
        </div>
        <div className="release-list">
          {releases.map((release) => (
            <article key={release.version}>
              <span>{release.date}</span>
              <small>{tx(release.type, locale)}</small>
              <h3>{tx(release.title, locale)}</h3>
              <b>{release.version}</b>
            </article>
          ))}
        </div>
        <Link className="section-link" href={localPath(locale, "/updates/releases")}>
          {copy.allReleases}
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="home-section split-cta">
        <div className="subscribe-panel">
          <span>UPDATES / FREE</span>
          <h2>{copy.subscribeTitle}</h2>
          <p>{copy.subscribeText}</p>
          <Link href={localPath(locale, "/updates/subscribe")}>
            {copy.subscribe}
            <i aria-hidden="true">↗</i>
          </Link>
        </div>
        <div className="service-panel">
          <span>SERVICES / MANAGED</span>
          <h2>{copy.serviceTitle}</h2>
          <p>{copy.serviceText}</p>
          <Link href={localPath(locale, "/services")}>
            {copy.serviceLink}
            <i aria-hidden="true">↗</i>
          </Link>
        </div>
      </section>

      <section className="source-band">
        <p>
          {locale === "zh"
            ? "公开源端：github.com/weakdreamer/worldview"
            : "Public source: github.com/weakdreamer/worldview"}
        </p>
        <a href={GITHUB_WORLDVIEW} target="_blank" rel="noreferrer">
          {locale === "zh" ? "打开 GitHub 仓库" : "Open the GitHub repository"}
          <span aria-hidden="true">↗</span>
        </a>
      </section>
    </main>
  );
}
