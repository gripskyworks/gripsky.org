"use client";

import { FormEvent, useState } from "react";
import { Locale } from "../lib/site-data";

const topics = [
  { id: "worldview", en: "Worldview releases", zh: "世界观版本" },
  { id: "skills", en: "Skill packages", zh: "技能包发布" },
  { id: "compatibility", en: "Compatibility changes", zh: "兼容性变化" },
  { id: "research", en: "Research and contribution calls", zh: "研究与协作邀请" },
  { id: "services", en: "Managed-service notices", zh: "托管服务通知" },
] as const;

export function SubscribeForm({ locale }: { locale: Locale }) {
  const [step, setStep] = useState<"request" | "verify" | "complete">("request");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>(["worldview", "skills"]);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleTopic = (topic: string) => {
    setSelected((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic],
    );
  };

  const requestCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected.length) {
      setMessage(locale === "zh" ? "至少选择一个更新主题。" : "Choose at least one topic.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/subscription/request-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale, topics: selected }),
      });
      const data = (await response.json()) as { error?: string; previewCode?: string };
      if (!response.ok) throw new Error(data.error || "Request failed");
      setStep("verify");
      setMessage(
        data.previewCode
          ? `${locale === "zh" ? "本地预览验证码" : "Local preview code"}: ${data.previewCode}`
          : locale === "zh"
            ? "验证码已经发送到该邮箱。"
            : "A verification code has been sent.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/subscription/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code, locale, topics: selected }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Verification failed");
      setStep("complete");
      setMessage(
        locale === "zh"
          ? "订阅已经确认。后续只发送所选主题的版本通知。"
          : "Subscription confirmed. Only the selected release topics will be sent.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === "complete") {
    return (
      <div className="form-complete" aria-live="polite">
        <span>✓</span>
        <h2>{locale === "zh" ? "订阅已确认" : "Subscription confirmed"}</h2>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form className="subscription-form" onSubmit={step === "request" ? requestCode : verifyCode}>
      <div className="form-heading">
        <span>{step === "request" ? "01" : "02"}</span>
        <div>
          <h2>
            {step === "request"
              ? locale === "zh"
                ? "选择主题并验证邮箱"
                : "Choose topics and verify your email"
              : locale === "zh"
                ? "输入验证码"
                : "Enter the verification code"}
          </h2>
          <p>
            {locale === "zh"
              ? "免费订阅，不会创建付费服务方案。"
              : "Free subscription. This does not create a paid service plan."}
          </p>
        </div>
      </div>

      {step === "request" ? (
        <>
          <label className="form-field">
            <span>{locale === "zh" ? "邮箱" : "Email"}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <fieldset>
            <legend>{locale === "zh" ? "更新主题" : "Update topics"}</legend>
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
        </>
      ) : (
        <>
          <div className="verification-address">
            <span>{locale === "zh" ? "验证邮箱" : "Verifying"}</span>
            <strong>{email}</strong>
          </div>
          <label className="form-field">
            <span>{locale === "zh" ? "六位验证码" : "Six-digit code"}</span>
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
            />
          </label>
        </>
      )}

      <button className="primary-button form-submit" type="submit" disabled={loading}>
        {loading
          ? locale === "zh"
            ? "处理中…"
            : "Working…"
          : step === "request"
            ? locale === "zh"
              ? "发送验证码"
              : "Send verification code"
            : locale === "zh"
              ? "确认订阅"
              : "Confirm subscription"}
        <span aria-hidden="true">→</span>
      </button>
      {step === "verify" && (
        <button className="form-back" type="button" onClick={() => setStep("request")}>
          {locale === "zh" ? "返回修改邮箱或主题" : "Change email or topics"}
        </button>
      )}
      {message && <p className="form-message" aria-live="polite">{message}</p>}
    </form>
  );
}
