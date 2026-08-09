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
      { label: { en: "Source", zh: "开放源文件" }, href: "/worldview/source" },
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
    label: { en: "Updates", zh: "更新" },
    href: "/updates",
    items: [
      { label: { en: "Releases", zh: "版本发布" }, href: "/updates/releases" },
      { label: { en: "Changelog", zh: "变更记录" }, href: "/updates/changelog" },
      { label: { en: "Subscribe", zh: "订阅更新" }, href: "/updates/subscribe" },
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
};

export const skills: SkillDefinition[] = [
  {
    slug: "skill-conceptualization",
    number: "S-001",
    kind: { en: "Generative grammar", zh: "技能母体" },
    name: { en: "Skill conceptualization", zh: "技能概念化" },
    summary: {
      en: "A method for turning scattered knowledge and repeated practice into callable, testable and revisable abilities.",
      zh: "把散乱知识和反复实践整理成可调用、可验证、可修正能力的方法。",
    },
    maturity: { en: "Public concept · evolving", zh: "公开概念 · 持续演化" },
    openness: { en: "Public in worldview", zh: "已在 worldview 公开" },
    selfHost: { en: "Documentation first", zh: "文档优先" },
    source: "public",
  },
  {
    slug: "information-inheritance",
    number: "M-001",
    kind: { en: "Meta-skill", zh: "元技能" },
    name: { en: "Information inheritance", zh: "信息遗传与器官表达" },
    summary: {
      en: "Determines where information belongs, what may cross a boundary, and how reusable rules return to the shared system.",
      zh: "判断信息应归属哪里、哪些内容可以跨越边界，以及可复用规则如何回写体系。",
    },
    maturity: { en: "H3 · verified internally", zh: "H3 · 已完成内部验证" },
    openness: { en: "Public definition planned", zh: "计划公开定义与通用规则" },
    selfHost: { en: "Package in preparation", zh: "自托管包准备中" },
    source: "planned",
  },
  {
    slug: "body-calibration",
    number: "E-001",
    kind: { en: "Embodied skill", zh: "生理技能" },
    name: { en: "Body calibration", zh: "定体术" },
    summary: {
      en: "A staged method for sensing, defining and correcting the state of the natural body and its information extensions.",
      zh: "分阶段感知、定义并修正自然身体与信息延展状态的方法。",
    },
    maturity: { en: "Public research sample", zh: "公开研究样本" },
    openness: { en: "Public in worldview", zh: "已在 worldview 公开" },
    selfHost: { en: "Manual protocol", zh: "手动协议" },
    source: "public",
  },
  {
    slug: "browser-interface",
    number: "E-002",
    kind: { en: "Embodied skill", zh: "生理技能" },
    name: { en: "Browser and interface operation", zh: "浏览器与界面操作" },
    summary: {
      en: "Reusable browser perception and interface-operation procedures with explicit session and privacy boundaries.",
      zh: "带有会话边界和隐私边界的浏览器感知与界面操作流程。",
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
      en: "Compares, merges and restores material across nodes without assuming that every copy has equal authority.",
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
      en: "Generates several viable paths under uncertainty, compares their costs and closes on an executable next action.",
      zh: "在高不确定和受约束的情况下生成多条出路，比较代价并收敛到可执行动作。",
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
      en: "GripSky keeps worldview as working source: judgments with references, revision history and consequences. It gives the skill system a reason to preserve some things, change others and refuse the rest.",
      zh: "在 GripSky，世界观是仍在工作的源文件：判断有来源，变化有记录，也会继续产生后果。技能保留什么、改变什么、拒绝什么，都从这里获得理由。",
    },
    [
      {
        title: { en: "Current chain", zh: "当前推导链" },
        body: {
          en: "Systems theory → worldview → view of development → view of life → values → skills and daily operation.",
          zh: "系统论 → 世界观 → 发展观 → 人生观 → 价值观 → 技能与日常运行。",
        },
      },
      {
        title: { en: "Public form", zh: "公开方式" },
        body: {
          en: "The desensitized worldview repository is the current public source. Every public page should point back to a version, document or open question.",
          zh: "经过脱敏的 worldview 仓库是当前公开源端。网站上的判断应尽量指回版本、文档或尚未解决的问题。",
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
      en: "The map records dependency, not a one-way claim of deduction. Practice may revise the skill, the life strategy and eventually the upstream model.",
      zh: "这张图记录依赖关系，不宣称一切只能单向推出。实践可以修正技能、人生策略，并继续向上反馈到原有模型。",
    },
    [
      {
        title: { en: "Upstream", zh: "上游" },
        body: {
          en: "Systems theory provides the language of boundary, structure, function, feedback and environment.",
          zh: "系统论提供边界、结构、功能、反馈和环境等基础语言。",
        },
      },
      {
        title: { en: "Subject", zh: "主体" },
        body: {
          en: "Development, life and value judgments define what kind of subject is being built and what constraints it accepts.",
          zh: "发展观、人生观与价值判断定义要形成什么样的主体，以及这个主体接受哪些约束。",
        },
      },
      {
        title: { en: "Execution", zh: "执行" },
        body: {
          en: "Skills turn judgment into reusable procedures. Runtime state supplies the local facts without becoming part of the public definition.",
          zh: "技能把判断转为可复用流程；运行态提供现实参数，但不进入公开技能定义。",
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
      zh: "这些原则是带版本的工作判断。更强证据或反复实践出现后，可以修正。",
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
          zh: "可用的体系应当让证据、推断和希望到达的方向保持可区分。",
        },
      },
      {
        title: { en: "Preserve the upper whole", zh: "不以局部损耗上位整体" },
        body: {
          en: "Local continuation or expansion is not justified when it destroys the larger system that makes it possible.",
          zh: "局部的存续和扩张，不能以破坏使其成立的上位整体为代价。",
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
          en: "The current repository exposes the systems-theory base, the four-view chain, subject-system work and public GripSky history.",
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
      en: "The changelog will record changes that alter definitions, dependencies or the path from worldview to skill.",
      zh: "变更记录用于说明定义、依赖或世界观到技能的推导路径发生了什么变化。",
    },
    [
      {
        title: { en: "Current work", zh: "当前工作" },
        body: {
          en: "The public system is moving from a document archive toward a versioned source that can drive skill releases and update notices.",
          zh: "公开体系正在从文档档案转向可以驱动技能版本与更新通知的版本源。",
        },
      },
    ],
  ),
  "/worldview/source": page(
    { en: "WORLDVIEW / SOURCE", zh: "世界观 / 开放源文件" },
    { en: "The source is open.", zh: "源文件就在这里。" },
    {
      en: "The public repository contains the desensitized worldview and the history of its development. Private parameters, credentials and operating state are excluded.",
      zh: "公开仓库保存经过脱敏的世界观及其演化历史。私人参数、凭据和运行态不在其中。",
    },
    [
      {
        title: { en: "Repository", zh: "公开仓库" },
        body: {
          en: "github.com/weakdreamer/worldview is the current public source. Its Git history records public changes.",
          zh: "github.com/weakdreamer/worldview 是当前公开源端，Git 历史记录公开变更。",
        },
      },
      {
        title: { en: "Boundary", zh: "边界" },
        body: {
          en: "The public source contains transferable concepts and evidence. Device state, personal secrets and organization-specific work remain at their authoritative endpoints.",
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
      en: "A skill carries a judgment into repeated action. It names what enters, what happens, where the limits are, how the result is checked and where revision begins.",
      zh: "技能把判断带进反复发生的行动：什么进入、如何处理、边界在哪里、结果怎样验收、下一次从哪里修正，都应该说得清楚。",
    },
    [
      {
        title: { en: "Generative grammar", zh: "技能母体" },
        body: {
          en: "Skill conceptualization explains why a skill should exist and how a first version can be constructed and tested.",
          zh: "技能概念化说明技能为何成立，以及第一版如何被构造和验证。",
        },
      },
      {
        title: { en: "Operational branches", zh: "运行分支" },
        body: {
          en: "Meta-skills form and constrain other skills. Embodied skills act on computers, networks and the physical world. Field skills solve recurring classes of problems.",
          zh: "元技能负责构造和约束其它技能；生理技能作用于计算机、网络和现实世界；领域技能解决反复出现的一类问题。",
        },
      },
    ],
    [{ label: { en: "Open the catalog", zh: "打开技能目录" }, href: "/skills/catalog" }],
  ),
  "/skills/catalog": page(
    { en: "SKILLS / CATALOG", zh: "技能 / 目录" },
    { en: "What exists, what is open and what comes next.", zh: "已经存在什么，开放到哪里，接下来做什么。" },
    {
      en: "The catalog distinguishes public source, planned public definitions and private runtime state. It does not present internal availability as a public release.",
      zh: "目录区分已公开源文件、计划公开的通用定义和私有运行态，不把内部可运行状态冒充为公开发布。",
    },
    [],
  ),
  "/skills/meta": page(
    { en: "SKILLS / META", zh: "技能 / 元技能" },
    { en: "Skills that keep other skills coherent.", zh: "让其他技能保持清楚、可用和可修正。" },
    {
      en: "Meta-skills select, combine, constrain, verify and evolve other abilities. They do not replace the embodied skill that performs the actual operation.",
      zh: "元技能负责选择、组合、约束、校验和进化其它能力，但不替代直接执行现实动作的生理技能。",
    },
    [
      {
        title: { en: "Current public direction", zh: "当前公开方向" },
        body: {
          en: "Information inheritance, skill ownership and version expression are the first candidates for public release.",
          zh: "信息遗传、技能归属与版本表达是第一批公开候选。",
        },
      },
    ],
  ),
  "/skills/embodied": page(
    { en: "SKILLS / EMBODIED", zh: "技能 / 生理技能" },
    { en: "Where the system touches reality.", zh: "体系在这里接触现实。" },
    {
      en: "Embodied skills operate browsers, files, networks, devices and real services. Public releases remove credentials, device paths and current operating parameters.",
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
    ],
  ),
  "/skills/work": page(
    { en: "SKILLS / FIELD", zh: "技能 / 领域技能" },
    { en: "Keep the method. Leave the workplace behind.", zh: "留下方法，不携带工作现场。" },
    {
      en: "Field skills address a class of problems across organizations. Work-specific accounts, people, approvals and internal data are not part of the public skill.",
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
      en: "Memory, protocols, skills, interfaces, infrastructure and protection form an external information body. Tools may change; the body keeps its history, its boundaries and its owner.",
      zh: "记忆、协议、技能、界面、基础设施与保护共同构成外置信息身躯。工具可以更换，它仍然保留自己的历史、边界和主人。",
    },
    [
      {
        title: { en: "Seven layers", zh: "七层结构" },
        body: {
          en: "Sovereignty, protocol, memory, organs, surface, power and immunity separate what the subject controls from how each local tool happens to implement it.",
          zh: "主权层、协议层、记忆层、器官层、表皮层、供能层和免疫层，把主体控制权与局部工具实现区分开。",
        },
      },
      {
        title: { en: "Portable by design", zh: "以可迁移为前提" },
        body: {
          en: "A useful body can move between tools and hosts without losing its meaning, history or authority boundaries.",
          zh: "可用的信息身躯应能在工具和宿主之间迁移，而不丢失意义、历史和权威边界。",
        },
      },
    ],
    [{ label: { en: "Read the self-hosting direction", zh: "查看自托管方向" }, href: "/body/self-host" }],
  ),
  "/body/architecture": page(
    { en: "EXTERNAL BODY / ARCHITECTURE", zh: "外置身躯 / 总体结构" },
    { en: "Seven layers. One centre of authority.", zh: "七层结构，共用一个裁决中心。" },
    {
      en: "The architecture prevents one tool, vendor or automation from silently becoming the owner of the whole system.",
      zh: "这套结构避免某个工具、厂商或自动化流程在不知不觉中成为整个体系的主人。",
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
          en: "Memory preserves source and history. Skills act as organs that produce repeatable behavior.",
          zh: "记忆层保存来源和历史；技能作为器官产生可重复行为。",
        },
      },
      {
        title: { en: "Surface, power and immunity", zh: "表皮、供能与免疫" },
        body: {
          en: "Interfaces expose the system, infrastructure keeps it running, and boundaries prevent leakage and authority drift.",
          zh: "界面让体系可被使用，基础设施维持运行，边界防止泄露与主权漂移。",
        },
      },
    ],
  ),
  "/body/runtime": page(
    { en: "EXTERNAL BODY / RUNTIME", zh: "外置身躯 / 运行方式" },
    { en: "The definition travels. The operating state stays local.", zh: "定义可以迁移，运行态留在现场。" },
    {
      en: "The public skill describes stable behavior. Each device and deployment supplies its own paths, credentials, models and current measurements.",
      zh: "公开技能描述稳定行为；每台设备和每个部署实例提供自己的路径、凭据、模型与当前测量。",
    },
    [
      {
        title: { en: "Registered nodes", zh: "已登记节点" },
        body: {
          en: "A runtime first identifies its device and capabilities. It does not borrow another node’s credentials or assumptions.",
          zh: "运行前先识别设备和能力，不借用其它节点的凭据与假设。",
        },
      },
      {
        title: { en: "Removable state", zh: "可拆除运行态" },
        body: {
          en: "Current state can be removed or replaced without destroying the public definition or the upstream worldview.",
          zh: "当前运行态可以被移除或替换，而不破坏公开技能定义和上游世界观。",
        },
      },
    ],
  ),
  "/body/self-host": page(
    { en: "EXTERNAL BODY / SELF-HOST", zh: "外置身躯 / 自托管" },
    { en: "Keep the system close enough to own it.", zh: "把体系放在自己仍能掌握的地方。" },
    {
      en: "Self-hosting is a design requirement, not an enterprise add-on. Public packages will include the definition, dependencies, local-state boundary, installation path and removal impact.",
      zh: "自托管是设计要求，不是企业附加功能。公开包将说明定义、依赖、运行态边界、安装路径和移除影响。",
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
      en: "A skill may run as documents and scripts on one node, a managed service on another, and a human–AI operating procedure on a third.",
      zh: "同一技能可以在一个节点上表现为文档与脚本，在另一个节点上成为托管服务，也可以表现为一套人机协作流程。",
    },
    [
      {
        title: { en: "Local-first", zh: "本地优先" },
        body: {
          en: "Definitions, memory and sensitive state remain on devices controlled by the subject.",
          zh: "定义、记忆和敏感运行态保存在主体控制的设备中。",
        },
      },
      {
        title: { en: "Managed", zh: "托管运行" },
        body: {
          en: "GripSky operates selected public skills while the user retains export and migration paths.",
          zh: "GripSky 运行选定的公共技能，同时保留用户导出和迁移路径。",
        },
      },
    ],
  ),
  "/research": page(
    { en: "04 / RESEARCH", zh: "04 / 研究与共建" },
    { en: "Open work, while it is still open.", zh: "问题还没有答案，就先把它公开。" },
    {
      en: "Unresolved questions belong in view. GripSky records the evidence still needed, proposals under discussion and work that others can pick up on GitHub.",
      zh: "尚未解决的问题也应该被看见。这里记录仍然缺少的证据、正在讨论的提案，以及可以从 GitHub 接手的工作。",
    },
    [
      {
        title: { en: "Current line", zh: "当前主线" },
        body: {
          en: "How can an individual use AI, durable documents and open tools to build a system that remains understandable, portable and under personal authority?",
          zh: "个体如何借助 AI、长期文档与开放工具，建立一个可理解、可迁移且仍由自己掌握的系统？",
        },
      },
      {
        title: { en: "Contribution", zh: "贡献方式" },
        body: {
          en: "Corrections, source review, implementation experiments and documentation are all valid contributions.",
          zh: "概念修正、来源核验、实现实验和文档整理都可以成为贡献。",
        },
      },
    ],
    [{ label: { en: "How to contribute", zh: "如何参与贡献" }, href: "/research/contribute" }],
  ),
  "/research/questions": page(
    { en: "RESEARCH / QUESTIONS", zh: "研究 / 当前问题" },
    { en: "Questions with enough weight to change the system.", zh: "这些问题，仍然足以改变整个体系。" },
    {
      en: "The project does not hide uncertainty behind a product surface. These questions remain open and affect the next public releases.",
      zh: "项目不把不确定性藏在产品界面后面。以下问题仍然开放，并会影响下一批公开版本。",
    },
    [
      {
        title: { en: "Skill portability", zh: "技能可迁移性" },
        body: {
          en: "What is the smallest vendor-neutral form that preserves a skill’s meaning, checks and revision history?",
          zh: "什么是最小的厂商中立表达，可以保留技能的意义、验收和修正历史？",
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
    ],
  ),
  "/research/roadmap": page(
    { en: "RESEARCH / ROADMAP", zh: "研究 / 公开路线图" },
    { en: "The order in which the open system can become real.", zh: "开放体系按什么顺序成为现实。" },
    {
      en: "The roadmap follows dependency order: public definitions first, then self-hostable packages, then managed services built from the same open base.",
      zh: "路线图按依赖推进：先公开定义，再发布可自托管技能包，最后在同一开放基础上提供托管服务。",
    },
    [
      {
        title: { en: "01 · Public catalog", zh: "01 · 公开目录" },
        body: {
          en: "Give every skill a stable name, boundary, maturity state and source relationship.",
          zh: "为每项技能确定稳定名称、边界、成熟度和来源关系。",
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
      en: "Proposals will describe the problem, evidence, affected layers, compatibility cost and the decision still required.",
      zh: "提案将说明问题、证据、受影响层、兼容成本以及仍需作出的裁决。",
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
    { en: "Bring evidence. Leave the work clearer.", zh: "带着证据来，让工作离开时更清楚。" },
    {
      en: "The current public collaboration surface is the worldview repository. Contributions should preserve source, public boundaries and the difference between a model and a fact.",
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
  "/updates": page(
    { en: "05 / UPDATES", zh: "05 / 更新中心" },
    { en: "Worldview and skills, version by version.", zh: "世界观和技能，都按版本继续。" },
    {
      en: "Every release says what changed and where it belongs. Subscribe only to the parts of the system you want to follow.",
      zh: "每次发布都说明改了什么、影响哪里。只订阅自己想继续跟踪的部分即可。",
    },
    [
      {
        title: { en: "Versioned subjects", zh: "可订阅主题" },
        body: {
          en: "Worldview releases, skill packages, compatibility changes, research calls and managed-service notices are kept separate.",
          zh: "世界观版本、技能包、兼容性变化、研究协作和托管服务通知相互分开。",
        },
      },
    ],
    [{ label: { en: "Choose update topics", zh: "选择更新主题" }, href: "/updates/subscribe" }],
  ),
  "/updates/releases": page(
    { en: "UPDATES / RELEASES", zh: "更新 / 版本发布" },
    { en: "Dates the system can point back to.", zh: "让体系能够回望的日期。" },
    {
      en: "This feed combines public worldview, skill and interface releases. Each release identifies its scope and date.",
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
          en: "The organization site now treats open worldview and skills as the main product. Services have moved to the outer delivery layer.",
          zh: "组织站已经把开放世界观与技能体系作为主体，服务移到最外层交付位置。",
        },
      },
    ],
  ),
  "/updates/subscribe": page(
    { en: "UPDATES / SUBSCRIBE", zh: "更新 / 订阅" },
    { en: "Let the right releases reach you.", zh: "只让需要的版本抵达。" },
    {
      en: "Enter an email, choose topics and verify the address. The subscription is free. It does not create a paid service plan.",
      zh: "填写邮箱、选择主题并验证地址即可完成免费订阅。这不会创建付费服务方案。",
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
    { en: "06 / SERVICES", zh: "06 / 服务" },
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
    { en: "GripSky keeps the system awake and recoverable.", zh: "由 GripSky 让体系持续运行，也随时能够恢复。" },
    {
      en: "Managed operation covers updates, backups, monitoring and incident handling. Users retain documented export and migration paths.",
      zh: "托管运行包括升级、备份、监测和故障处理，同时保留清楚的导出与迁移路径。",
    },
    [
      {
        title: { en: "Not a lock-in layer", zh: "不以锁定为前提" },
        body: {
          en: "The managed version is a maintained delivery form of the public base, not a replacement for self-hosting.",
          zh: "托管版是公共基础的维护型交付方式，不取代自托管版本。",
        },
      },
    ],
  ),
  "/services/custom-skills": page(
    { en: "SERVICES / CUSTOM SKILLS", zh: "服务 / 定制技能" },
    { en: "Turn recurring work into an ability that can return.", zh: "把反复发生的工作，变成可以再次调用的能力。" },
    {
      en: "The work begins with inputs, outputs, evidence, tools, failure conditions and the client’s final authority. It ends with a skill that can be called again.",
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
    { en: "A system grown from the client’s own judgments.", zh: "从委托方自己的判断里，长出属于他的体系。" },
    {
      en: "GripSky does not copy Lin Guan’s personal worldview into another person. It helps identify the client’s goals, constraints and repeated work, then builds a skill system that belongs to them.",
      zh: "GripSky 不把临观的个人世界观复制给别人，而是识别委托方自己的目标、约束和反复工作，再构造属于他的技能体系。",
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
    { en: "Long work, with judgment kept in the loop.", zh: "由临观持续参与判断的长期共建。" },
    {
      en: "Dedicated work draws on the existing natural and external skill system when relevant, but every engagement still has explicit scope, privacy boundaries and capacity limits.",
      zh: "专属共建可以按需调用临观已有的自然技能与外置技能体系，但每次合作仍需明确范围、隐私边界和承载上限。",
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
          en: "GripSky is the public body of a personal system maintained by Lin Guan. It publishes an evolving worldview, the skills derived from it, research questions, release history and self-hosting paths.",
          zh: "GripSky 是由临观维护的一套个人系统的公共身躯。它公开仍在演化的世界观、由此生长的技能、研究问题、版本记录与自托管路径。",
        },
      },
      {
        title: { en: "Who maintains GripSky?", zh: "GripSky 由谁维护？" },
        body: {
          en: "Lin Guan (临观) founded and maintains GripSky. The organization carries the public project; the maintainer remains a separate person with an ORCID record and personal work history.",
          zh: "GripSky 由临观（Lin Guan）发起并维护。组织承载公共项目；维护者仍是独立的自然人，并以 ORCID 与个人工作记录保持身份连续性。",
        },
      },
      {
        title: { en: "What problem does it address?", zh: "它解决什么问题？" },
        body: {
          en: "It explores how one person can turn judgment into reusable skills, connect those skills to information systems and AI, and keep control when machines, vendors or operators change.",
          zh: "它探索一个人如何把判断转化为可复用技能，把技能接入信息系统与 AI，并在机器、供应商或维护者变化时仍保有控制权。",
        },
      },
      {
        title: { en: "Why is it maintained in public?", zh: "为什么要公开维护？" },
        body: {
          en: "A powerful personal system should remain inspectable, portable and open to correction. Public definitions and history make self-hosting, independent verification and shared improvement possible.",
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
          en: "Worldview supplies revisable judgments. Skills turn those judgments and repeated practice into callable abilities. The external body gives those abilities memory, interfaces, computation and a place to operate in the world.",
          zh: "世界观提供可修订的判断；技能把判断与反复实践整理成可调用能力；外置身躯则为能力提供记忆、界面、计算和进入现实的运行位置。",
        },
      },
      {
        title: { en: "Is GripSky open source?", zh: "GripSky 开源吗？" },
        body: {
          en: "The desensitized worldview is public, and reusable skill definitions and implementations are intended to be released openly where privacy and security allow. Private runtime state, credentials and personal records do not travel with a public release.",
          zh: "经过脱敏的世界观已经公开；在隐私与安全允许的范围内，可复用的技能定义和实现会逐步开放。私有运行态、凭据与个人记录不会随公开版本发布。",
        },
      },
      {
        title: { en: "What is the ideal way to run it?", zh: "理想的运行方式是什么？" },
        body: {
          en: "Keep public definitions readable, host sensitive state under the owner’s control, document dependencies and preserve export, upgrade and removal paths. Managed service should operate the same portable form, not create a lock-in-only edition.",
          zh: "公开定义保持可读，敏感状态由所有者控制，依赖得到记录，并保留导出、升级与移除路径。托管服务运行的也应是同一套可迁移形态，而不是只能被锁定使用的特供版本。",
        },
      },
      {
        title: { en: "How can I follow changes?", zh: "如何获知更新？" },
        body: {
          en: "Subscribe by email for selected topics, follow the RSS release feed, or watch the relevant GitHub repositories. Worldview, skills, compatibility and research can move at different speeds.",
          zh: "可以按主题订阅邮件、关注 RSS 版本流，或在 GitHub 观察相关仓库。世界观、技能、兼容性与研究可以按各自节奏更新。",
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
      en: "Worldview, skill releases, research and services meet here as one public body. Lin Guan’s personal site keeps the individual record and the projects that came before it.",
      zh: "世界观、技能发布、研究和服务在这里组成同一具公共身躯。临观个人站继续保留个人记录和更早的项目。",
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
        title: { en: "Public anchor", zh: "公共锚点" },
        body: {
          en: "gripsky.org is the organization entrance. linguan.online remains the founder’s personal site.",
          zh: "gripsky.org 是组织入口，linguan.online 继续作为发起人个人站。",
        },
      },
      {
        title: { en: "Maintainer identity", zh: "维护者身份" },
        body: {
          en: "Lin Guan and GripSky remain distinct public entities. The maintainer’s ORCID record links the organization site, personal GitHub account and GripSky organization as persistent identity references.",
          zh: "临观与 GripSky 保持为两个不同的公共实体。维护者的 ORCID 记录把组织官网、个人 GitHub 与 GripSky 组织作为持续身份引用连接起来。",
        },
      },
    ],
    [{ label: { en: "Read the FAQ", zh: "阅读常见问题" }, href: "/faq" }],
  ),
  "/contact": page(
    { en: "CONTACT", zh: "联系" },
    { en: "Public work and commissioned work meet at different doors.", zh: "公开协作与付费委托，各自有入口。" },
    {
      en: "Use GitHub for public corrections and contributions. Use the service channel when you need deployment, customization or continuing maintenance.",
      zh: "公开修正和贡献走 GitHub；需要部署、定制或持续维护时，使用服务联系渠道。",
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
          en: "For service and collaboration enquiries, write to contact@gripsky.org. WeChat ID: gripsky. The contact page remains the current public directory as more channels are added.",
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
    { en: "Open source and paid responsibility follow different agreements.", zh: "开放源与付费责任，遵循各自的约定。" },
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
