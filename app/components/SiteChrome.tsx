"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Locale, localPath, navGroups, tx } from "../lib/site-data";

type ThemeId = "paper" | "orbit" | "retro" | "liquid" | "tide";

const themeOptions: Array<{
  id: ThemeId;
  label: { en: string; zh: string };
  note: { en: string; zh: string };
}> = [
  {
    id: "paper",
    label: { en: "Light", zh: "亮色" },
    note: { en: "Warm paper and ink", zh: "暖纸、墨色与青绿" },
  },
  {
    id: "orbit",
    label: { en: "Dark orbit", zh: "暗轨" },
    note: { en: "Sharp rails and signal light", zh: "锋利轨道与信号光" },
  },
  {
    id: "retro",
    label: { en: "Retro web", zh: "古早网页" },
    note: { en: "System blue and hard edges", zh: "系统蓝、硬边框与像素网点" },
  },
  {
    id: "liquid",
    label: { en: "Liquid glass", zh: "液态玻璃" },
    note: { en: "Refraction and flowing layers", zh: "折射、透光与流动层" },
  },
  {
    id: "tide",
    label: { en: "Ink tide", zh: "墨青" },
    note: { en: "Quiet teal and warm signals", zh: "低饱和墨青与暖色信号" },
  },
];

function getLocale(pathname: string): Locale {
  return pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";
}

