export type Locale = "en" | "zh";

export type LocalizedText = {
  en: string;
  zh: string;
};

export type PageSection = {
  title: LocalizedText;
  body: LocalizedText;
  bullets?: LocalizedText[];
};

export type PageDefinition = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  intro: LocalizedText;
  status?: LocalizedText;
  sections: PageSection[];
  related?: { label: LocalizedText; href: string }[];
};

export const GITHUB_WORLDVIEW = "https://github.com/weakdreamer/worldview";
export const GITHUB_ISSUES = "https://github.com/weakdreamer/worldview/issues";
export const GITHUB_ORGANIZATION = "https://github.com/gripskyworks";
export const FOUNDER_ORCID = "https://orcid.org/0009-0009-9675-5355";
export const CONTACT_EMAIL = "contact@gripsky.org";
export const WECHAT_ID = "gripsky";

export const tx = (value: LocalizedText, locale: Locale) => value[locale];

export const localPath = (locale: Locale, path: string) => {
  if (locale === "en") return path;
  if (path === "/") return "/zh";
  return `/zh${path}`;
};

export const navGroups = [
  {
    label: { en: "Worldview", zh: "世界观" },
    href: "/worldview",
    items: [
      { label: { en: "System map", zh: "体系地图" }, href: "/worldview/map" },
      { label: { en: "Principles", zh: "当前原则" }, href: "/worldview/principles" },
      { label: { en: "Source", zh: "公开源文件" }, href: "/worldview/source" },
    ],
  },
  {
    label: { en: "Skills", zh: "技能" },
    href: "/skills",
    items: [
      { label: { en: "Catalog", zh: "技能目录" }, href: "/skills/catalog" },
      { label: { en: "Meta-skills", zh: "元技能" }, href: "/skills/meta" },
      { label: { en: "Embodied skills", zh: "生理技能" }, href: "/skills/embodied" },
      { label: { en: "Field skills", zh: "领域技能" }, href: "/skills/work" },
    ],
  },
  {
    label: { en: "External body", zh: "外置身躯" },
    href: "/body",
    items: [
      { label: { en: "Architecture", zh: "总体结构" }, href: "/body/architecture" },
      { label: { en: "Runtime", zh: "运行方式" }, href: "/body/runtime" },
      { label: { en: "Self-host", zh: "自托管" }, href: "/body/self-host" },
    ],
  },
  {
    label: { en: "Research", zh: "研究" },
    href: "/research",
    items: [
      { label: { en: "Questions", zh: "研究问题" }, href: "/research/questions" },
      { label: { en: "Roadmap", zh: "公开路线图" }, href: "/research/roadmap" },
      { label: { en: "Contribute", zh: "参与贡献" }, href: "/research/contribute" },
    ],
  },
  {
    label: { en: "Services", zh: "服务" },
    href: "/services",
    items: [
      { label: { en: "Deployment", zh: "安装部署" }, href: "/services/deployment" },
      { label: { en: "Managed operation", zh: "托管运行" }, href: "/services/managed-hosting" },
      { label: { en: "Custom systems", zh: "体系构造" }, href: "/services/system-design" },
    ],
  },
  {
    label: { en: "Updates / Contact", zh: "更新 / 联系" },
    href: "/contact",
    activePaths: ["/contact", "/updates"],
    items: [
      { label: { en: "Releases", zh: "版本发布" }, href: "/updates/releases" },
      { label: { en: "Changelog", zh: "变更记录" }, href: "/updates/changelog" },
      { label: { en: "Subscribe", zh: "订阅更新" }, href: "/updates/subscribe" },
      { label: { en: "Contact", zh: "直接联系" }, href: "/contact#service-contact" },
    ],
  },
] as const;

export type SkillDefinition = {
  slug: string;
  number: string;
  kind: LocalizedText;
  name: LocalizedText;
  summary: LocalizedText;
  maturity: LocalizedText;
  openness: LocalizedText;
  selfHost: LocalizedText;
  source: "public" | "planned" | "definition";
  documents?: {
    href: string;
    label: LocalizedText;
    note: LocalizedText;
    relationship: "definition" | "background";
  }[];
  sections?: PageSection[];
};

