import type { Locale, LocalizedText } from "./site-data";

export type FormAction = "request-code" | "verify-code" | "contact" | "load-preferences" | "save-preferences";

// Translate the existing API contract at the display boundary. Unknown network
// or server messages use a safe fallback rather than exposing internal errors.
const knownErrors: Record<string, LocalizedText> = {
  "Please enter a valid email address.": {
    en: "Enter a valid email address.",
    zh: "请填写有效的邮箱地址。",
  },
  "A code was sent recently. Please wait one minute.": {
    en: "A code was sent recently. Wait a minute before requesting another.",
    zh: "刚刚已发送验证码，请等一分钟再试。",
  },
  "Too many verification emails were requested. Please try again later.": {
    en: "Too many codes have been requested. Try again later.",
    zh: "验证码请求次数较多，请稍后再试。",
  },
  "The verification email could not be sent.": {
    en: "The verification email could not be sent. Try again later.",
    zh: "验证码邮件未能发送，请稍后再试。",
  },
  "Enter the six-digit code from the email.": {
    en: "Enter the six-digit code from the email.",
    zh: "请填写邮件中的六位验证码。",
  },
  "The code is unavailable or expired. Request a new one.": {
    en: "This code is no longer valid. Request a new one.",
    zh: "验证码已失效，请重新获取。",
  },
  "The code is incorrect.": {
    en: "That code does not match. Check the email and try again.",
    zh: "验证码不正确，请核对邮件后再试。",
  },
  "Subscription verification failed.": {
    en: "The subscription could not be verified. Try again later.",
    zh: "暂时无法完成验证，请稍后再试。",
  },
  "Complete every field and provide a brief of at least 20 characters.": {
    en: "Complete every field and write at least 20 characters in the brief.",
    zh: "请填写所有项目，需求简述至少需要 20 个字符。",
  },
  "Too many messages were sent from this address or network. Please try again later.": {
    en: "Too many messages have been submitted from this address or network. Try again later.",
    zh: "这个邮箱或网络提交的信息较多，请稍后再试。",
  },
  "The request could not be recorded.": {
    en: "The message could not be saved. Try again later, or email contact@gripsky.org.",
    zh: "信息未能保存，请稍后再试，或发邮件到 contact@gripsky.org。",
  },
  "This subscription link is unavailable.": {
    en: "This subscription link is not valid. You can manage your subscription by verifying your email on the subscription page.",
    zh: "这个订阅链接不可用。可以到订阅页验证邮箱后管理订阅。",
  },
};

const fallbacks: Record<FormAction, LocalizedText> = {
  "request-code": {
    en: "Unable to request a verification code. Check your connection and try again.",
    zh: "暂时无法获取验证码，请检查网络后再试。",
  },
  "verify-code": {
    en: "Verification could not be completed. Try again later.",
    zh: "暂时无法完成验证，请稍后再试。",
  },
  contact: {
    en: "The submission could not be confirmed. Try again later, or email contact@gripsky.org.",
    zh: "暂时无法确认提交结果，请稍后再试，或发邮件到 contact@gripsky.org。",
  },
  "load-preferences": {
    en: "Your subscription could not be loaded. Try again later.",
    zh: "暂时无法读取订阅信息，请稍后再试。",
  },
  "save-preferences": {
    en: "Your subscription settings could not be saved. Try again later.",
    zh: "订阅设置未能保存，请稍后再试。",
  },
};

export function formErrorMessage(error: unknown, locale: Locale, action: FormAction): string {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return (knownErrors[message] ?? fallbacks[action])[locale];
}