function equivalentLanguagePath(pathname: string, locale: Locale) {
  if (locale === "zh") {
    const path = pathname.replace(/^\/zh/, "");
    return path || "/";
  }
  return pathname === "/" ? "/zh" : `/zh${pathname}`;
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("paper");
  const currentTheme = themeOptions.find((option) => option.id === theme) ?? themeOptions[0];

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  useEffect(() => {
    const stored = window.localStorage.getItem("gripsky-theme-v2");
    const matched = themeOptions.find((option) => option.id === stored);
    if (!matched) return;
    const frame = window.requestAnimationFrame(() => setTheme(matched.id));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let frame = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const interactiveSelector = [
      ".relation-grid article",
      ".skill-row",
      ".catalog-grid > a",
      ".route-card-grid > a",
      ".release-list article",
      ".release-index article",
      ".subscription-form",
      ".contact-form",
      ".external-source-card",
    ].join(",");

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduceMotion.matches) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const shell = document.querySelector<HTMLElement>(".site-shell");
        if (!shell) return;

        const normalizedX = event.clientX / window.innerWidth - 0.5;
        const normalizedY = event.clientY / window.innerHeight - 0.5;
        shell.style.setProperty("--pointer-x", `${event.clientX}px`);
        shell.style.setProperty("--pointer-y", `${event.clientY}px`);
        shell.style.setProperty("--motion-x", `${normalizedX * 14}px`);
        shell.style.setProperty("--motion-y", `${normalizedY * 12}px`);
        shell.style.setProperty("--motion-x-reverse", `${normalizedX * -9}px`);
        shell.style.setProperty("--motion-y-reverse", `${normalizedY * -7}px`);

        const target = event.target instanceof Element
          ? event.target.closest<HTMLElement>(interactiveSelector)
          : null;
        if (target) {
          const rect = target.getBoundingClientRect();
          target.style.setProperty("--surface-x", `${event.clientX - rect.left}px`);
          target.style.setProperty("--surface-y", `${event.clientY - rect.top}px`);
        }
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setThemeOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element && !event.target.closest(".theme-control")) {
        setThemeOpen(false);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const chooseTheme = (nextTheme: ThemeId) => {
    setTheme(nextTheme);
    setThemeOpen(false);
    window.localStorage.setItem("gripsky-theme-v2", nextTheme);
  };

  return (
    <div className="site-shell" data-locale={locale} data-theme={theme}>
      <div className="theme-backdrop" aria-hidden="true">
        <span className="backdrop-shape shape-one" />
        <span className="backdrop-shape shape-two" />
        <span className="backdrop-shape shape-three" />
      </div>
      <header className="site-header">
        <Link className="brand-lockup" href={localPath(locale, "/")} aria-label="GripSky home">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand-word">GRIPSKY</span>
        </Link>

        <nav className="desktop-nav" aria-label={locale === "zh" ? "主导航" : "Primary navigation"}>
          {navGroups.map((group) => {
            const href = localPath(locale, group.href);
            const active =
              pathname === href ||
              (group.href !== "/" && pathname.startsWith(`${href}/`));

            return (
              <div className={`nav-group ${active ? "active" : ""}`} key={group.href}>
                <Link href={href}>{tx(group.label, locale)}</Link>
                <div className="nav-panel">
                  {group.items.map((item) => (
                    <Link href={localPath(locale, item.href)} key={item.href}>
                      <span>{tx(item.label, locale)}</span>
                      <i aria-hidden="true">↗</i>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="header-actions">
          <div className={`theme-control ${themeOpen ? "open" : ""}`}>
            <button
              className="theme-trigger"
              type="button"
              onClick={() => {
                setThemeOpen((open) => !open);
                setMenuOpen(false);
              }}
              aria-expanded={themeOpen}
              aria-controls="theme-panel"
            >
              <span className="theme-trigger-icon" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span>{locale === "zh" ? "主题" : "Theme"}</span>
              <b>{tx(currentTheme.label, locale)}</b>
            </button>
            <div className="theme-panel" id="theme-panel" aria-hidden={!themeOpen}>
              <div className="theme-panel-heading">
                <span>{locale === "zh" ? "界面场景" : "INTERFACE SCENE"}</span>
                <small>{locale === "zh" ? "保存在当前设备" : "Saved on this device"}</small>
              </div>
              <div className="theme-options">
                {themeOptions.map((option, index) => (
                  <button
                    className={theme === option.id ? "active" : ""}
                    type="button"
                    key={option.id}
                    onClick={() => chooseTheme(option.id)}
                    tabIndex={themeOpen ? 0 : -1}
                  >
                    <span className={`theme-swatch swatch-${option.id}`} aria-hidden="true">
                      <i />
                    </span>
                    <span>
                      <b>0{index + 1} · {tx(option.label, locale)}</b>
                      <small>{tx(option.note, locale)}</small>
                    </span>
                    <i aria-hidden="true">{theme === option.id ? "●" : "○"}</i>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Link
            className="language-switch"
            href={equivalentLanguagePath(pathname, locale)}
            aria-label={locale === "en" ? "切换至中文" : "Switch to English"}
          >
            {locale === "en" ? "中文" : "EN"}
          </Link>
          <Link className="header-subscribe" href={localPath(locale, "/updates/subscribe")}>
            {locale === "zh" ? "订阅更新" : "Subscribe"}
          </Link>
          <button
            className="menu-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={locale === "zh" ? "打开导航" : "Open navigation"}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {navGroups.map((group, index) => (
          <Link
            href={localPath(locale, group.href)}
            key={group.href}
            onClick={() => setMenuOpen(false)}
          >
            <span>0{index + 1}</span>
            {tx(group.label, locale)}
          </Link>
        ))}
        <Link
          href={localPath(locale, "/updates/subscribe")}
          onClick={() => setMenuOpen(false)}
        >
          <span>→</span>
          {locale === "zh" ? "订阅更新" : "Subscribe to updates"}
        </Link>
      </div>

      {children}

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <div>
              <strong>GRIPSKY</strong>
              <p>
                {locale === "zh"
                  ? "让世界观长成技能，让技能留在自己手里。"
                  : "Worldview into skill. Skill that stays yours."}
              </p>
            </div>
          </div>
          <div className="footer-nav">
            <div>
              <span>{locale === "zh" ? "使用" : "Use"}</span>
              <Link href={localPath(locale, "/worldview")}>{locale === "zh" ? "世界观" : "Worldview"}</Link>
              <Link href={localPath(locale, "/skills/catalog")}>{locale === "zh" ? "技能目录" : "Skill catalog"}</Link>
              <Link href={localPath(locale, "/body/self-host")}>{locale === "zh" ? "自托管" : "Self-host"}</Link>
            </div>
            <div>
              <span>{locale === "zh" ? "参与" : "Participate"}</span>
              <Link href={localPath(locale, "/research")}>{locale === "zh" ? "研究" : "Research"}</Link>
              <Link href={localPath(locale, "/research/contribute")}>{locale === "zh" ? "参与贡献" : "Contribute"}</Link>
              <Link href={localPath(locale, "/updates/subscribe")}>{locale === "zh" ? "订阅更新" : "Updates"}</Link>
            </div>
            <div>
              <span>{locale === "zh" ? "委托" : "Commission"}</span>
              <Link href={localPath(locale, "/services")}>{locale === "zh" ? "服务" : "Services"}</Link>
              <Link href={localPath(locale, "/contact")}>{locale === "zh" ? "联系" : "Contact"}</Link>
              <Link href={localPath(locale, "/about")}>{locale === "zh" ? "关于" : "About"}</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 GRIPSKY</span>
          <div>
            <Link href={localPath(locale, "/legal/business")}>
              {locale === "zh" ? "经营主体" : "Business"}
            </Link>
            <Link href={localPath(locale, "/legal/privacy")}>
              {locale === "zh" ? "隐私" : "Privacy"}
            </Link>
            <Link href={localPath(locale, "/legal/terms")}>
              {locale === "zh" ? "条款" : "Terms"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