export const skills: SkillDefinition[] = [
  {
    slug: "skill-conceptualization",
    number: "S-001",
    kind: { en: "Generative grammar", zh: "技能母体" },
    name: { en: "Skill conceptualization", zh: "技能概念化" },
    summary: {
      en: "Exploring how knowledge and experience become reusable skills. Personal judgment guides their use; practice can reshape them.",
      zh: "把知识和经验整理成可复用的技能。用不用、怎么用，由使用者自己判断；方法随实践修订。",
    },
    maturity: { en: "Public concept · evolving", zh: "公开概念 · 持续演化" },
    openness: { en: "Public in worldview", zh: "已在 worldview 公开" },
    selfHost: { en: "Documentation first", zh: "文档优先" },
    source: "public",
    documents: [
      {
        href: `${GITHUB_WORLDVIEW}/blob/main/${encodeURIComponent("人生观（强化自我）")}/${encodeURIComponent("技能概念化")}/README.md`,
        label: { en: "Read the skill definition on GitHub", zh: "在 GitHub 阅读技能概念化" },
        note: {
          en: "The current public README on the main branch. Earlier architecture and stage descriptions are retained there as part of the concept’s history; this site states the current scope.",
          zh: "main 分支的公开 README。文档保留早期架构与阶段表述；当前研究与实践状态以本站条目说明为准。",
        },
        relationship: "definition",
      },
    ],
    sections: [
      {
        title: { en: "From knowledge to ability", zh: "从知识到能力" },
        body: {
          en: "An early sketch began with distilling knowledge: knowledge supports skills, and personality puts those skills to use. Exploration can start by asking what to understand, how to judge, what to do and how to check results.",
          zh: "这项探索最初的思路是“提纯知识 → 知识支撑技能 → 人格操作技能”。梳理技能时，可以从几个问题入手：需要理解什么、怎样判断、具体做什么、如何检查结果。",
        },
      },
      {
        title: { en: "More than an installation format", zh: "技能卡、工具与运行记录" },
        body: {
          en: "A capability card describes the ability. Platform instructions, scripts and tools give it usable forms; runtime records describe a particular setting. These parts can evolve separately, with links through their sources and the checks used to assess results. Knowledge, judgment, action and checks can become modules where independent reuse is useful.",
          zh: "技能卡说明能力；平台入口、脚本和工具提供调用方式；运行记录保留某次使用的情况。它们可以分别更新，通过来源与验收记录保持关联。知识、判断、动作和验收，也可以按复用需要拆成模块。",
        },
      },
      {
        title: { en: "Practice writes back", zh: "由实践反写" },
        body: {
          en: "A first card is not proof that an ability is mature. When the knowledge or checks are still unclear, exploration comes first. Repeated use and failure can change the method, its boundaries and the grammar used to make the next skill.",
          zh: "写出第一张卡，不等于能力已经成熟。知识和验收还不清楚时，先保留探索。反复使用与失败会修正方法、边界，也会反过来改变下一项技能的生成语法。",
        },
      },
    ],
  },
  {
    slug: "information-inheritance",
    number: "M-001",
    kind: { en: "Meta-skill", zh: "元技能" },
    name: { en: "Information inheritance", zh: "信息遗传与器官表达" },
    summary: {
      en: "A method for deciding where information belongs, what may cross a boundary and how reusable rules feed back into the system.",
      zh: "判断信息属于哪里、哪些内容可以跨越边界，以及怎样把可复用规则写回体系。",
    },
    maturity: { en: "Method in internal use", zh: "内部使用中的方法" },
    openness: { en: "Public definition planned", zh: "计划公开定义与通用规则" },
    selfHost: { en: "No public installation package yet", zh: "暂无公开安装包" },
    source: "planned",
    documents: [
      {
        href: `${GITHUB_WORLDVIEW}/blob/main/${encodeURIComponent("玄")}/${encodeURIComponent("00-临观信息遗传与器官表达模型-v0.1.0.md")}`,
        label: { en: "Read the earlier information-inheritance model", zh: "阅读早期信息遗传与器官表达模型" },
        note: {
          en: "Background model v0.1.0, not the current internally used skill or an installation package. The skill’s public definition is still being prepared.",
          zh: "这是 v0.1.0 背景模型，不是当前内部使用的技能或安装包；技能的通用定义仍待公开。",
        },
        relationship: "background",
      },
    ],
    sections: [
      {
        title: { en: "Decide what should travel", zh: "先判断什么需要传播" },
        body: {
          en: "A source document, a public rewrite, code and a running instance can concern the same object without carrying the same authority. The method identifies their roles and decides which change belongs at which endpoint.",
          zh: "正文源文件、公开改写、代码和运行实例，可以关联同一对象，却各有裁决范围。这项方法先辨认它们的作用，再判断哪些变化需要传到哪些端点。",
        },
      },
      {
        title: { en: "Check at the destination", zh: "在目标端验收" },
        body: {
          en: "Copying a file is only one operation. A change needs a scope, a version and a read-back at its destination. Some differences are legitimate; others are omissions, failures or decisions still waiting for the owner.",
          zh: "复制文件只是其中一个动作。一次变化需要说明范围、版本，并在目标端读回验收。有些差异可以保留，有些是遗漏、失败，或仍需主体裁决的问题。",
        },
      },
      {
        title: { en: "Public form still to be prepared", zh: "通用表达尚待公开" },
        body: {
          en: "The method is used internally, but this entry is not a downloadable release or a claim that every endpoint is synchronized. A public version needs transferable rules and checks without private paths, credentials or operating records.",
          zh: "这项方法已用于内部工作，但此条目不是可下载版本，也不表示全部端点已经同步。公开版本还需要整理可转移的规则与验收方式，并去除私有路径、凭据和现场记录。",
        },
      },
    ],
  },
  {
    slug: "body-calibration",
    number: "E-001",
    kind: { en: "Embodied skill", zh: "生理技能" },
    name: { en: "Body calibration", zh: "定体术" },
    summary: {
      en: "An exploration of how sensing, naming and calibration can make the natural body and its information extensions open to feedback.",
      zh: "探索怎样通过感知、命名与标定，了解自然身体及其信息延展的状态，让行动有依据、结果可反馈。",
    },
    maturity: { en: "Exploratory · not validated", zh: "探索阶段 · 尚未验证" },
    openness: { en: "Public in worldview", zh: "已在 worldview 公开" },
    selfHost: { en: "No runnable package", zh: "暂无可运行包" },
    source: "public",
    documents: [
      {
        href: `${GITHUB_WORLDVIEW}/blob/main/${encodeURIComponent("人生观（强化自我）")}/${encodeURIComponent("技能概念化")}/${encodeURIComponent("定体术")}/README.md`,
        label: { en: "Read Body calibration on GitHub", zh: "在 GitHub 阅读定体术" },
        note: {
          en: "The public exploratory README retains earlier stage descriptions. It does not establish systematic practice or validated effectiveness; see the current status above.",
          zh: "公开探索文档保留早期阶段表述，不构成系统实践或有效性证明；当前状态见上方说明。",
        },
        relationship: "definition",
      },
    ],
    sections: [
      {
        title: { en: "Calibration before control", zh: "先标定，再谈控制" },
        body: {
          en: "Body calibration asks how a person can notice and describe a state well enough to act on it and read back the result. It connects the natural body with information extensions through observation, naming and feedback.",
          zh: "定体术关心怎样察觉和描述自身状态，使下一步的行动有依据、结果能回传。自然身体与信息延展，在这里通过观测、命名和反馈联系起来。",
        },
      },
      {
        title: { en: "The questions come first", zh: "问题仍在形成" },
        body: {
          en: "The required knowledge, useful measures and repeatable strategies are still being explored. There is not yet a systematic body of practice records or evidence of effectiveness. The public documents are research material, not a validated training or health protocol.",
          zh: "所需知识、适用量尺和可重复策略仍在探索，尚未形成体系化实践记录，也没有据此验证效果。公开文档是研究材料，不是经过验证的训练方案或健康指导。",
        },
      },
      {
        title: { en: "An example of staged construction", zh: "阶段构造的样本" },
        body: {
          en: "This entry keeps the concept, its open questions and its sources available without presenting them as a ready-to-run skill. Later practice may revise the definition as well as the implementation.",
          zh: "此条目保留概念、开放问题与来源，不把它们包装成已经可以运行的技能。后续实践既可能改变实现，也可能修正定义本身。",
        },
      },
    ],
  },
  {
    slug: "browser-interface",
    number: "E-002",
    kind: { en: "Embodied skill", zh: "生理技能" },
    name: { en: "Browser and interface operation", zh: "浏览器与界面操作" },
    summary: {
      en: "Reusable procedures for observing and operating browser interfaces, with explicit session and privacy boundaries.",
      zh: "感知浏览器状态、操作界面的流程，同时明确会话与隐私边界。",
    },
    maturity: { en: "Operational internally", zh: "内部可运行" },
    openness: { en: "Generic layer planned", zh: "计划公开通用层" },
    selfHost: { en: "Runtime adapters required", zh: "需要运行时适配" },
    source: "definition",
  },
  {
    slug: "sync-recovery",
    number: "E-003",
    kind: { en: "Embodied skill", zh: "生理技能" },
    name: { en: "Sync and recovery", zh: "同步与恢复" },
    summary: {
      en: "Compares, merges and restores material across nodes, distinguishing authoritative sources, mirrors and runtime state.",
      zh: "在不同节点之间比较、合并和恢复材料，同时区分正本、镜像与运行状态。",
    },
    maturity: { en: "Operational internally", zh: "内部可运行" },
    openness: { en: "Public procedure planned", zh: "计划公开通用流程" },
    selfHost: { en: "Scripts under review", zh: "脚本正在审查" },
    source: "planned",
  },
  {
    slug: "problem-solving",
    number: "F-001",
    kind: { en: "Field skill", zh: "领域技能" },
    name: { en: "Constrained problem solving", zh: "通用问题解决" },
    summary: {
      en: "Develops possible approaches under uncertainty and constraints, compares their costs and narrows them down to an executable next step.",
      zh: "在情况不明、条件受限时寻找多条出路，比较代价，再确定可执行的下一步。",
    },
    maturity: { en: "v0.2 · in use", zh: "v0.2 · 使用中" },
    openness: { en: "Public abstraction planned", zh: "计划公开脱敏版本" },
    selfHost: { en: "Prompt and checklist", zh: "提示与检查清单" },
    source: "planned",
  },
];

export const releases = [
  {
    version: "worldview · v0.1",
    date: "2026-06-14",
    title: {
      en: "The worldview–development–life–value chain receives a first complete public shape.",
      zh: "世界观—发展观—人生观—价值观推导链形成第一版公开结构。",
    },
    type: { en: "Worldview", zh: "世界观" },
  },
  {
    version: "skills · catalog-01",
    date: "2026-07-30",
    title: {
      en: "The first public skill catalog separates source, runtime and private operating state.",
      zh: "首个公开技能目录区分技能来源、运行实现与私有运行态。",
    },
    type: { en: "Skills", zh: "技能" },
  },
  {
    version: "site · 0.2.0",
    date: "2026-07-30",
    title: {
      en: "GripSky changes from a service landing page into the public entrance of the system.",
      zh: "GripSky 从服务落地页转为世界观与技能体系的公共入口。",
    },
    type: { en: "Interface", zh: "界面" },
  },
];

const page = (
  eyebrow: LocalizedText,
  title: LocalizedText,
  intro: LocalizedText,
  sections: PageSection[],
  related?: PageDefinition["related"],
  status?: LocalizedText,
): PageDefinition => ({ eyebrow, title, intro, sections, related, status });

