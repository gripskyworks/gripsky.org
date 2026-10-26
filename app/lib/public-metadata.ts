import type { Locale, LocalizedText } from "./site-data";

// Search titles name the page; visible editorial headings retain their voice.
// Dates belong to future per-document records, not build or deploy timestamps.
export const publicPageNames: Record<string, LocalizedText> = {
  "/worldview": { en: "Worldview", zh: "世界观" },
  "/worldview/map": { en: "Worldview system map", zh: "世界观体系地图" },
  "/worldview/principles": { en: "Worldview principles", zh: "世界观原则" },
  "/worldview/releases": { en: "Worldview releases", zh: "世界观版本" },
  "/worldview/changelog": { en: "Worldview changelog", zh: "世界观变更记录" },
  "/worldview/source": { en: "Public worldview source", zh: "世界观公开源文件" },
  "/skills": { en: "Skill system", zh: "技能体系" },
  "/skills/catalog": { en: "Skill catalog and availability", zh: "技能目录与开放状态" },
  "/skills/meta": { en: "Meta-skills", zh: "元技能" },
  "/skills/embodied": { en: "Embodied skills", zh: "生理技能" },
  "/skills/work": { en: "Field skills", zh: "领域与工作技能" },
  "/body": { en: "External information body", zh: "外置信息身躯" },
  "/body/architecture": { en: "External-body architecture", zh: "外置身躯结构" },
  "/body/runtime": { en: "External-body runtime", zh: "外置身躯运行方式" },
  "/body/self-host": { en: "Self-hosting and current scope", zh: "自托管与当前范围" },
  "/body/examples": { en: "External-body examples", zh: "外置身躯实例" },
  "/research": { en: "Research and open questions", zh: "研究与开放问题" },
  "/research/codetaker": { en: "Codetaker · Vibe 把妹王 game project", zh: "Codetaker · Vibe 把妹王游戏项目" },
  "/research/questions": { en: "Research questions", zh: "研究问题" },
  "/research/roadmap": { en: "Research roadmap", zh: "研究路线图" },
  "/research/proposals": { en: "Research proposals", zh: "研究提案" },
  "/research/contribute": { en: "Research contributions", zh: "参与研究与贡献" },
  "/updates/releases": { en: "Releases", zh: "版本发布" },
  "/updates/changelog": { en: "Changelog", zh: "变更记录" },
  "/updates/subscribe": { en: "Subscribe or unsubscribe from updates", zh: "订阅与退订更新" },
  "/services": { en: "Services and commissioned work", zh: "服务与委托" },
  "/services/deployment": { en: "Installation and deployment services", zh: "安装与部署服务" },
  "/services/managed-hosting": { en: "Managed operation services", zh: "托管运行服务" },
  "/services/custom-skills": { en: "Custom skill services", zh: "定制技能服务" },
  "/services/system-design": { en: "Personal system design", zh: "个人体系构造" },
  "/services/body-maintenance": { en: "External-body maintenance", zh: "外置身躯维护" },
  "/services/dedicated": { en: "Dedicated stewardship", zh: "专属共建" },
  "/faq": { en: "Frequently asked questions", zh: "常见问题" },
  "/about": { en: "About GripSky and its maintainer", zh: "关于 GripSky 与维护者" },
  "/contact": { en: "Updates and contact", zh: "更新与联系" },
  "/legal/business": { en: "Business identity", zh: "经营主体" },
  "/legal/privacy": { en: "Privacy", zh: "隐私说明" },
  "/legal/terms": { en: "Terms and agreements", zh: "条款与约定" },
};

export const homeDescription: LocalizedText = {
  en: "GripSky explores how people understand, reshape and extend themselves, drawing on Lin Guan’s worldview and practice with skills and information bodies.",
  zh: "GripSky 从世界观出发，研究人怎样认识、改变和扩展自己。临观把这些问题带进技能与信息身躯的探索，在个人实践中修订理解。",
};

export function publicPageName(path: string, locale: Locale, fallback: string) {
  return publicPageNames[path]?.[locale] ?? fallback;
}
