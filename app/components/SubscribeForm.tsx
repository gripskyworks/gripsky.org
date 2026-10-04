"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { Locale } from "../lib/site-data";
import { formErrorMessage } from "../lib/form-feedback";

const topics = [
  { id: "worldview", en: "Worldview releases", zh: "世界观版本" },
  { id: "skills", en: "Skill releases", zh: "技能发布" },
  { id: "compatibility", en: "Compatibility changes", zh: "兼容性变化" },
  { id: "research", en: "Research and collaboration invitations", zh: "研究与协作邀请" },
  { id: "services", en: "Managed-service notices", zh: "托管服务通知" },
] as const;

type SubscriptionMode = "subscribe" | "unsubscribe";
type SubscriptionStep = "request" | "verify" | "complete";

export function SubscriptionCenter({ locale }: { locale: Locale }) {
  const [mode, setMode] = useState<SubscriptionMode>("subscribe");
  const [step, setStep] = useState<SubscriptionStep>("request");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>(["worldview", "skills"]);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const chooseMode = (nextMode: SubscriptionMode) => {
    setMode(nextMode);
    setStep("request");
    setCode("");
    setMessage("");
  };

  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? 1
      : event.key === "ArrowRight" ? (index + 1) % 2 : (index - 1 + 2) % 2;
    const nextMode: SubscriptionMode = nextIndex === 0 ? "subscribe" : "unsubscribe";
    chooseMode(nextMode);
    tabRefs.current[nextIndex]?.focus();
  };

  const toggleTopic = (topic: string) => {
    setSelected((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic],
    );
  };

  const requestCode = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "subscribe" && !selected.length) {
      setMessage(locale === "zh" ? "至少选择一个更新主题。" : "Choose at least one topic.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/subscription/request-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          locale,
          intent: mode,
          topics: mode === "subscribe" ? selected : [],
        }),
      });
      const data = (await response.json()) as { error?: string; previewCode?: string };
      if (!response.ok) throw new Error(data.error || "Request failed");
      setStep("verify");
      setMessage(
        data.previewCode
          ? `${locale === "zh" ? "本地预览验证码" : "Local preview code"}: ${data.previewCode}`
          : locale === "zh"
            ? "验证码已经发送到该邮箱。"
            : "A verification code has been sent to this email address.",
      );
    } catch (error) {
      setMessage(formErrorMessage(error, locale, "request-code"));
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
        body: JSON.stringify({ email, code }),
      });
      const data = (await response.json()) as { error?: string; wasSubscribed?: boolean };
      if (!response.ok) throw new Error(data.error || "Verification failed");
      setStep("complete");
      setMessage(
        mode === "unsubscribe"
          ? data.wasSubscribed
            ? locale === "zh"
              ? "已解除该邮箱的全部 GripSky 更新订阅。"
              : "This address has been unsubscribed from all GripSky updates."
            : locale === "zh"
              ? "该邮箱没有有效订阅，未创建或更改订阅记录。"
              : "This address had no active subscription. No record was created or changed."
          : locale === "zh"
            ? "订阅已确认。版本通知将按所选主题发送。"
            : "Subscription confirmed. Release notices will be sent for your selected topics.",
      );
    } catch (error) {
      setMessage(formErrorMessage(error, locale, "verify-code"));
    } finally {
      setLoading(false);
    }
  };

  const isUnsubscribe = mode === "unsubscribe";
  const heading = step === "verify"
    ? locale === "zh" ? "输入验证码" : "Enter the verification code"
    : isUnsubscribe
      ? locale === "zh" ? "验证邮箱后解除订阅" : "Verify the address to unsubscribe"
      : locale === "zh" ? "选择想看的更新" : "Choose what should reach you";

  return (
    <section
      className="subscription-center interactive-surface"
      data-mode={mode}
    >
      <div className="subscription-tabs interactive-tabs" role="tablist" aria-label={locale === "zh" ? "订阅操作" : "Subscription actions"}>
        <span className="subscription-tab-indicator" aria-hidden="true" />
        {(["subscribe", "unsubscribe"] as const).map((item, index) => (
          <button
            aria-controls="subscription-operation-panel"
            aria-selected={mode === item}
            className={mode === item ? "active" : ""}
            id={`subscription-tab-${item}`}
            key={item}
            onClick={() => chooseMode(item)}
            onKeyDown={(event) => handleTabKey(event, index)}
            ref={(node) => { tabRefs.current[index] = node; }}
            role="tab"
            tabIndex={mode === item ? 0 : -1}
            type="button"
          >
            <span>{index === 0 ? "01" : "02"}</span>
            {item === "subscribe"
              ? locale === "zh" ? "订阅 / 更新主题" : "Subscribe / update topics"
              : locale === "zh" ? "解除订阅" : "Unsubscribe"}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`subscription-tab-${mode}`}
        id="subscription-operation-panel"
        role="tabpanel"
      >
        {step === "complete" ? (
          <div className="form-complete compact" aria-live="polite">
            <span>{isUnsubscribe ? "−" : "✓"}</span>
            <h2>{isUnsubscribe
              ? locale === "zh" ? "处理完成" : "Request complete"
              : locale === "zh" ? "订阅已确认" : "Subscription confirmed"}</h2>
            <p>{message}</p>
            <button className="form-back" type="button" onClick={() => setStep("request")}>
              {locale === "zh" ? "返回订阅中心" : "Return to subscription center"}
            </button>
          </div>
        ) : (
          <form className="subscription-form compact" onSubmit={step === "request" ? requestCode : verifyCode}>
            <div className="form-heading compact">
              <span>{step === "request" ? "01" : "02"}</span>
              <div>
                <h2>{heading}</h2>
                <p>{isUnsubscribe
                  ? locale === "zh"
                    ? "验证码只用于确认您控制该邮箱。"
                    : "The code only confirms that you control this address."
                  : locale === "zh"
                    ? "订阅免费，不会开通付费服务。"
                    : "Free subscription. This does not create a paid service plan."}</p>
              </div>
            </div>

            {step === "request" ? (
              <div className="subscription-fields">
                <label className="form-field">
                  <span>{locale === "zh" ? "邮箱" : "Email"}</span>
                  <input
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </label>
                {!isUnsubscribe && (
                  <fieldset>
                    <legend>{locale === "zh" ? "更新主题" : "Update topics"}</legend>
                    <div className="topic-grid compact">
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
                {isUnsubscribe && (
                  <div className="unsubscribe-explanation">
                    <span aria-hidden="true">↙</span>
                    <p>{locale === "zh"
                      ? "验证后将停止该邮箱的全部更新。重新订阅时，需要再次验证。"
                      : "Verification stops every update for this address. Subscribing again requires a new verification."}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="verification-fields">
                <div className="verification-address">
                  <span>{locale === "zh" ? "验证邮箱" : "Verifying"}</span>
                  <strong>{email}</strong>
                </div>
                <label className="form-field">
                  <span>{locale === "zh" ? "六位验证码" : "Six-digit code"}</span>
                  <input
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    required
                  />
                </label>
              </div>
            )}

            <div className="subscription-submit-row">
              <button className="primary-button form-submit" type="submit" disabled={loading}>
                {loading
                  ? locale === "zh" ? "处理中…" : "Working…"
                  : step === "request"
                    ? locale === "zh" ? "发送验证码" : "Send verification code"
                    : isUnsubscribe
                      ? locale === "zh" ? "确认解除订阅" : "Confirm and unsubscribe"
                      : locale === "zh" ? "确认订阅" : "Confirm subscription"}
                <span aria-hidden="true">→</span>
              </button>
              {step === "verify" && (
                <button className="form-back" type="button" onClick={() => setStep("request")}>
                  {locale === "zh" ? "返回修改邮箱" : "Change email"}
                </button>
              )}
            </div>
            {message && <p className="form-message" aria-live="polite">{message}</p>}
          </form>
        )}
      </div>

      <p className="subscription-fallback-note">
        {locale === "zh"
          ? "邮件应用未显示退订入口时，可随时在这里验证邮箱并退订。"
          : "If your mail app does not show an unsubscribe control, verify your address here to stop updates at any time."}
      </p>
    </section>
  );
}
