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
    titleA: "Worldview becomes skill.",
    titleB: "Skill becomes a body",
    titleC: "that stays yours.",
    intro:
      "GripSky publishes the worldview Lin Guan is still revising, and the skills growing out of it. Source, releases and self-hosting paths live here; research and implementation continue in the open.",
    primary: "Browse the skill system",
    secondary: "Read the worldview",
    systemLabel: "CURRENT PUBLIC CHAIN",
    nodes: ["Systems theory", "Worldview", "Subject", "Skills", "External body"],
    relationTitle: "Begin wherever the work is.",
    relationIntro:
      "Read it, run it, or help shape it. When the work needs an operator, GripSky can take responsibility for the build and its care.",
    relations: [
      {
        number: "01",
        title: "Read and run",
        text: "Start with the source and release history, then host any public skill you want to keep close.",
        link: "Start with the catalog",
        href: "/skills/catalog",
      },
      {
        number: "02",
        title: "Work in public",
        text: "Bring evidence, test a skill, question a definition or contribute an implementation on GitHub.",
        link: "Join the research",
        href: "/research/contribute",
      },
      {
        number: "03",
        title: "Hand over the operation",
        text: "GripSky can deploy, adapt and maintain the system when running it yourself is no longer the useful part.",
        link: "See service scope",
        href: "/services",
      },
    ],
    skillsKicker: "PUBLIC CATALOG / FIRST SET",
    skillsTitle: "A catalog of skills—and their limits.",
    skillsIntro:
      "Every entry says what can be used today, what remains private, and how far its self-hosted form has come.",
    allSkills: "Open the full catalog",
    bodyKicker: "SELF-HOSTING",
    bodyTitle: "Self-hosting comes first.",
    bodyText:
      "A working skill should survive a change of machine, vendor or operator. Its definition stays public, its dependencies stay legible, and its local state can be exported or removed. Hosting is simply one way to operate that same form.",
    bodyLink: "Read the self-hosting direction",
    releasesKicker: "RELEASE STREAM",
    releasesTitle: "Every change leaves a version.",
    releasesIntro:
      "Worldview, skills and interfaces move at different speeds. Their releases meet here, with dates and scope attached.",
    allReleases: "View all releases",
    subscribeTitle: "Choose what reaches your inbox.",
    subscribeText:
      "Follow worldview, skills, compatibility or research. Email verification keeps the list clean; the release feed is free.",
    subscribe: "Choose update topics",
    serviceTitle: "Some systems need an operator.",
    serviceText:
      "GripSky builds and runs self-hosted systems, develops skills around real work, and looks after an external information body over time.",
    serviceLink: "Read the service boundary",
  },
  zh: {
    kicker: "开放世界观 · 开放技能 · 允许自托管",
    titleA: "世界观落成技能。",
    titleB: "技能接入现实，",
    titleC: "仍然归你掌握。",
    intro:
      "GripSky 公开临观仍在修订的世界观，以及从中长出的技能。源文件、版本记录和自托管路径都留在这里；研究与实现也从这里继续。",
    primary: "浏览技能体系",
    secondary: "阅读世界观",
    systemLabel: "当前公开推导链",
    nodes: ["系统论", "世界观", "主体", "技能", "外置身躯"],
    relationTitle: "从正在发生的事开始。",
    relationIntro:
      "可以读，可以自己运行，也可以一起把它做下去。需要有人接手实施与维护时，再把运行交给 GripSky。",
    relations: [
      {
        number: "01",
        title: "阅读与运行",
        text: "从公开源和版本记录开始，再把想长期保留的技能部署在自己手里。",
        link: "从技能目录开始",
        href: "/skills/catalog",
      },
      {
        number: "02",
        title: "一起把它做出来",
        text: "带着证据核验来源、测试技能、质疑定义，或在 GitHub 贡献实现。",
        link: "参与研究",
        href: "/research/contribute",
      },
      {
        number: "03",
        title: "交付运行",
        text: "当亲自维护已经不是最值得投入的部分，GripSky 可以接手部署、定制和长期运行。",
        link: "查看服务范围",
        href: "/services",
      },
    ],
    skillsKicker: "公开目录 / 第一批",
    skillsTitle: "技能目录，也写清能力边界。",
    skillsIntro:
      "每个条目都写明现在能用到什么、哪些部分仍属私有，以及自托管版本走到了哪里。",
    allSkills: "打开完整目录",
    bodyKicker: "自托管",
    bodyTitle: "先能自托管，再谈托管。",
    bodyText:
      "真正可用的技能，应当经得起更换机器、厂商和维护者。定义保持公开，依赖能够读懂，局部状态可以导出，也可以彻底移除。托管只是这套形态的一种运行方式。",
    bodyLink: "查看自托管方向",
    releasesKicker: "版本流",
    releasesTitle: "每次变化，都留下版本。",
    releasesIntro:
      "世界观、技能和界面各有自己的节奏；这里把发布范围和日期留在同一条记录里。",
    allReleases: "查看全部版本",
    subscribeTitle: "只让想看的更新抵达。",
    subscribeText:
      "世界观、技能、兼容性和研究可以分别选择。邮箱验证用来保持名单干净，版本通知免费。",
    subscribe: "选择更新主题",
    serviceTitle: "有些体系，需要有人长期照看。",
    serviceText:
      "GripSky 部署并运行自托管体系，围绕真实工作构造技能，也长期维护一具外置信息身躯。",
    serviceLink: "查看服务边界",
  },
};

export function HomeView({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];

  return (
    <main className="home-main" data-page-family="home">
      <section className="home-hero">
        <div className="ambient ambient-one" />
        <div className="hero-copy">
          <p className="eyebrow">{copy.kicker}</p>
          {locale === "zh" ? (
            <h1 className="zh-home-title">
              <span>{copy.titleA}</span>
              <span>{copy.titleB}</span>
              <em>{copy.titleC}</em>
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
            <p className="eyebrow">01 / {locale === "zh" ? "入口" : "ACCESS"}</p>
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
          <span>{locale === "zh" ? "更新 / 免费" : "UPDATES / FREE"}</span>
          <h2>{copy.subscribeTitle}</h2>
          <p>{copy.subscribeText}</p>
          <Link href={localPath(locale, "/updates/subscribe")}>
            {copy.subscribe}
            <i aria-hidden="true">↗</i>
          </Link>
        </div>
        <div className="service-panel">
          <span>{locale === "zh" ? "服务 / 托管" : "SERVICES / MANAGED"}</span>
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
