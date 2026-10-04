"use client";

import { FormEvent, useState } from "react";
import { Locale } from "../lib/site-data";
import { formErrorMessage } from "../lib/form-feedback";

export function ContactForm({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setLoading(true);
    setStatus("");
    const form = new FormData(formElement);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          kind: form.get("kind"),
          brief: form.get("brief"),
          locale,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Request failed");
      formElement.reset();
      setStatus(
        locale === "zh"
          ? "信息已收到。后续通常通过邮箱联系。"
          : "Your message has been received. Follow-up is usually by email.",
      );
    } catch (error) {
      setStatus(formErrorMessage(error, locale, "contact"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`contact-form ${compact ? "contact-form-compact" : ""}`} onSubmit={submit}>
      {compact && (
        <div className="contact-form-heading">
          <span>SERVICE / RESEARCH</span>
          <div>
            <h2>{locale === "zh" ? "说明要做的事" : "Describe the work"}</h2>
            <p>
              {locale === "zh"
                ? "用于研究合作、部署、定制与持续维护。通常会通过邮箱回复。"
                : "For research, deployment, customization and continuing maintenance. Replies normally arrive by email."}
            </p>
          </div>
        </div>
      )}
      <div className="field-row">
        <label className="form-field">
          <span>{locale === "zh" ? "称呼" : "Name"}</span>
          <input name="name" required />
        </label>
        <label className="form-field">
          <span>{locale === "zh" ? "邮箱" : "Email"}</span>
          <input name="email" type="email" required />
        </label>
      </div>
      <label className="form-field">
        <span>{locale === "zh" ? "联系类型" : "Request type"}</span>
        <select name="kind" defaultValue="service">
          <option value="service">{locale === "zh" ? "服务委托" : "Service request"}</option>
          <option value="research">{locale === "zh" ? "研究合作" : "Research collaboration"}</option>
          <option value="other">{locale === "zh" ? "其他" : "Other"}</option>
        </select>
      </label>
      <label className="form-field">
        <span>{locale === "zh" ? "需求简述" : "Brief"}</span>
        <textarea
          name="brief"
          rows={compact ? 4 : 6}
          required
          placeholder={
            locale === "zh"
              ? "说明要构造或维护的体系、已有材料、希望交付的结果和隐私约束。"
              : "Describe the system to build or maintain, the materials available, the intended result and any privacy constraints."
          }
        />
      </label>
      <button className="primary-button form-submit" type="submit" disabled={loading}>
        {loading
          ? locale === "zh"
            ? "提交中…"
            : "Submitting…"
          : locale === "zh"
            ? "提交需求"
            : "Submit request"}
        <span aria-hidden="true">→</span>
      </button>
      <p className="form-privacy">
        {locale === "zh"
          ? "不要提交密码、私钥、证件原件或基础设施凭据。"
          : "Do not submit passwords, private keys, identity documents or infrastructure credentials."}
      </p>
      {status && <p className="form-message" aria-live="polite">{status}</p>}
    </form>
  );
}
