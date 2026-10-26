# GripSky — Living Atlas

Source code for [gripsky.org](https://gripsky.org), maintained by [Lin Guan](https://orcid.org/0009-0009-9675-5355) through [GripSky](https://github.com/gripskyworks).

GripSky explores how people understand, change and extend themselves. Worldview, reusable skills, information systems and AI are connected through practice. Public definitions and exploratory work remain distinct from validated, runnable packages. Deployment, custom work and continuing maintenance are separately agreed services.

## Website

English pages use `/`; Chinese pages use `/zh`. The site includes worldview, skills, external body, research, services, FAQ, and a combined updates/contact page. Public pages are server-rendered with canonical and reciprocal language links. Search summaries, sharing metadata and page JSON-LD describe the same visible content. A sitemap, RSS and `llms.txt` provide further entry points.

The Living Atlas design uses warm paper, deep teal, layered linework and mechanical orbital scenes. Five themes share semantic color tokens. Motion responds gradually to attention and pauses with reduced-motion preferences, touch input or hidden content. See [DESIGN.md](DESIGN.md), [expression-system](docs/expression-system.md) and the [brand silhouette specifications](assets/brand/silhouette/README.md).

## Local development

Node.js 22.13 or newer is required; Node.js 24 is also supported.

```sh
npm ci
npm run preview:local
```

Open `http://localhost:3014/` or `http://localhost:3014/zh`. Development uses local email preview: verification codes are shown on the page and are not sent. Do not put real credentials or subscriber databases in Git.

```sh
npm run lint
npm run typecheck
npm test
npm run test:local-build
```

Optional browser checks use a separately installed Playwright runtime via `PLAYWRIGHT_MODULE`. Interaction checks are read-only; form checks intercept their requests. Touch tests are simulations, not physical-device certification.

## Content and mail

Public page, skill and historical release content lives in `app/lib/site-data.ts`. There is no article-management dashboard, and a Git push or deployment does not create a release notice or send subscriber mail.

Subscription verification, self-service unsubscribe, contact recording and the update-mail outbox have server-side implementations. SES is configured only in the deployment environment. Verification codes expire, email requests have normal-use budgets, and update mail includes both unsubscribe headers and a body management link. See [mail operations](docs/email-subscription-operations.md) and the [content-publishing plan](docs/content-publishing-plan.md).

## Self-hosting

`server-selfhost.mjs` supplies the Node.js runtime and SQLite adapter. The Dockerfile and `deploy/contabo/` files are reference deployment configuration: adapt networks, persistence and ingress to your own environment. Persist the database independently of runtime releases, and never commit environment files.

The included Nginx example assumes TLS is terminated by a trusted proxy or Cloudflare Tunnel. It uses the forwarded visitor scheme for HTTP-to-HTTPS redirects; do not apply that rule to an untrusted, directly exposed origin without reviewing the proxy boundary.

## Public boundaries

This repository contains website code, public content and reusable design assets. Private research materials, collaboration records, device configurations, credentials, subscriber records and local build outputs are not included. The author's development history and this public publication history are separate; the publication commit identifies the reviewed source revision.

## 联系

- Website / 官网：[gripsky.org](https://gripsky.org)
- Email / 邮箱：contact@gripsky.org
- WeChat ID / 微信：gripsky
- Public collaboration / 公开协作：[GitHub Issues](https://github.com/gripskyworks/gripsky.org/issues)

中文公开页面从 [gripsky.org/zh](https://gripsky.org/zh) 进入。世界观与技能按当前实践阶段逐步公开；需要部署、定制或维护时，请先说明目标、材料与隐私约束。


## Codetaker creative practice

The existing research section now links [Codetaker](https://codetaker.gripsky.org/), a short browser narrative game in development by Lin Guan (临观). The bilingual project entry at `/research/codetaker` describes its current stage, artwork attribution and relationship to GripSky. No public playable release is available.
