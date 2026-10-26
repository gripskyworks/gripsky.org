import Link from "next/link";
import { OrbitalScene } from "./OrbitalScene";
import { SkillIndex } from "./SkillIndex";
import { SolarScene } from "./SolarScene";
import { PublicPageSchema } from "./PublicPageSchema";
import { homeDescription } from "../lib/public-metadata";
import {
  GITHUB_WORLDVIEW,
  Locale,
  localPath,
  releases,
  skills,
  tx,
} from "../lib/site-data";

/** Editorial composition; content and destinations remain shared with the public catalog. */
export function HomeView({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const href = (path: string) => localPath(locale, path);
  const nodes = zh
    ? ["系统论", "世界观", "主体", "技能", "外置身躯"]
    : ["Systems theory", "Worldview", "Subject", "Skills", "External body"];

  return (
    <main className="atlas-home" data-page-family="home">
      <PublicPageSchema locale={locale} path="/" name="GripSky" description={homeDescription[locale]} />
      <section className="atlas-hero" aria-labelledby="atlas-title">
        <div className="atlas-hero-copy">
          <p className="atlas-kicker">
            <span className="atlas-cross" aria-hidden="true" />
            {zh
              ? "开放世界观 / 开放技能 / 自托管"
              : "OPEN WORLDVIEW / OPEN SKILLS / SELF-HOSTING"}
          </p>
          <h1 id="atlas-title">
            <span>{zh ? "世界观" : "Worldview"}</span>
            <span>{zh ? "落成技能。" : "becomes"}</span>
            {!zh && <em>skill.</em>}
          </h1>
          <p className="atlas-deck">
            {zh ? (
              <>
                技能接入现实，
                <br />
                <em>仍然归你掌握。</em>
              </>
            ) : (
              <>
                Skill becomes a body <br />
                <em>that stays yours.</em>
              </>
            )}
          </p>
          <p className="atlas-intro">
            {zh
              ? "GripSky 从世界观出发，研究人怎样认识、改变和扩展自己。临观把这些问题带进技能与信息身躯的探索，在个人实践中修订理解。"
              : "GripSky draws on Lin Guan’s worldview to study how people understand and reshape themselves, and expand their capabilities. He explores these questions through skills and information bodies, revising his understanding through personal practice."}
          </p>
          <Link className="atlas-button" href={href("/skills/catalog")}>
            {zh ? "浏览技能体系" : "Explore the skills"}
            <span aria-hidden="true">↗</span>
          </Link>
          <div className="atlas-hero-note">
            <span>01—05</span>
            <p>
              {zh
                ? "从理解世界，到扩展自己的可达范围。"
                : "From understanding the world to extending your reach."}
            </p>
          </div>
        </div>
        <OrbitalScene
          locale={locale}
          nodes={nodes}
          label={zh ? "开放系统图谱" : "AN ATLAS OF THE SYSTEM"}
        />
      </section>

      <section
        className="atlas-premise"
        aria-label={zh ? "开放的方式" : "Ways to take part"}
      >
        <p>
          {zh ? (
            <>
              让一份理解，
              <br />
              长出更多可能。
            </>
          ) : (
            <>
              One understanding.
              <br />
              More ways to act.
            </>
          )}
        </p>
        {[
          {
            n: "01",
            title: zh ? "读到源头" : "Read the source",
            text: zh
              ? "判断有来处，变化有记录。"
              : "Sourced ideas. Traceable changes.",
            to: "/worldview/source",
          },
          {
            n: "02",
            title: zh ? "留在自己手里" : "Keep it yours",
            text: zh
              ? "公开定义，自托管路径。"
              : "Public definitions. Self-hosting paths.",
            to: "/body/self-host",
          },
          {
            n: "03",
            title: zh ? "一起继续" : "Build in the open",
            text: zh
              ? "带来问题、证据与实现。"
              : "Bring questions, evidence and code.",
            to: "/research/contribute",
          },
        ].map((item) => (
          <Link href={href(item.to)} key={item.n}>
            <span>{item.n}</span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
            <i aria-hidden="true">↗</i>
          </Link>
        ))}
      </section>

      <section
        className="atlas-section atlas-skills"
        aria-labelledby="skill-index-heading"
      >
        <div className="atlas-section-heading">
          <p className="atlas-kicker">01 / {zh ? "技能索引" : "SKILL INDEX"}</p>
          <h2 id="skill-index-heading">
            {zh ? (
              <>
                理解，
                <br />
                <em>成为能力。</em>
              </>
            ) : (
              <>
                Understanding,
                <br />
                <em>made useful.</em>
              </>
            )}
          </h2>
          <p>
            {zh
              ? "临观尝试把知识整理、浏览器操作、同步与恢复等个人实践写成技能。能否在新的情境中复用，还要看实际使用的结果。"
              : "Lin Guan is trying to turn personal practices—organizing knowledge, browser operation, sync and recovery—into skills. What carries over, and what needs revision, must be tested through use."}
          </p>
          <Link className="atlas-text-link" href={href("/skills/catalog")}>
            {zh ? "完整目录与开放状态" : "Full catalog & availability"}
            <span aria-hidden="true">↗</span>
          </Link>
          <div className="atlas-index-seal" aria-hidden="true">
            <span>G</span>
            <i />
            <b>01 / SKILLS</b>
          </div>
        </div>
        <SkillIndex
          locale={locale}
          entries={skills.map((skill) => ({
            code: skill.number,
            name: tx(skill.name, locale),
            summary: tx(skill.summary, locale),
            kind: tx(skill.kind, locale),
            status: tx(skill.openness, locale),
            href: href(`/skills/${skill.slug}`),
            family: skill.number.startsWith("E")
              ? "embodied"
              : skill.number.startsWith("F")
                ? "field"
                : "meta",
          }))}
        />
      </section>

      <section className="atlas-ownership" aria-labelledby="ownership-heading">
        <div className="atlas-ownership-copy">
          <p className="atlas-kicker">
            02 / {zh ? "外置信息身躯" : "THE EXTERNAL BODY"}
          </p>
          <h2 id="ownership-heading">
            {zh ? (
              <>
                扩展你的身躯。
                <br />
                <em>保有你的主权。</em>
              </>
            ) : (
              <>
                Extend your reach.
                <br />
                <em>Keep your agency.</em>
              </>
            )}
          </h2>
          <p>
            {zh
              ? "真正可用的技能，应当经得起更换机器、厂商和维护者。定义保持公开，依赖能够读懂，局部状态可以导出，也可以彻底移除。"
              : "A useful skill should survive changes of machine, vendor or operator—with a public definition, readable dependencies and local state that can be exported or removed."}
          </p>
          <Link
            className="atlas-button atlas-button-outline"
            href={href("/body/self-host")}
          >
            {zh ? "先能自托管，再谈托管" : "Self-hosting comes first"}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <SolarScene />
        <div className="atlas-ownership-foot">
          <span>
            {zh
              ? "身躯的范围可以变，控制权不必交出去。"
              : "The boundary can expand without giving up control."}
          </span>
          <span>GRIPSKY / SELF-HOSTING</span>
        </div>
      </section>

      <section
        className="atlas-section atlas-research"
        aria-labelledby="research-heading"
      >
        <div className="atlas-research-copy">
          <p className="atlas-kicker">
            03 / {zh ? "开放研究" : "OPEN RESEARCH"}
          </p>
          <h2 id="research-heading">
            {zh ? (
              <>
                问题还没有答案，
                <br />
                <em>就先把它公开。</em>
              </>
            ) : (
              <>
                Open work.
                <br />
                <em>While it is still open.</em>
              </>
            )}
          </h2>
          <p>
            {zh
              ? "信息增多，人能投入的时间、精力与资源却有限。GripSky 探索复用已有资源、减少重复建造；维护、能耗与控制权的代价，仍需实践检验。"
              : "Information grows; a person’s time, energy and resources are limited. GripSky explores reusing existing resources and reducing duplicate work. Maintenance, energy use and control trade-offs still need testing in practice."}
          </p>
          <Link className="atlas-text-link" href={href("/research")}>
            {zh ? "进入研究现场" : "Explore the research"}
            <span aria-hidden="true">↗</span>
          </Link>
          <Link className="atlas-text-link" href={href("/research/codetaker")}>
            {zh ? "Codetaker · 游戏创作进行中" : "Codetaker · A game in development"}
            <span aria-hidden="true">↗</span>
          </Link>
          <div className="atlas-research-drawing" aria-hidden="true">
            <svg viewBox="0 0 600 200" fill="none">
              <path d="M-40 170Q240-130 640 170M-40 200Q260-80 640 200M20 160H580" />
              <circle cx="325" cy="68" r="48" />
              <circle cx="325" cy="68" r="5" />
              <path d="M325 0V180" />
            </svg>
          </div>
        </div>
        <div className="atlas-portals">
          <Link className="atlas-portal" href={href("/research/contribute")}>
            <span className="atlas-portal-number">
              01 / {zh ? "参与" : "CONTRIBUTE"}
            </span>
            <span className="atlas-portal-arrow" aria-hidden="true">
              ↗
            </span>
            <h3>{zh ? "一起把它做出来。" : "Work in public."}</h3>
            <p>
              {zh
                ? "带着证据核验来源、测试技能、质疑定义，或在 GitHub 贡献实现。"
                : "Bring evidence, test a skill, question a definition or contribute an implementation on GitHub."}
            </p>
            <span className="atlas-portal-label">
              {zh ? "公开问题与贡献入口" : "Questions & contribution paths"}
            </span>
          </Link>
          <Link className="atlas-portal" href={href("/services")}>
            <span className="atlas-portal-number">
              02 / {zh ? "委托" : "COMMISSION"}
            </span>
            <span className="atlas-portal-arrow" aria-hidden="true">
              ↗
            </span>
            <h3>
              {zh
                ? "委托部署与维护。"
                : "A system, with someone to care for it."}
            </h3>
            <p>
              {zh
                ? "部署、定制和长期维护。收费从承担工作与责任开始，公开的知识仍然公开。"
                : "Deployment, custom skills and continuing maintenance. Fees pay for work and responsibility; public knowledge stays public."}
            </p>
            <span className="atlas-portal-label">
              {zh ? "服务范围与责任边界" : "Service scope & responsibilities"}
            </span>
          </Link>
        </div>
      </section>

      <section
        className="atlas-section atlas-journal"
        aria-labelledby="journal-heading"
      >
        <div className="atlas-journal-heading">
          <p className="atlas-kicker">
            04 / {zh ? "版本记录" : "RELEASE JOURNAL"}
          </p>
          <h2 id="journal-heading">
            {zh ? "变化，留下来。" : "Changes, kept on record."}
          </h2>
          <Link className="atlas-text-link" href={href("/updates/releases")}>
            {zh ? "全部版本" : "All releases"}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="atlas-releases">
          {releases.map((release) => (
            <Link href={href("/updates/releases")} key={release.version}>
              <time dateTime={release.date}>{release.date}</time>
              <div>
                <small>{tx(release.type, locale)}</small>
                <h3>{tx(release.title, locale)}</h3>
              </div>
              <span>{release.version}</span>
              <i aria-hidden="true">↗</i>
            </Link>
          ))}
        </div>
      </section>

      <section className="atlas-connect">
        <div>
          <p className="atlas-kicker">{zh ? "保持联系" : "STAY IN THE LOOP"}</p>
          <h2>
            {zh ? (
              <>
                下一次生长，
                <br />
                与你相见。
              </>
            ) : (
              <>
                Meet the next
                <br />
                iteration.
              </>
            )}
          </h2>
        </div>
        <div>
          <p>
            {zh
              ? "选择你关心的世界观、技能、兼容性或研究更新。订阅免费，可随时退订。"
              : "Worldview, skills, compatibility and research. Choose the updates that matter to you. Free to subscribe, free to leave."}
          </p>
          <Link className="atlas-button" href={href("/updates/subscribe")}>
            {zh ? "选择订阅主题" : "Choose your updates"}
            <span aria-hidden="true">↗</span>
          </Link>
          <Link className="atlas-text-link" href={href("/contact")}>
            {zh ? "有事想聊？直接联系" : "Something in mind? Get in touch"}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <div className="atlas-source">
        <span>
          {zh ? "公开源 / 持续修订中" : "PUBLIC SOURCE / ALWAYS IN REVISION"}
        </span>
        <a href={GITHUB_WORLDVIEW} target="_blank" rel="noreferrer">
          github.com/weakdreamer/worldview <span aria-hidden="true">↗</span>
        </a>
      </div>
    </main>
  );
}
