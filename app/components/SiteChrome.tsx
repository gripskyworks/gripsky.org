"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { attachEnvironmentMotion } from "../lib/environment-motion";
import {
  GITHUB_ORGANIZATION,
  Locale,
  localPath,
  navGroups,
  tx,
} from "../lib/site-data";

type ThemeId = "paper" | "orbit" | "retro" | "liquid" | "tide";
type HeaderPanel = "menu" | "theme" | null;

const themeEnvironment: Record<
  ThemeId,
  { colorScheme: "light" | "dark"; themeColor: string }
> = {
  paper: { colorScheme: "light", themeColor: "#eeeae0" },
  orbit: { colorScheme: "dark", themeColor: "#06090b" },
  retro: { colorScheme: "light", themeColor: "#c9c8bd" },
  liquid: { colorScheme: "light", themeColor: "#cdd9e4" },
  tide: { colorScheme: "dark", themeColor: "#173b3a" },
};

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
  const shell = useRef<HTMLDivElement>(null);
  const locale = getLocale(pathname);
  const [panel, setPanel] = useState<{ pathname: string; active: HeaderPanel }>({
    pathname,
    active: null,
  });
  // A header panel belongs to the route where it was opened. Reset before
  // rendering the new page, including history navigation, without remounting
  // the whole shell or resetting the reader's theme.
  if (panel.pathname !== pathname) setPanel({ pathname, active: null });
  const menuOpen = panel.pathname === pathname && panel.active === "menu";
  const themeOpen = panel.pathname === pathname && panel.active === "theme";
  const [theme, setTheme] = useState<ThemeId>("paper");
  const currentTheme =
    themeOptions.find((option) => option.id === theme) ?? themeOptions[0];

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  useEffect(() => {
    const environment = themeEnvironment[theme];
    document.documentElement.style.colorScheme = environment.colorScheme;
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute("content", environment.themeColor);
  }, [theme]);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem("gripsky-precision-theme");
    } catch {
      // A denied storage API must not prevent this session's controls working.
    }
    const matched = themeOptions.find((option) => option.id === stored);
    if (!matched) return;
    const frame = window.requestAnimationFrame(() => setTheme(matched.id));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel((current) => ({ ...current, active: null }));
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target;
      setPanel((current) => {
        const owner = current.active === "theme"
          ? ".theme-control"
          : ".menu-button, .mobile-menu";
        return current.active && !target.closest(owner)
          ? { ...current, active: null }
          : current;
      });
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (shell.current) return attachEnvironmentMotion(shell.current);
  }, [pathname]);

  const closePanel = () => setPanel({ pathname, active: null });
  const togglePanel = (active: Exclude<HeaderPanel, null>) => {
    setPanel((current) => ({
      pathname,
      active: current.pathname === pathname && current.active === active ? null : active,
    }));
  };

  const chooseTheme = (nextTheme: ThemeId) => {
    setTheme(nextTheme);
    closePanel();
    try {
      window.localStorage.setItem("gripsky-precision-theme", nextTheme);
    } catch {
      // Keep the chosen theme for this session when persistent storage is unavailable.
    }
  };

  return (
    <div
      className="site-shell"
      ref={shell}
      data-locale={locale}
      data-theme={theme}
      lang={locale === "zh" ? "zh-CN" : "en"}
    >
      <a className="skip-content" href="#main-content">
        {locale === "zh" ? "跳到正文" : "Skip to content"}
      </a>
      <header className="site-header">
        <Link
          className="brand-lockup"
          href={localPath(locale, "/")}
          onClick={closePanel}
          aria-label={locale === "zh" ? "GripSky 首页" : "GripSky home"}
        >
          <span className="brand-mark" aria-hidden="true"></span>
          <span className="brand-word">GRIPSKY</span>
        </Link>

        <nav
          className="desktop-nav"
          aria-label={locale === "zh" ? "主导航" : "Primary navigation"}
        >
          {navGroups.map((group) => {
            const href = localPath(locale, group.href);
            const activePaths =
              "activePaths" in group ? group.activePaths : [group.href];
            const active = activePaths.some((path) => {
              const localizedPath = localPath(locale, path);
              return (
                pathname === localizedPath ||
                pathname.startsWith(`${localizedPath}/`)
              );
            });

            return (
              <div
                className={`nav-group ${active ? "active" : ""}`}
                key={group.href}
              >
                <Link href={href} onClick={closePanel}>{tx(group.label, locale)}</Link>
                <div className="nav-panel">
                  {group.items.map((item) => (
                    <Link href={localPath(locale, item.href)} key={item.href} onClick={closePanel}>
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
              onClick={() => togglePanel("theme")}
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
            <div
              className="theme-panel"
              id="theme-panel"
              aria-hidden={!themeOpen}
              inert={!themeOpen}
            >
              <div className="theme-panel-heading">
                <span>{locale === "zh" ? "界面场景" : "INTERFACE SCENE"}</span>
                <small>
                  {locale === "zh" ? "保存在当前设备" : "Saved on this device"}
                </small>
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
                    <span
                      className={`theme-swatch swatch-${option.id}`}
                      aria-hidden="true"
                    >
                      <i />
                    </span>
                    <span>
                      <b>
                        0{index + 1} · {tx(option.label, locale)}
                      </b>
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
            onClick={closePanel}
            aria-label={locale === "en" ? "切换至中文" : "Switch to English"}
          >
            {locale === "en" ? "中文" : "EN"}
          </Link>
          <Link
            className="header-subscribe"
            href={localPath(locale, "/updates/subscribe")}
            onClick={closePanel}
          >
            {locale === "zh" ? "订阅更新" : "Subscribe"}
          </Link>
          <button
            className="menu-button"
            type="button"
            onClick={() => togglePanel("menu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={
              locale === "zh"
                ? menuOpen
                  ? "关闭导航"
                  : "打开导航"
                : menuOpen
                  ? "Close navigation"
                  : "Open navigation"
            }
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav
        className={`mobile-menu ${menuOpen ? "open" : ""}`}
        id="mobile-navigation"
        aria-label={locale === "zh" ? "移动导航" : "Mobile navigation"}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        {navGroups.map((group, index) => (
          <Link
            href={localPath(locale, group.href)}
            key={group.href}
            onClick={closePanel}
          >
            <span>0{index + 1}</span>
            {tx(group.label, locale)}
          </Link>
        ))}
        <Link
          href={localPath(locale, "/updates/subscribe")}
          onClick={closePanel}
        >
          <span>→</span>
          {locale === "zh" ? "订阅更新" : "Subscribe to updates"}
        </Link>
      </nav>

      <div id="main-content" tabIndex={-1}>
        {children}
      </div>

      <footer className="site-footer">
        {(pathname === "/" || pathname === "/zh") && (
          <div className="atlas-footer-word" aria-hidden="true">
            GRIPSKY<span>↗</span>
          </div>
        )}
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-mark" aria-hidden="true"></span>
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
              <Link href={localPath(locale, "/worldview")}>
                {locale === "zh" ? "世界观" : "Worldview"}
              </Link>
              <Link href={localPath(locale, "/skills/catalog")}>
                {locale === "zh" ? "技能目录" : "Skill catalog"}
              </Link>
              <Link href={localPath(locale, "/faq")}>
                {locale === "zh" ? "常见问题" : "FAQ"}
              </Link>
            </div>
            <div>
              <span>{locale === "zh" ? "参与" : "Participate"}</span>
              <a href={GITHUB_ORGANIZATION} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <Link href={localPath(locale, "/research/contribute")}>
                {locale === "zh" ? "参与贡献" : "Contribute"}
              </Link>
              <Link href={localPath(locale, "/updates/subscribe")}>
                {locale === "zh" ? "订阅更新" : "Updates"}
              </Link>
            </div>
            <div>
              <span>{locale === "zh" ? "委托" : "Commission"}</span>
              <Link href={localPath(locale, "/services")}>
                {locale === "zh" ? "服务" : "Services"}
              </Link>
              <Link href={localPath(locale, "/contact")}>
                {locale === "zh" ? "联系" : "Contact"}
              </Link>
              <Link href={localPath(locale, "/about")}>
                {locale === "zh" ? "关于" : "About"}
              </Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 GRIPSKY</span>
          <div>
            <Link href={localPath(locale, "/legal/business")}>
              {locale === "zh" ? "经营主体" : "Business identity"}
            </Link>
            <Link href={localPath(locale, "/legal/privacy")}>
              {locale === "zh" ? "隐私" : "Privacy"}
            </Link>
            <Link href={localPath(locale, "/legal/terms")}>
              {locale === "zh" ? "条款" : "Terms"}
            </Link>
            <a href="/feed.xml">RSS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
