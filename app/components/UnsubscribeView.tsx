"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Locale } from "../lib/site-data";
import { formErrorMessage } from "../lib/form-feedback";

const topics = [
  { id: "worldview", en: "Worldview releases", zh: "世界观版本" },
  { id: "skills", en: "Skill releases", zh: "技能发布" },
  { id: "compatibility", en: "Compatibility changes", zh: "兼容性变化" },
  { id: "research", en: "Research and collaboration invitations", zh: "研究与协作邀请" },
  { id: "services", en: "Managed-service notices", zh: "托管服务通知" },
] as const;

type LoadState = "loading" | "ready" | "saving" | "saved" | "error";

export function UnsubscribeView({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<LoadState>(token ? "loading" : "error");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState(
    token ? "" : formErrorMessage("This subscription link is unavailable.", locale, "load-preferences"),
  );

  useEffect(() => {
    if (!token) return;
    fetch(`/api/subscription/preferences?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as { email?: string; topics?: string[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Unavailable");
        setEmail(data.email ?? "");
        setSelected(data.topics ?? []);
        setState("ready");
      })
      .catch((error: unknown) => {
        setState("error");
        setMessage(formErrorMessage(error, locale, "load-preferences"));
      });
  }, [locale, token]);

  const toggleTopic = (topic: string) => {
    setSelected((current) => current.includes(topic)
      ? current.filter((item) => item !== topic)
      : [...current, topic]);
  };

  const persist = async (nextTopics: string[]) => {
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/subscription/preferences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, topics: nextTopics }),
      });
      const data = await response.json() as { error?: string; topics?: string[] };
      if (!response.ok) throw new Error(data.error || "Update failed");
      setSelected(data.topics ?? []);
      setState("saved");
      setMessage(nextTopics.length
        ? locale === "zh" ? "订阅主题已经更新。" : "Your update topics have been saved."
        : locale === "zh" ? "已退订全部 GripSky 更新。" : "You have unsubscribed from all GripSky updates.");
    } catch (error) {
      setState("error");
      setMessage(formErrorMessage(error, locale, "save-preferences"));
    }
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    void persist(selected);
  };

  return (
    <main className="content-main" data-page-family="updates">
      <section className="content-hero">
        <div className="content-heading">
          <p className="eyebrow">UPDATES / PREFERENCES</p>
          <h1>{locale === "zh" ? "只保留仍然想看的更新。" : "Keep only the updates you still want."}</h1>
          <p>
            {locale === "zh"
              ? "可以修改主题，也可以在这里停止全部更新邮件。验证码和必要的安全邮件不属于订阅通知。"
              : "Change individual topics or stop every subscription email here. Verification and necessary security messages are not subscription updates."}
          </p>
        </div>
      </section>
      <section className="form-section">
        <form className="subscription-form" onSubmit={save}>
          <div className="form-heading">
            <span>01</span>
            <div>
              <h2>{locale === "zh" ? "管理订阅" : "Manage subscription"}</h2>
              {(email || state === "loading") && (
                <p>{email || (locale === "zh" ? "正在读取订阅…" : "Loading subscription…")}</p>
              )}
            </div>
          </div>

          {(state === "ready" || state === "saving" || state === "saved") && (
            <fieldset>
              <legend>{locale === "zh" ? "继续接收" : "Keep receiving"}</legend>
              <div className="topic-grid">
                {topics.map((topic) => (
                  <label key={topic.id} className={selected.includes(topic.id) ? "checked" : ""}>
                    <input
                      type="checkbox"
                      checked={selected.includes(topic.id)}
                      onChange={() => toggleTopic(topic.id)}
                    />
                    <span>{topic[locale]}</span>
                    <i aria-hidden="true">{selected.includes(topic.id) ? "✓" : "+"}</i>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {(state === "ready" || state === "saving" || state === "saved") && (
            <div className="unsubscribe-actions">
              <button className="primary-button form-submit" type="submit" disabled={state === "saving"}>
                {locale === "zh" ? "保存主题" : "Save topics"}<span aria-hidden="true">→</span>
              </button>
              <button className="form-back" type="button" disabled={state === "saving"} onClick={() => void persist([])}>
                {locale === "zh" ? "退订全部更新" : "Unsubscribe from all"}
              </button>
            </div>
          )}
          {message && <p className="form-message" aria-live="polite">{message}</p>}
        </form>
      </section>
    </main>
  );
}