export const pages: Record<string, PageDefinition> = {
  "/worldview": page(
    { en: "01 / WORLDVIEW", zh: "01 / 世界观" },
    { en: "This is where the work begins.", zh: "一切从这里开始。" },
    {
      en: "GripSky treats worldview as a working source: judgments with references, a revision history and consequences for action. It informs what the skill system preserves, changes or rejects.",
      zh: "在 GripSky，世界观保留为可修订的源文件：判断有来源，变化有记录。技能要保留什么、改变什么、拒绝什么，可以从中寻找理由。",
    },
    [
      {
        title: { en: "Four views, in dialogue", zh: "四观，相互校准" },
        body: {
          en: "Worldview asks how the world exists; development asks what counts as growth; a view of life asks how a person can live and form themselves; values weigh direction and cost. Systems theory offers a language for connecting these questions. Personal choices and practice can revise the connections.",
          zh: "世界观理解世界怎样存在，发展观辨认什么算发展，人生观关心人如何生活并形成自己，价值观判断方向与代价。系统论提供连接这些问题的语言；主体的选择与实践，也会反过来修正这些关系。",
        },
      },
      {
        title: { en: "Development is more than accumulation", zh: "发展，不只是积累" },
        body: {
          en: "More tools, information or output do not necessarily mean a person has developed. GripSky looks at reach, feedback, the cost of upkeep and the ability to change course. Growth can mean reorganizing what already exists, or letting an old structure go.",
          zh: "工具、信息和产出变多，不一定意味着人得到了发展。GripSky 更关心可达范围、反馈、维持成本，以及改变方向的能力。发展也可以是重新组织已有积累，或让旧结构退出。",
        },
      },
      {
        title: { en: "Public form", zh: "公开方式" },
        body: {
          en: "The worldview repository is the current public source, with private material excluded. Public judgments should link to a version, a document or an open question.",
          zh: "经过脱敏的 worldview 仓库是当前公开来源。网站上的判断应尽量指向版本、文档或尚未解决的问题。",
        },
      },
    ],
    [
      { label: { en: "Open the system map", zh: "查看体系地图" }, href: "/worldview/map" },
      { label: { en: "Read the public source", zh: "阅读公开源文件" }, href: "/worldview/source" },
    ],
    { en: "Public source available", zh: "公开源文件可用" },
  ),
  "/worldview/map": page(
    { en: "WORLDVIEW / MAP", zh: "世界观 / 体系地图" },
    { en: "How a judgment reaches the world.", zh: "一项判断如何抵达现实。" },
    {
      en: "This is a reading map of the questions behind the work, not a complete dependency graph. The views constrain and explain one another; practice can revise a skill, a life strategy or the model they came from.",
      zh: "这是理解工作脉络的阅读地图，不是完整的依赖图。不同视图彼此约束、相互解释；实践可以修正技能、人生策略，也可以修正它们所依托的模型。",
    },
    [
      {
        title: { en: "Upstream", zh: "上游" },
        body: {
          en: "Systems theory supplies questions about boundary, structure, function, feedback and environment. It helps translate between fields without replacing their evidence or making every analogy valid.",
          zh: "系统论提供关于边界、结构、功能、反馈和环境的提问方式。它帮助不同领域互相理解，但不替代具体学科的证据，也不让所有类比自动成立。",
        },
      },
      {
        title: { en: "Subject", zh: "主体" },
        body: {
          en: "Development, life and values concern how a person can keep forming themselves, what they want to preserve and what costs they will accept. These choices depend on the person and their circumstances, not on deduction alone.",
          zh: "发展观、人生观与价值判断，关心人怎样持续形成自己、要保留什么，以及愿意承担哪些代价。这些选择离不开主体与现实处境，不能只靠上游命题推出。",
        },
      },
      {
        title: { en: "Execution", zh: "执行" },
        body: {
          en: "Skills organize knowledge and judgment into repeatable action. Results and failures return to the method; local operating facts remain distinguishable from the reusable definition.",
          zh: "技能把知识和判断组织成可重复的行动。结果与失败会推动方法修订；具体使用中的运行事实，与可复用定义分开说明。",
        },
      },
      {
        title: { en: "A map has a date", zh: "地图也有自己的时间" },
        body: {
          en: "Earlier Xuan dependency diagrams preserve how the project was understood at the time. They no longer describe the whole current system. This page is a way into the material, not a live map of every implementation.",
          zh: "早期玄的依赖图保留了当时的理解，但已不能代表当前整个体系。本页提供进入材料的路径，不充当全部实现的实时架构图。",
        },
      },
    ],
    [{ label: { en: "Browse the skill catalog", zh: "进入技能目录" }, href: "/skills/catalog" }],
  ),
  "/worldview/principles": page(
    { en: "WORLDVIEW / PRINCIPLES", zh: "世界观 / 当前原则" },
    { en: "Rules that are still earning their place.", zh: "仍在实践中站稳脚跟的原则。" },
    {
      en: "These principles are versioned working judgments. They may change when stronger evidence or repeated practice shows a better model.",
      zh: "这些原则是保留版本的工作判断，可以随更强的证据和反复实践修正。",
    },
    [
      {
        title: { en: "Define the boundary first", zh: "先确定边界" },
        body: {
          en: "Before judging a part, identify the system, its environment and the level at which the question is being asked.",
          zh: "判断局部之前，先确认系统、环境和问题所处层级。",
        },
      },
      {
        title: { en: "Separate fact, model and wish", zh: "区分事实、模型与愿望" },
        body: {
          en: "A useful system keeps evidence, inference and intended direction distinguishable.",
          zh: "可用的体系应当分清证据、推断和希望到达的方向。",
        },
      },
      {
        title: { en: "Protect the larger whole", zh: "不以局部损耗上位整体" },
        body: {
          en: "Local continuation or expansion is not justified when it destroys the larger system that makes it possible.",
          zh: "局部的存续和扩张，不能以破坏使其成立的上位整体为代价。",
        },
      },
      {
        title: { en: "Keep the conditions with the claim", zh: "让判断带着条件" },
        body: {
          en: "A scientific result, an engineering analogy and a personal choice carry different kinds of support. Moving an idea into another field requires stating what changes and what still needs checking.",
          zh: "科学结论、工程类比与个人选择，各有不同的依据。一项认识进入新的领域时，要说明哪些条件变了，哪些部分仍需核对。",
        },
      },
    ],
  ),
  "/worldview/releases": page(
    { en: "WORLDVIEW / RELEASES", zh: "世界观 / 版本" },
    { en: "A changing worldview, held still long enough to cite.", zh: "让仍在变化的世界观，暂时成为可以引用的版本。" },
    {
      en: "A release is a point that others can read, cite and compare. It does not mean the worldview has stopped changing.",
      zh: "版本是可以被阅读、引用和比较的状态，不表示世界观已经停止变化。",
    },
    [
      {
        title: { en: "v0.1 public structure", zh: "v0.1 公开结构" },
        body: {
          en: "Repository materials include systems theory, the four-view chain, work on the subject system and GripSky’s public history.",
          zh: "当前仓库公开系统论基座、四观推导、主体系统以及 GripSky 的公开演化材料。",
        },
      },
    ],
    [{ label: { en: "Subscribe to worldview releases", zh: "订阅世界观版本" }, href: "/updates/subscribe" }],
  ),
  "/worldview/changelog": page(
    { en: "WORLDVIEW / CHANGELOG", zh: "世界观 / 变更记录" },
    { en: "What changed, and why.", zh: "改了什么，为什么改。" },
    {
      en: "The changelog is for changes to definitions, dependencies and the reasoning that connects worldview and skills.",
      zh: "变更记录用于说明定义、依赖或世界观到技能的推导路径发生了什么变化。",
    },
    [
      {
        title: { en: "Current work", zh: "当前工作" },
        body: {
          en: "The public work is moving from a document archive toward versioned sources for skill releases and update notices.",
          zh: "公开体系正在从文档档案转向可以驱动技能版本与更新通知的版本源。",
        },
      },
    ],
  ),
  "/worldview/source": page(
    { en: "WORLDVIEW / SOURCE", zh: "世界观 / 公开源文件" },
    { en: "The source is open.", zh: "源文件就在这里。" },
    {
      en: "The public repository contains a privacy-reviewed version of the worldview and its development history. Private settings, credentials and runtime state are excluded.",
      zh: "公开仓库保存经过脱敏的世界观及其演化历史。私人参数、凭据和运行态不在其中。",
    },
    [
      {
        title: { en: "Repository", zh: "公开仓库" },
        body: {
          en: "github.com/weakdreamer/worldview is the current public source. Its Git history records public changes.",
          zh: "github.com/weakdreamer/worldview 是当前公开来源，Git 历史记录公开变更。",
        },
      },
      {
        title: { en: "Boundary", zh: "边界" },
        body: {
          en: "The public source contains transferable concepts and evidence. Device state, private personal information and organization-specific material remain at their authoritative endpoints.",
          zh: "公开源只包含可转移的概念和证据。设备状态、个人秘密与特定工作现场内容留在各自权威端点。",
        },
      },
    ],
    [],
    { en: "Git repository available", zh: "Git 仓库可访问" },
  ),
  "/skills": page(
    { en: "02 / SKILLS", zh: "02 / 技能体系" },
    { en: "Judgment, made usable.", zh: "让判断成为能力。" },
    {
      en: "A skill carries judgment into repeated action: what it uses, what it does, where its limits lie, how results are checked and where revision starts.",
      zh: "技能把判断带进反复发生的行动。需要哪些材料、怎样处理、适用边界在哪里、如何检查与修正，都应说清楚。",
    },
    [
      {
        title: { en: "Generative grammar", zh: "技能母体" },
        body: {
          en: "Skill conceptualization explores how knowledge supports abilities a person can use and revise. It keeps a method’s reasons, boundaries and checks distinct from a platform’s instruction format.",
          zh: "技能概念化从整理知识开始，让它成为主体能够调用和修正的能力。它保留方法背后的理由、边界与验收，不把某个平台的指令格式当作技能本身。",
        },
      },
      {
        title: { en: "Operational branches", zh: "运行分支" },
        body: {
          en: "Meta-skills form and constrain other skills. Embodied skills act on computers, networks and the physical world. Field skills solve recurring classes of problems.",
          zh: "元技能负责构造和约束其他技能；生理技能作用于计算机、网络和现实世界；领域技能解决反复出现的一类问题。",
        },
      },
      {
        title: { en: "Structure follows use", zh: "结构从使用中长出来" },
        body: {
          en: "Knowledge, judgment, action, tools and checks play different roles inside a skill. They can be organized as reusable modules when needed. Writing a module does not prove maturity, and calling one does not grant permission to publish, send or delete.",
          zh: "知识、判断、动作、工具与验收，在技能内部承担不同作用，需要时可以形成可复用模块。创建模块不等于能力成熟；调用模块也不自动获得发布、发信或删除的授权。",
        },
      },
    ],
    [{ label: { en: "Open the catalog", zh: "打开技能目录" }, href: "/skills/catalog" }],
  ),
  "/skills/catalog": page(
    { en: "SKILLS / CATALOG", zh: "技能 / 目录" },
    { en: "What exists, what is open and what comes next.", zh: "已经存在什么，开放到哪里，接下来做什么。" },
    {
      en: "Each entry states its practice, public-source and packaging status separately. An exploratory definition or an internally used method is not a downloadable release. Status descriptions are specific to each skill, not scores on a universal maturity scale.",
      zh: "每个条目分别说明实践、公开源与打包状态。探索中的定义和内部使用的方法，不等于可下载版本；这些描述对应各项技能，不是给整个体系打分的统一等级。",
    },
    [],
  ),
  "/skills/meta": page(
    { en: "SKILLS / META", zh: "技能 / 元技能" },
    { en: "Skills that keep other skills coherent.", zh: "让其他技能保持清楚、可用和可修正。" },
    {
      en: "Meta-skills select, combine, constrain, verify and evolve other abilities. They do not replace the embodied skill that performs the actual operation.",
      zh: "元技能负责选择、组合、约束、校验和进化其他能力，但不替代直接执行现实动作的生理技能。",
    },
    [
      {
        title: { en: "Current public direction", zh: "当前公开方向" },
        body: {
          en: "Skill generation, information inheritance, ownership and version expression are being shaped into transferable methods. Generation asks how an ability takes form; inheritance asks how its meaning and boundaries survive a change of endpoint.",
          zh: "技能生成、信息遗传、归属与版本表达，正在整理为可转移的方法。生成关心能力如何形成，遗传关心它的意义与边界如何在端点变化后接续。",
        },
      },
    ],
  ),
  "/skills/embodied": page(
    { en: "SKILLS / EMBODIED", zh: "技能 / 生理技能" },
    { en: "Where the system touches reality.", zh: "体系在这里接触现实。" },
    {
      en: "Embodied skills act on browsers, files, networks, devices and real services. Public releases must exclude credentials, device paths and current runtime settings.",
      zh: "生理技能直接操作浏览器、文件、网络、设备和现实服务。公开版本必须去除凭据、设备路径和当前运行参数。",
    },
    [
      {
        title: { en: "Public boundary", zh: "公开边界" },
        body: {
          en: "Definitions, reusable procedures and checks may be public. Cookies, private keys, infrastructure addresses and personal records remain private.",
          zh: "定义、通用流程和验收规则可以公开；Cookie、私钥、基础设施地址和个人记录保持私有。",
        },
      },
      {
        title: { en: "Different stages of practice", zh: "不同的实践阶段" },
        body: {
          en: "Browser operation and recovery procedures have internal uses with local conditions. Body calibration remains an exploration without systematic practice records. Sharing a category does not give these entries the same evidence or readiness.",
          zh: "浏览器操作与恢复流程已有带现场条件的内部用途；定体术仍在探索，尚无体系化实践记录。属于同一分支，不意味着这些条目具有相同的证据与可用程度。",
        },
      },
    ],
  ),
  "/skills/work": page(
    { en: "SKILLS / FIELD", zh: "技能 / 领域技能" },
    { en: "Keep the method. Leave the workplace behind.", zh: "留下方法，不携带工作现场。" },
    {
      en: "Field skills address recurring problems across organizations. Organization-specific accounts, staff details, approvals and internal data are not part of a public skill.",
      zh: "领域技能解决可以跨组织复用的一类问题。特定组织的账号、人员、审批和内部数据不进入公开技能。",
    },
    [
      {
        title: { en: "Current example", zh: "当前示例" },
        body: {
          en: "Constrained problem solving is maintained as a field skill because it serves a recurring problem class rather than one organization.",
          zh: "通用问题解决服务反复出现的一类问题，因此属于领域技能，不属于某个工作现场。",
        },
      },
    ],
  ),
  "/body": page(
    { en: "03 / EXTERNAL BODY", zh: "03 / 外置信息身躯" },
    { en: "A place for skills to live.", zh: "让技能在现实里有地方落脚。" },
    {
      en: "An external information body brings memory, skills, interfaces and infrastructure into a person’s continuing life and action. The aim is not more devices, but a wider reach with history, feedback and control that survive changes of tool or host.",
      zh: "外置信息身躯把记忆、技能、界面和基础设施接入一个人持续的生活与行动。目的不是拥有更多设备，而是扩大可达范围，并让历史、反馈与控制在工具和宿主变化后仍能接续。",
    },
    [
      {
        title: { en: "A working structural view", zh: "一种结构视图" },
        body: {
          en: "Sovereignty, protocol, memory, organs, surface, power and immunity are one earlier way to read the body. They remain useful questions, not seven fixed compartments. Function, implementation, control and time can each reveal a different structure.",
          zh: "主权、协议、记忆、器官、表皮、供能与免疫，是早期理解身躯的一种视图。它们仍是有用的问题，不是七个固定隔间。功能、实现、控制和时间，可以分别呈现不同的结构。",
        },
      },
      {
        title: { en: "Portable by design", zh: "以可迁移为前提" },
        body: {
          en: "An information body should be able to move between tools and hosts without losing its meaning, history or authority boundaries.",
          zh: "可用的信息身躯应能在工具和宿主之间迁移，而不丢失意义、历史和权威边界。",
        },
      },
    ],
    [{ label: { en: "Read the self-hosting direction", zh: "查看自托管方向" }, href: "/body/self-host" }],
  ),
  "/body/architecture": page(
    { en: "EXTERNAL BODY / ARCHITECTURE", zh: "外置身躯 / 总体结构" },
    { en: "Different views. One subject.", zh: "多个视图，同一个主体。" },
    {
      en: "Function, skills, control, information carriers and runtime are different ways to read the same system. Their boundaries need not coincide. The architecture is still being explored; no tool, vendor or automation should quietly become its owner.",
      zh: "功能、技能、控制、信息载体和运行态，是观察同一体系的不同视图，边界不必重合。架构仍在探索；某个工具、厂商或自动化流程，不应悄悄成为它的主人。",
    },
    [
      {
        title: { en: "Sovereignty and protocol", zh: "主权与协议" },
        body: {
          en: "The subject retains final judgment. Protocols define what may be called, shared, changed and recovered.",
          zh: "主体保留最终裁决；协议规定什么可以被调用、传播、修改和恢复。",
        },
      },
      {
        title: { en: "Memory and organs", zh: "记忆与器官" },
        body: {
          en: "Memory keeps sources and history. An organ names an ongoing function; skills, tools, people and services may contribute to it. A skill is not automatically an organ, nor does an organ have to occupy one directory or process. Trials of assembling organs from skills have not yet produced the intended result.",
          zh: "记忆保存来源与历史；器官指向一种持续承担的功能，技能、工具、人和服务都可能参与其中。技能不自动等于器官，器官也不必独占一个目录或进程。以技能组合构造器官的尝试，尚未获得预期成果。",
        },
      },
      {
        title: { en: "Interfaces, support and feedback", zh: "接口、支撑与反馈" },
        body: {
          en: "Interfaces let the system act and be understood. Infrastructure supplies its support; boundaries protect identity and private state. Control also needs a return path: an action’s result must be observable before it can guide the next decision.",
          zh: "接口让体系能够行动，也让人能够理解它；基础设施提供支撑，边界保护身份与私有状态。控制还需要返回的路：行动结果能被看见，才有依据修正下一次判断。",
        },
      },
      {
        title: { en: "One material, several roles", zh: "一份材料，多种作用" },
        body: {
          en: "A document can hold knowledge, provide an interface and preserve operating history without needing three physical copies. Naming its roles, sources and permitted uses is more useful than forcing it into a single classification tree.",
          zh: "同一份文档可以保存知识、提供接口并承载运行历史，不必因此复制成三份。说明它的作用、来源与允许的用法，比把它强塞进唯一分类树更有用。",
        },
      },
    ],
  ),
  "/body/runtime": page(
    { en: "EXTERNAL BODY / RUNTIME", zh: "外置身躯 / 运行方式" },
    { en: "Definitions travel. State has a place.", zh: "定义可以接续，状态各有归属。" },
    {
      en: "Skill definitions describe reusable methods; paths, credentials, models and measurements belong to each device or deployment’s runtime state.",
      zh: "技能定义说明可复用的方法；具体路径、凭据、模型与测量数据，则属于各台设备或部署实例的运行状态。",
    },
    [
      {
        title: { en: "Read the present setting", zh: "先读当前现场" },
        body: {
          en: "Before a run, identify the device and the capabilities available. Do not reuse another node’s credentials or assumptions.",
          zh: "运行前先识别设备和能力，不借用其他节点的凭据与假设。",
        },
      },
      {
        title: { en: "Removable state", zh: "运行态可以迁移或替换" },
        body: {
          en: "A reusable definition should not depend on one host’s private settings. State may be migrated or replaced within its own authorization and recovery boundaries; the new setting still needs its own verification.",
          zh: "可复用定义不应依赖某台宿主的私有参数。状态可以在各自授权与恢复边界内迁移或替换，但到了新的现场，仍然需要重新验收。",
        },
      },
      {
        title: { en: "Continuity is not identical copies", zh: "接续，不等于副本相同" },
        body: {
          en: "Source, code, registry and running service can carry different parts of one object. LIFS addresses some of the storage, consistency and propagation questions first explored in Xuan by tracking identity, location and relationships. It is a current engineering approach, not the completion of the whole Xuan framework.",
          zh: "正文、代码、登记与运行服务，可以各自承载同一对象的不同部分。LIFS 通过身份、位置与关系，承接了玄曾探索的部分存储、一致性和传播问题。它是当前阶段的一种工程解法，不是完整玄框架已经实现。",
        },
      },
    ],
  ),
  "/body/self-host": page(
    { en: "EXTERNAL BODY / SELF-HOST", zh: "外置身躯 / 自托管" },
    { en: "Keep the system close enough to own it.", zh: "把体系放在自己仍能掌握的地方。" },
    {
      en: "Self-hosting is a design requirement, not an enterprise add-on. Public packages will include the definition, dependencies, local-state boundary, installation path and removal impact.",
      zh: "自托管是这里的设计要求。准备公开的技能包需说明定义、依赖、运行态边界、安装路径和移除影响。",
    },
    [
      {
        title: { en: "Current state", zh: "当前状态" },
        body: {
          en: "The worldview source is public. Skill packages are being separated from private runtime state before broader release.",
          zh: "worldview 源文件已经公开；技能包正在与私有运行态分离，完成后再扩大公开范围。",
        },
      },
      {
        title: { en: "Release requirements", zh: "发布要求" },
        body: {
          en: "A self-hostable release must document installation, dependencies, data location, export, upgrade and clean removal.",
          zh: "可自托管版本必须说明安装、依赖、数据位置、导出、升级和彻底移除。",
        },
      },
    ],
    [{ label: { en: "Subscribe to package releases", zh: "订阅技能包发布" }, href: "/updates/subscribe" }],
    { en: "Packages in preparation", zh: "技能包准备中" },
  ),
  "/body/examples": page(
    { en: "EXTERNAL BODY / EXAMPLES", zh: "外置身躯 / 示例" },
    { en: "One skill can inhabit more than one form.", zh: "同一项技能，可以生活在不同形态里。" },
    {
      en: "Documents, scripts, services and human–AI procedures offer different carriers for an ability. The examples here distinguish a working part from the larger architecture it helps explore.",
      zh: "文档、脚本、服务和人机协作流程，都可以承载能力。这里把已能工作的局部，与它帮助探索的更大架构分开看。",
    },
    [
      {
        title: { en: "This organization site", zh: "这个组织站" },
        body: {
          en: "Pages give the project a public expression. Subscription and contact forms provide ways to follow changes and discuss collaboration. The site is a concrete implementation to study and maintain, not proof that every skill or organ is complete.",
          zh: "页面提供公开表达，订阅与联系流程用于跟进更新、开展协作。网站是可以研究和维护的具体实现，不是所有技能或器官已经完成的证明。",
        },
      },
      {
        title: { en: "LIFS · identity and location", zh: "LIFS · 身份与定位" },
        body: {
          en: "Linguan InfoFS separates a logical object from the places that carry it. This helps locate the relevant source or implementation across endpoints. Understanding a document’s contribution and recovering useful ideas from older versions remain a further line of work.",
          zh: "Linguan InfoFS 区分逻辑对象与承载它的位置，帮助跨端点定位相关来源或实现。理解文档的贡献、从旧版本中找回仍有用的思想，则是继续展开的方向。",
        },
      },
      {
        title: { en: "A maintained delivery form", zh: "维护型交付" },
        body: {
          en: "An ability may later be offered as a maintained service. That requires its own scope, evidence and agreement; a public definition alone does not mean a hosted instance is already available.",
          zh: "能力也可以进一步以持续维护的服务交付，但需要另行确认范围、证据与约定。公开定义本身，不表示已经存在可供使用的托管实例。",
        },
      },
    ],
  ),
  "/research": page(
    { en: "04 / RESEARCH", zh: "04 / 研究与共建" },
    { en: "Open work, while it is still open.", zh: "问题还没有答案，就先把它公开。" },
    {
      en: "GripSky studies how people understand, change and extend themselves. Current work explores information bodies, personal authority and public infrastructure. Missing evidence, proposals and work open to contribution on GitHub remain part of the research.",
      zh: "研究从人怎样认识、改变和扩展自己展开。信息身躯、主体主权和公共基础设施，是当前探索的方向；尚缺的证据、待讨论的提案与可在 GitHub 参与的工作，也都留在这里。",
    },
    [
      {
        title: { en: "Current line", zh: "当前主线" },
        body: {
          en: "How can an individual use AI, durable documents and open tools to build an information body that remains understandable, portable and under personal authority? A one-person system concerns a person’s continuing life, learning and action, not only business output. Naming and calibration are ways to make its structures observable; feedback makes later correction possible.",
          zh: "个体如何借助 AI、长期文档与开放工具，建立一个可理解、可迁移且仍由自己掌握的信息身躯？一人系统关心的是人持续的生活、学习与行动，不只经营产出。命名与标定让结构可以被观察，反馈使后续修正成为可能。",
        },
      },
      {
        title: { en: "More information, finite support", zh: "信息丰富，支撑有限" },
        body: {
          en: "Information can grow rapidly, while a person’s time, energy and resources remain limited. GripSky explores extending an existing body’s reach, reusing resources and building public infrastructure that others need not reconstruct. Whether this lowers the total cost of development still needs testing in practice.",
          zh: "信息可以迅速增多，一个人能投入的时间、精力与资源却有限。GripSky 探索扩大已有身躯的可达范围，复用已有资源，并把共同部分建成他人不必反复重建的公共基础设施。这能否降低发展的总成本，仍需实践检验。",
        },
      },
      {
        title: { en: "Evidence still needed", zh: "仍待补足的证据" },
        body: {
          en: "GripSky needs examples that show whether an information body truly extends reach and reuse, rather than shifting maintenance, energy or control costs elsewhere. Public definitions, self-hosting paths and compatible interfaces also need testing: can they reduce repeated construction while keeping final control with the person?",
          zh: "GripSky 需要持续积累这样的例子：信息身躯是否真的扩大可达范围、提高复用程度，而非把维护、能耗或主权成本藏到别处。公开定义、自托管路径与兼容接口也需验证：能否减少重复建造，同时保留主体最终控制权。",
        },
      },
      {
        title: { en: "Contribution", zh: "贡献方式" },
        body: {
          en: "Corrections, source review, implementation experiments, failure reports and documentation are all valid contributions.",
          zh: "概念修正、来源核验、实现实验、失败记录和文档整理都可以成为贡献。",
        },
      },
    ],
    [
      { label: { en: "Open research questions", zh: "查看研究问题" }, href: "/research/questions" },
      { label: { en: "How to contribute", zh: "如何参与贡献" }, href: "/research/contribute" },
    ],
  ),
  "/research/questions": page(
    { en: "RESEARCH / QUESTIONS", zh: "研究 / 当前问题" },
    { en: "Questions with enough weight to change the system.", zh: "这些问题，仍然足以改变整个体系。" },
    {
      en: "These questions guide the work without prescribing a single implementation. Definitions, prototypes and observed results remain separate; an old plan can be reconsidered when the person or the setting changes.",
      zh: "这些问题引导工作，不预先锁定一种实现。定义、原型与实际结果应分开说明；主体和环境变化后，旧计划也可以重新判断。",
    },
    [
      {
        title: { en: "Skill portability", zh: "技能可迁移性" },
        body: {
          en: "What is the smallest vendor-neutral form that preserves a skill’s meaning, checks and revision history?",
          zh: "怎样用尽可能小、不依赖特定厂商的表达，保留技能的意义、验收方法和修正历史？",
        },
      },
      {
        title: { en: "Subject authority", zh: "主体主权" },
        body: {
          en: "How can AI agents act with enough freedom to be useful without silently taking control of identity, memory and irreversible decisions?",
          zh: "如何让 AI Agent 获得足够行动能力，同时不接管身份、记忆与不可逆裁决？",
        },
      },
      {
        title: { en: "Public and private inheritance", zh: "公共与私人遗传" },
        body: {
          en: "How should private practice return general lessons to the public system without leaking local facts?",
          zh: "私人实践怎样把通用经验回写公共体系，同时不泄露局部事实？",
        },
      },
      {
        title: { en: "Recovering useful knowledge", zh: "找回仍有用的知识" },
        body: {
          en: "When names and document structures change, how can a useful judgment still be found with its source and conditions? LIFS provides reproducible lexical searches to locate material; an agent interprets and evaluates what is found. Semantic and vector retrieval are options to study, not prerequisites for this division of work.",
          zh: "名称和文档结构变化之后，怎样让仍有用的判断带着来源与条件被重新找到？LIFS 提供可复现的词法定位，Agent 负责理解与判断。语义与向量检索可以继续研究，不是这种分工成立的前提。",
        },
      },
      {
        title: { en: "Continuity across endpoints", zh: "跨端点的意义接续" },
        body: {
          en: "How can a definition, its history and a current activity remain understandable when devices, services and collaborators change? What must travel, what may differ, and how can the destination show that the right change arrived?",
          zh: "设备、服务和协作者更换后，定义、历史与正在进行的活动怎样仍可理解？哪些内容需要传播，哪些差异可以保留，目标端又如何证明正确的变化已经抵达？",
        },
      },
    ],
  ),
  "/research/roadmap": page(
    { en: "RESEARCH / ROADMAP", zh: "研究 / 公开路线图" },
    { en: "The order in which the open system can become real.", zh: "开放体系按什么顺序成为现实。" },
    {
      en: "Public definitions, portable packages and maintained services are related directions, not a fixed calendar. They may develop at different speeds. Each next step depends on a real use, the evidence available and the cost of maintaining it.",
      zh: "公开定义、可迁移技能包和维护型服务，是相互关联的方向，不是固定日程。它们可以以不同速度推进；下一步取决于真实用途、已有证据与维持成本。",
    },
    [
      {
        title: { en: "01 · Public catalog", zh: "01 · 公开目录" },
        body: {
          en: "Give each entry a name, boundary, source relationship and evidence of its present stage. Keep exploratory definitions, internally used methods and public releases distinguishable.",
          zh: "为条目说明名称、边界、来源关系与当前阶段的证据。探索定义、内部使用的方法和公开版本，保持可区分。",
        },
      },
      {
        title: { en: "02 · Portable package", zh: "02 · 可迁移技能包" },
        body: {
          en: "Separate reusable definitions and scripts from credentials and device-specific state.",
          zh: "把通用定义与脚本从凭据和设备运行态中分离。",
        },
      },
      {
        title: { en: "03 · Managed runtime", zh: "03 · 托管运行" },
        body: {
          en: "Offer selected public skills as maintained services without removing the self-hosted path.",
          zh: "把部分公共技能作为持续维护的服务提供，同时保留自托管路径。",
        },
      },
    ],
  ),
  "/research/proposals": page(
    { en: "RESEARCH / PROPOSALS", zh: "研究 / 提案" },
    { en: "Changes, before the system depends on them.", zh: "在整个体系开始依赖之前，先把变化说清楚。" },
    {
      en: "A proposal needs to state the problem, evidence, affected parts, compatibility costs and decisions still required.",
      zh: "提案将说明问题、证据、受影响的部分、兼容成本，以及仍需作出的裁决。",
    },
    [
      {
        title: { en: "First proposal set", zh: "首批提案方向" },
        body: {
          en: "Public skill manifest, version compatibility, local-state boundaries and release notification format.",
          zh: "公共技能清单、版本兼容关系、运行态边界和版本通知格式。",
        },
      },
    ],
  ),
  "/research/contribute": page(
    { en: "RESEARCH / CONTRIBUTE", zh: "研究 / 参与贡献" },
    { en: "Bring evidence. Leave the work clearer.", zh: "带来证据，把问题说得更清楚。" },
    {
      en: "The worldview repository is the current place for public collaboration. Contributions should retain sources, respect public/private boundaries and distinguish models from facts.",
      zh: "当前公共协作入口是 worldview 仓库。贡献应保留来源、公开边界，并区分模型与事实。",
    },
    [
      {
        title: { en: "Useful contributions", zh: "可接受的贡献" },
        body: {
          en: "Source verification, conceptual corrections, portable implementations, examples, failure reports and documentation improvements.",
          zh: "来源核验、概念修正、可迁移实现、示例、失败记录和文档改进。",
        },
      },
      {
        title: { en: "Before opening a change", zh: "提交变更之前" },
        body: {
          en: "State which layer is changing, what evidence supports it, and whether the change belongs in public source or local operating state.",
          zh: "说明变化发生在哪一层、证据是什么，以及它属于公开源还是局部运行态。",
        },
      },
    ],
    [],
    { en: "GitHub collaboration open", zh: "GitHub 协作入口开放" },
  ),
  "/updates/releases": page(
    { en: "UPDATES / RELEASES", zh: "更新 / 版本发布" },
    { en: "Dates the system can point back to.", zh: "可供回查的版本记录。" },
    {
      en: "This page collects public worldview, skill and interface releases. Each entry identifies its scope and date.",
      zh: "这里汇总世界观、技能和公共界面的发布状态，每个版本标明范围和日期。",
    },
    [],
  ),
  "/updates/changelog": page(
    { en: "UPDATES / CHANGELOG", zh: "更新 / 变更记录" },
    { en: "What changed for the people running it.", zh: "这些变化，会落到实际运行的人身上。" },
    {
      en: "The changelog will prioritize changed definitions, new dependencies, compatibility breaks, migration steps and removal impact.",
      zh: "变更记录优先说明定义变化、新依赖、兼容性中断、迁移步骤和移除影响。",
    },
    [
      {
        title: { en: "Current interface change", zh: "当前界面变化" },
        body: {
          en: "The organization site now centers on open worldview and skills as its core public work. Services have moved to the outer delivery layer.",
          zh: "组织站已经把开放世界观与技能体系作为主体，服务移到最外层交付位置。",
        },
      },
    ],
  ),
  "/updates/subscribe": page(
    { en: "UPDATES / SUBSCRIBE", zh: "更新 / 订阅" },
    { en: "Let the right releases reach you.", zh: "只让需要的版本抵达。" },
    {
      en: "Enter your email address, choose topics and verify the address. Subscription is free and does not create a paid service plan.",
      zh: "填写邮箱、选择主题并验证地址，即可免费订阅。订阅不会开通付费服务。",
    },
    [
      {
        title: { en: "The address remains under your control", zh: "邮箱始终由您控制" },
        body: {
          en: "Every release email carries a visible preferences link and a standards-based one-click unsubscribe header for mail clients that support it.",
          zh: "每封版本通知都带有可见的订阅管理入口，也提供符合标准的一键退订邮件头，供支持它的邮箱客户端直接使用。",
        },
      },
      {
        title: { en: "Topics stay separate", zh: "主题分别管理" },
        body: {
          en: "Stop one topic without losing the rest, or unsubscribe from every update. Verification and necessary security messages are not subscription releases.",
          zh: "可以只停止一个主题而保留其他更新，也可以全部退订。验证码与必要的安全邮件不属于版本订阅。",
        },
      },
    ],
  ),
  "/services": page(
    { en: "05 / SERVICES", zh: "05 / 服务" },
    { en: "Implementation, operation and long-term care.", zh: "部署、运行，以及长期维护。" },
    {
      en: "The public source remains open to read and self-host. Service begins when GripSky takes responsibility for building, adapting or keeping a system alive.",
      zh: "公开源继续允许阅读和自托管。需要 GripSky 对构造、调整或长期运行承担责任时，服务从这里开始。",
    },
    [
      {
        title: { en: "Use it yourself", zh: "自行使用" },
        body: {
          en: "Read the public source, follow release instructions and operate the system under your own authority.",
          zh: "阅读公开源、按照版本说明部署，并在自己的控制下运行。",
        },
      },
      {
        title: { en: "Ask GripSky to operate it", zh: "委托 GripSky" },
        body: {
          en: "GripSky can take responsibility for installation, managed operation, custom skills or long-term maintenance.",
          zh: "GripSky 可以承担安装、托管运行、定制技能和长期维护责任。",
        },
      },
    ],
    [{ label: { en: "Describe a service request", zh: "提交服务需求" }, href: "/contact" }],
  ),
  "/services/deployment": page(
    { en: "SERVICES / DEPLOYMENT", zh: "服务 / 安装部署" },
    { en: "A self-hosted system, running in its new home.", zh: "让自托管体系在新的环境里真正跑起来。" },
    {
      en: "GripSky installs selected public skills, documents dependencies and leaves export, upgrade and removal paths with the client.",
      zh: "GripSky 安装选定的公共技能，记录依赖，并把导出、升级和移除路径交给委托方。",
    },
    [
      {
        title: { en: "Deliverables", zh: "交付内容" },
        body: {
          en: "Environment assessment, installation, configuration boundary, verification record and handover document.",
          zh: "环境检查、安装、配置边界、验收记录和接手文档。",
        },
      },
    ],
  ),
  "/services/managed-hosting": page(
    { en: "SERVICES / MANAGED OPERATION", zh: "服务 / 托管运行" },
    { en: "Operation and recovery, maintained by GripSky.", zh: "由 GripSky 维护运行与恢复路径。" },
    {
      en: "Managed operation covers updates, backups, monitoring and incident handling. Users retain documented export and migration paths.",
      zh: "托管运行包括升级、备份、监测和故障处理，同时保留清楚的导出与迁移路径。",
    },
    [
      {
        title: { en: "Not a lock-in layer", zh: "不以锁定为前提" },
        body: {
          en: "Managed operation is a maintained delivery form of the public base, not a replacement for self-hosting.",
          zh: "托管版是公共基础的维护型交付方式，不取代自托管版本。",
        },
      },
    ],
  ),
  "/services/custom-skills": page(
    { en: "SERVICES / CUSTOM SKILLS", zh: "服务 / 定制技能" },
    { en: "Turn recurring work into a reusable skill.", zh: "把反复发生的工作，变成可以再次调用的能力。" },
    {
      en: "The work begins with inputs, outputs, evidence, tools, failure conditions and the client’s final authority. The deliverable is a skill that can be used again.",
      zh: "从输入、输出、证据、工具、失败条件和委托方裁决权开始，最终交付可以再次调用的技能。",
    },
    [
      {
        title: { en: "Possible forms", zh: "可能形式" },
        body: {
          en: "Documents, checklists, scripts, agent skills, automations, interfaces or a combination of them.",
          zh: "文档、检查清单、脚本、Agent 技能、自动化、界面或它们的组合。",
        },
      },
    ],
  ),
  "/services/system-design": page(
    { en: "SERVICES / SYSTEM DESIGN", zh: "服务 / 体系构造" },
    { en: "A system grown from the client’s own judgments.", zh: "从委托方自己的判断出发，构造属于自己的体系。" },
    {
      en: "GripSky starts from the client’s goals, constraints and recurring work, not a copy of Lin Guan’s personal worldview. The skill system is designed to belong to the client.",
      zh: "GripSky 不把临观的个人世界观复制给别人，而是识别委托方自己的目标、约束和反复工作，再构造属于委托方的技能体系。",
    },
    [
      {
        title: { en: "Scope", zh: "范围" },
        body: {
          en: "System map, skill ownership, version rules, runtime boundaries, first skills and a maintenance path.",
          zh: "体系地图、技能归属、版本规则、运行态边界、首批技能和维护路径。",
        },
      },
    ],
  ),
  "/services/body-maintenance": page(
    { en: "SERVICES / BODY MAINTENANCE", zh: "服务 / 外置身躯维护" },
    { en: "Long-term care for a body that keeps changing.", zh: "照看一具仍在变化的外置信息身躯。" },
    {
      en: "This service maintains memory structure, skills, interfaces, operating state and recovery paths over time.",
      zh: "这项服务长期维护记忆结构、技能、界面、运行态和恢复路径。",
    },
    [
      {
        title: { en: "Responsibility", zh: "承担的责任" },
        body: {
          en: "Review changes, keep boundaries explicit, document failures, update skills and preserve the client’s authority over irreversible decisions.",
          zh: "审查变化、保持边界清楚、记录失败、升级技能，并保留委托方对不可逆决策的裁决权。",
        },
      },
    ],
  ),
  "/services/dedicated": page(
    { en: "SERVICES / DEDICATED STEWARDSHIP", zh: "服务 / 专属共建" },
    { en: "Long-term collaboration, with Lin Guan involved in decisions.", zh: "由临观持续参与判断的长期共建。" },
    {
      en: "Dedicated work draws on Lin Guan’s own skills and external skill system where relevant. Each engagement needs a clear scope, privacy boundaries and capacity limits.",
      zh: "专属共建可按需要使用临观已有的自然技能与外置技能体系；每次合作都需确认范围、隐私边界与可承接的工作量。",
    },
    [
      {
        title: { en: "Suitable cases", zh: "适合的情况" },
        body: {
          en: "A long-lived personal system, a complex skill architecture, or an external body that requires continuing judgment rather than one delivery.",
          zh: "需要长期运行的个人体系、复杂技能架构，或需要持续裁决而不是一次性交付的外置信息身躯。",
        },
      },
    ],
    [{ label: { en: "Discuss scope", zh: "讨论合作范围" }, href: "/contact" }],
  ),
  "/faq": page(
    { en: "REFERENCE / FAQ", zh: "参考 / 常见问题" },
    { en: "What GripSky is, in plain terms.", zh: "把 GripSky 是什么，说清楚。" },
    {
      en: "These answers describe the public system as it exists now: who maintains it, what it publishes, how it should run and where participation begins.",
      zh: "这里说明当前真实存在的公共体系：由谁维护、公开什么、如何运行，以及从哪里参与。",
    },
    [
      {
        title: { en: "What is GripSky?", zh: "GripSky 是什么？" },
        body: {
          en: "GripSky was founded and is maintained by Lin Guan as a public expression of his personal system. It shares an evolving worldview, a skill catalog, research questions and release history. Reusable skills and self-hosting are still being developed; each entry states its current scope.",
          zh: "GripSky 由临观发起并维护，是其个人系统的公共表达。它公开持续修订的世界观、技能目录、研究问题与版本记录。可复用技能与自托管还在逐步展开，各条目说明当前范围。",
        },
      },
      {
        title: { en: "Who maintains GripSky?", zh: "GripSky 由谁维护？" },
        body: {
          en: "Lin Guan (临观) founded and maintains GripSky. GripSky carries the public project; his ORCID record and personal work history identify him separately as its maintainer.",
          zh: "GripSky 由临观（Lin Guan）发起并维护。组织承载公共项目；维护者仍是独立的自然人，并以 ORCID 与个人工作记录保持身份连续性。",
        },
      },
      {
        title: { en: "What problem does it address?", zh: "它解决什么问题？" },
        body: {
          en: "It explores how people understand, change and extend themselves, and how judgment can become reusable skills connected to information systems and AI—without giving up control as machines, vendors or operators change.",
          zh: "它探索人怎样认识、改变和扩展自己，以及如何把判断转化为可复用技能，将技能接入信息系统与 AI，并在机器、供应商或维护者变化时仍保有控制权。",
        },
      },
      {
        title: { en: "Why is it maintained in public?", zh: "为什么要公开维护？" },
        body: {
          en: "A personal system should remain inspectable, portable and open to correction. Public definitions and history support self-hosting, independent verification and shared improvement.",
          zh: "强大的个人系统应当可检查、可迁移，也允许被修正。公开定义与历史，使自托管、独立核验和共同改进成为可能。",
        },
      },
      {
        title: { en: "Who is it for?", zh: "它适合谁？" },
        body: {
          en: "It is for people building long-lived personal systems, contributors studying human–AI collaboration, and clients who need a skill system or external information body designed and maintained around real work.",
          zh: "它面向正在建立长期个人系统的人、研究人机协作的贡献者，以及需要围绕真实工作构造和维护技能体系或外置信息身躯的委托方。",
        },
      },
      {
        title: { en: "How do worldview, skills and the external body relate?", zh: "世界观、技能与外置身躯是什么关系？" },
        body: {
          en: "Worldview supplies revisable judgments. Skills organize knowledge and practice into callable abilities. The external body gives them memory, interfaces, computation and a place to act. Feedback can revise all three; this is not a one-way deduction or a finished organ architecture.",
          zh: "世界观提供可修订的判断；技能把知识与实践组织成可调用能力；外置身躯提供记忆、界面、计算与行动的位置。反馈可以修正三者，这不是单向推导，也不是已经定型的器官架构。",
        },
      },
      {
        title: { en: "Can I already install every skill?", zh: "现在可以安装所有技能吗？" },
        body: {
          en: "No. Some entries have public source documents, some describe internally used methods, and others are still exploratory. A public concept is not necessarily a runnable package. Consult each entry’s practice, openness and self-hosting status before using it.",
          zh: "还不可以。有些条目已有公开源文档，有些描述内部使用的方法，还有些仍是探索。概念公开不等于存在可运行包；使用前请查看各条目的实践、开放与自托管状态。",
        },
      },
      {
        title: { en: "Is GripSky open source?", zh: "GripSky 开源吗？" },
        body: {
          en: "A privacy-reviewed version of the worldview is public. Reusable skill definitions and implementations are intended for open release where privacy and security allow. Private runtime state, credentials and personal records do not travel with a public release.",
          zh: "经过脱敏的世界观已经公开；在隐私与安全允许的范围内，可复用的技能定义和实现计划逐步开放。私有运行态、凭据与个人记录不会随公开版本发布。",
        },
      },
      {
        title: { en: "What is the ideal way to run it?", zh: "理想的运行方式是什么？" },
        body: {
          en: "Keep public definitions readable, host sensitive state under the owner’s control, document dependencies and preserve export, upgrade and removal paths. Managed operation should use the same portable form, not a version tied to one provider.",
          zh: "公开定义保持可读，敏感状态由所有者控制，依赖得到记录，并保留导出、升级与移除路径。托管服务运行的也应是同一套可迁移形态，而不是只能依赖托管方的版本。",
        },
      },
      {
        title: { en: "How can I follow changes?", zh: "如何获知更新？" },
        body: {
          en: "Subscribe by email for selected topics, follow the RSS release feed, or watch the relevant GitHub repositories. Worldview, skills, compatibility and research can move at different speeds.",
          zh: "可以按主题订阅邮件、关注 RSS 版本记录，或在 GitHub 关注相关仓库。世界观、技能、兼容性与研究可以按各自节奏更新。",
        },
      },
      {
        title: { en: "How can I contribute or commission work?", zh: "如何参与或委托？" },
        body: {
          en: "Public corrections, evidence and implementations belong on GitHub. Deployment, managed operation, custom skills and continuing stewardship begin through the service contact channel with scope and privacy boundaries stated explicitly.",
          zh: "公开修正、证据与实现进入 GitHub；部署、托管运行、定制技能与长期维护，则从服务联系入口开始，并先说明范围与隐私边界。",
        },
      },
    ],
    [
      { label: { en: "Browse the skill catalog", zh: "浏览技能目录" }, href: "/skills/catalog" },
      { label: { en: "Choose update topics", zh: "选择订阅主题" }, href: "/updates/subscribe" },
    ],
  ),
  "/about": page(
    { en: "ABOUT", zh: "关于" },
    { en: "GripSky publishes the system Lin Guan is building.", zh: "GripSky 公开临观正在建立的体系。" },
    {
      en: "Worldview, skills, research and services meet here as a public expression of Lin Guan’s work. His personal site keeps his individual record and earlier projects.",
      zh: "世界观、技能发布、研究和服务在这里汇集，形成个人系统的公共表达。临观个人站保留个人记录和更早的项目。",
    },
    [
      {
        title: { en: "Current stage", zh: "当前阶段" },
        body: {
          en: "The worldview repository is public. The skill catalog is being separated from private runtime state. Managed services remain selective.",
          zh: "worldview 仓库已经公开；技能目录正在与私有运行态分离；托管服务仍然选择性承接。",
        },
      },
      {
        title: { en: "Public anchor", zh: "组织站与个人站" },
        body: {
          en: "gripsky.org is GripSky’s public site. linguan.online remains Lin Guan’s personal site.",
          zh: "gripsky.org 是组织入口，linguan.online 继续作为发起人个人站。",
        },
      },
      {
        title: { en: "Maintainer identity", zh: "维护者身份" },
        body: {
          en: "Lin Guan and GripSky have distinct public identities. Lin Guan’s ORCID record links this site, his personal GitHub account and the GripSky organization as persistent identity references.",
          zh: "临观与 GripSky 是不同的公共实体。维护者的 ORCID 记录关联组织官网、个人 GitHub 与 GripSky 组织，提供持续的身份引用。",
        },
      },
    ],
    [{ label: { en: "Read the FAQ", zh: "阅读常见问题" }, href: "/faq" }],
  ),
  "/contact": page(
    { en: "06 / UPDATES & CONTACT", zh: "06 / 更新与联系" },
    { en: "Updates and contact.", zh: "更新与联系。" },
    {
      en: "Read release history, subscribe to selected topics, contribute in public or contact GripSky directly about research and commissioned work.",
      zh: "查看版本记录、订阅所需主题、参与公开协作，或就研究与委托工作直接联系 GripSky。",
    },
    [
      {
        title: { en: "Public contribution", zh: "公共贡献" },
        body: {
          en: "Open an issue with the affected document, evidence and proposed change.",
          zh: "在 GitHub Issue 中说明受影响文档、证据和建议修改。",
        },
      },
      {
        title: { en: "Service request", zh: "服务需求" },
        body: {
          en: "State the system to be built or maintained, current materials, desired delivery and privacy constraints.",
          zh: "说明需要构造或维护的体系、已有材料、希望交付的结果和隐私约束。",
        },
      },
      {
        title: { en: "Direct contact", zh: "直接联系" },
        body: {
          en: "For service and collaboration enquiries, email contact@gripsky.org. WeChat ID: gripsky. Additional public contact channels will be listed here.",
          zh: "服务委托与协作咨询可发送至 contact@gripsky.org；微信 ID：gripsky。后续新增的公开联系渠道会持续在本页汇总。",
        },
      },
    ],
  ),
  "/legal/business": page(
    { en: "LEGAL / BUSINESS", zh: "法律 / 经营主体" },
    { en: "The operating entity behind commissioned work.", zh: "承接委托工作的经营主体。" },
    {
      en: "Original licence and approval documents remain controlled records. This page publishes only the fields needed to identify the operator and understand its service scope.",
      zh: "营业执照和核准文件原件仍作为受控记录保存。这里只公开识别经营主体和理解服务范围所需的信息。",
    },
    [
      {
        title: { en: "Published scope", zh: "公开范围" },
        body: {
          en: "Every public service description must remain within the confirmed registered scope. Details are updated here after review.",
          zh: "网站上的服务表述必须落在已经核对的登记经营范围内；确认后的公开字段会在这里更新。",
        },
      },
    ],
    [],
    { en: "Public fields under review", zh: "公开字段核对中" },
  ),
  "/legal/privacy": page(
    { en: "LEGAL / PRIVACY", zh: "法律 / 隐私" },
    { en: "The site asks only for what it needs to work.", zh: "网站只索取功能真正需要的数据。" },
    {
      en: "Update subscriptions require an email, language and selected topics. Service inquiries may include a project brief. Sensitive materials are not requested through the public site.",
      zh: "更新订阅需要邮箱、语言和所选主题；服务联系可能包含项目简述。公开网站不要求提交敏感原件。",
    },
    [
      {
        title: { en: "Subscription data", zh: "订阅数据" },
        body: {
          en: "Used to verify the address, send selected release notices and process unsubscribe requests.",
          zh: "用于验证邮箱、发送所选版本通知和处理退订。",
        },
      },
      {
        title: { en: "No credential collection", zh: "不收集凭据" },
        body: {
          en: "Do not send passwords, private keys, identity documents or infrastructure credentials through public forms.",
          zh: "不要通过公开表单发送密码、私钥、身份证件或基础设施凭据。",
        },
      },
    ],
  ),
  "/legal/terms": page(
    { en: "LEGAL / TERMS", zh: "法律 / 条款" },
    { en: "Public source and paid work follow separate agreements.", zh: "公开源与付费工作，各有约定。" },
    {
      en: "Public source is governed by the licence attached to each repository or package. Paid work is governed by a separate confirmed scope and delivery agreement.",
      zh: "公开源按各仓库或技能包附带的许可证使用；付费工作按另行确认的范围与交付约定执行。",
    },
    [
      {
        title: { en: "No implied service", zh: "开源不自动产生服务义务" },
        body: {
          en: "Access to public source does not create an obligation for GripSky to deploy, operate or support a user’s instance.",
          zh: "访问公开源不自动要求 GripSky 为使用者安装、运行或提供支持。",
        },
      },
    ],
  ),
};
