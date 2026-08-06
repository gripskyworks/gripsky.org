# GripSky 邮件订阅与版本通知

## 边界

- 验证码和必要的安全邮件属于事务邮件，不携带退订入口。
- 世界观、技能、兼容性、研究和服务通知属于订阅邮件，只发送给已经验证且仍选择对应主题的地址。
- SQLite 是订阅状态、发布记录和投递任务的权威端；SES 只承担投递。
- 管理令牌只保存在生产环境变量中，不进入 Git、发布 JSON 或日志。

## 订阅闭环

1. `/api/subscription/request-code` 生成六位验证码，只保存带 pepper 的哈希；邮件发送失败时同时撤销验证码记录和本次频率预算。
2. `/api/subscription/verify` 最多核验五次；成功后以邮箱为唯一键保存语言、主题、验证状态和随机公共标识。
3. 更新邮件中的签名令牌由公共标识和 pepper 生成，链接不包含邮箱。
4. `/api/subscription/unsubscribe` 接受邮件客户端的一键 POST，直接退出当前主题，不登录、不跳转。
5. `/unsubscribe` 与 `/zh/unsubscribe` 提供人工管理界面，可以保存主题或退订全部更新；两页均禁止索引。

## 发布一项真实更新

先准备 UTF-8 JSON 文件，例如：

```json
{
  "slug": "skills-catalog-02",
  "topic": "skills",
  "titleEn": "The second public skill catalog",
  "titleZh": "第二版公开技能目录",
  "summaryEn": "What changed and which self-hosting paths are now available.",
  "summaryZh": "本次变化，以及新增的自托管路径。",
  "url": "https://gripsky.org/updates/releases",
  "publishedAt": "2026-08-06T14:00:00+08:00"
}
```

允许的 `topic` 为 `worldview`、`skills`、`compatibility`、`research`、`services`。`slug` 是幂等键；重复提交同一项发布不会重复建立收件任务。

从 `mac工作机` 将 JSON 经标准输入交给生产容器，管理令牌不会离开服务器：

```bash
ssh con-eu 'sudo docker exec -i gripsky-site node /app/scripts/publish-update.mjs' < update.json
```

这一步只登记发布和任务，不在交互请求中群发。`gripsky-update-mailer.timer` 每两分钟调用一次 Worker，每批最多十封，单日最多 500 封；单封失败采用指数退避，五次后进入 `failed`。

需要立即处理一批时：

```bash
ssh con-eu 'sudo docker exec gripsky-site node /app/scripts/process-updates.mjs'
```

## 退订语义

- 邮箱客户端顶部的退订针对当前邮件主题。
- 正文“管理订阅”允许修改多个主题或全部退出。
- Worker 每次发送前重新读取订阅状态；已退出主题、全部退订或缺少有效令牌的任务记为 `skipped`。
- 同一 `publication_id + subscriber_id` 只能存在一条投递任务，重复执行 Worker 不应重复投递已经成功的邮件。

## 当前运维边界

- 生产使用 SES 域名身份、DKIM 和独立发送密钥。
- 应用层保存 SES 返回的 Message ID 和有限长度错误，不把邮件正文、密钥或验证码写入日志。
- SES 账户级抑制继续生效；将退信和投诉事件同步回本地 `suppressed` 状态属于下一阶段，实施前需要配置 SES Configuration Set 与事件入口。
