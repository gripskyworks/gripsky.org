# GripSky 组织站

GripSky 的本地组织站。它不是一个通用服务工作室主页，而是公开呈现一条可追踪的体系：

`系统论 → 世界观 → 主体 → 技能 → 外置信息身躯`

世界观和大部分通用技能逐步开源，公共实现允许自托管。商业服务从 GripSky 开始承担部署、定制、运行或持续维护责任时才发生。

## 站点结构

- `/worldview`：世界观地图、原则、版本、变更与公开源
- `/skills`：技能体系、分类、目录与单项技能页
- `/body`：外置信息身躯、运行态、自托管与实例
- `/research`：研究问题、路线、提案与贡献入口
- `/updates`：统一版本流、变更记录和邮件订阅
- `/services`：部署、托管、定制技能、体系构造和持续维护
- `/about`、`/contact`、`/legal/*`：组织说明、合作入口和法律信息
- `/faq`：稳定定义、维护者、受众、开放边界与理想运行方式
- `/zh/*`：对应中文页面；英文页面使用不带前缀的路径

所有导航、卡片和按钮均指向真实页面或公开 GitHub 地址。

## 搜索与站点标识

- `gripsky-favicon-light-20260806-*` 是浅底小尺寸标识，供浏览器标签、邮件与触屏图标使用；根路径 `favicon.ico` 同步为兼容入口。`gripsky-brand-mark-v1.png` 是青绿色色块中的“握住三螺旋基因的手”标志，用于网站左上角、结构化数据与安装清单。替换图标时新建版本文件并更新引用，避免浏览器与搜索缓存继续展示旧标识。
- `robots.txt` 允许抓取公开页面、排除接口路径，并指向自动生成的 `sitemap.xml`。
- 每个中英文页面均提供独立标题、摘要、规范网址及互相对应的 `hreflang`；英文无前缀，中文使用 `/zh`。
- 首页提供 `Organization` 与 `WebSite` JSON-LD，说明 GripSky、维护者临观、公开仓库与组织标识之间的关系。
- `/faq` 提供与页面可见正文一致的 `FAQPage` JSON-LD；维护者 `Person` 使用 ORCID `0009-0009-9675-5355` 进行身份消歧，不与 GripSky 组织实体混写。
- `/llms.txt` 汇集适合机器读取的项目定义和权威入口；`/feed.xml` 发布现有版本流，邮件订阅继续提供按主题通知。
- 仓库根目录 `CITATION.cff` 记录组织站代码的作者、ORCID、版本与引用边界。
- 规范主机名为 `https://gripsky.org`；`www.gripsky.org` 在生产入口永久跳转到主域，避免两套网址竞争同一内容。

## 界面主题

右上角主题按钮提供五种本地界面场景：

- 亮色：默认主题，使用暖纸底色、墨色正文与青绿强调
- 暗轨：更锋利的轨道切面、技术网格与信号光
- 古早网页：系统蓝、硬边框、像素网点与早期网页质感
- 液态玻璃：折射色场、流动背景和克制的半透明功能层
- 墨青：低饱和深青底色、宽幅波纹与暖色信号

主题选择保存在当前浏览器。大型背景图形会随鼠标轻微位移，目录卡片和表单表面使用局部光场反馈；液态玻璃的形体会缓慢改变轮廓，减少动态效果的系统偏好会关闭持续动画。

## 公开边界

站点只引用已脱敏的 `worldview` Git 仓库和可公开的通用技能结构。以下内容不进入组织站：

- 未脱敏世界观与个人工作材料
- 设备运行参数、账号恢复材料和密钥
- 客户内容、私有运行态与只适用于个人现场的实现
- 营业执照原件和自然人敏感字段

## 邮件订阅与联系

基础订阅免费。访客可选择世界观、技能、兼容性、研究或服务主题，通过六位邮箱验证码确认地址。验证码只保存带 pepper 的哈希，10 分钟后失效，验证成功才写入正式订阅者。联系表单先写入 D1；配置 SES 后同时转发到指定收件箱。

版本通知使用 SQLite Outbox：发布记录先写入 `update_publications`，每位符合主题的订阅者对应一条幂等的 `update_deliveries`，Worker 再以小批量逐封交给 SES。失败按退避时间重试，最多五次；单日应用层上限为 500 封。邮件同时包含：

- `List-Unsubscribe` 与 `List-Unsubscribe-Post`，供 Gmail 等客户端显示一键退订；
- 正文中的订阅管理链接，可修改单个主题或退订全部更新；
- 每位订阅者独立的签名令牌，不在链接中暴露邮箱。

需要的运行变量见 `.dev.vars.example`：

- `AWS_SES_REGION`
- `AWS_SES_ACCESS_KEY_ID`
- `AWS_SES_SECRET_ACCESS_KEY`
- `SES_FROM_EMAIL`
- `SERVICE_INBOX_EMAIL`
- `SUBSCRIPTION_CODE_PEPPER`
- `UPDATE_PUBLISH_TOKEN`

本地界面验证可以设置 `LOCAL_EMAIL_PREVIEW=true`，验证码会显示在页面上，不会发送邮件。不要将真实密钥写入项目文件。

D1 表结构由 `db/schema.ts` 定义，迁移文件位于 `drizzle/`。接口在首次本地调用时也会检查并补齐基础表，方便原型直接运行。发布与 Worker 操作见 [`docs/email-subscription-operations.md`](docs/email-subscription-operations.md)。

## 本地运行

```bash
npm install
npm run dev
```

## 自托管部署

仓库同时保留 Cloudflare Worker 构建和 Node.js 自托管入口。Contabo 部署使用：

- `Dockerfile`：生成独立 Node.js 运行镜像；
- `server-selfhost.mjs`：提供 Node 运行时环境和持久化 SQLite 适配；
- `deploy/contabo/docker-compose.yml`：将站点加入现有 `gripsky-net`，不直接占用宿主机公网端口；
- `deploy/contabo/nginx-gripsky-org.conf`：由现有 Nginx 为 `gripsky.org` 和 `www.gripsky.org` 转发请求。
- `deploy/contabo/gripsky-update-mailer.*`：每两分钟唤醒一次小批量更新邮件 Worker。

生产环境变量只保存在服务器的 `deploy/contabo/.env`，不进入 Git。订阅和联系记录保存在 `deploy/contabo/data/gripsky.sqlite`；删除项目时应先决定是否保留或导出该数据目录。

访问 `http://localhost:3000/`。常用检查：

```bash
npm run lint
npm test
```

本地改动通过测试、签名提交和公网验收后，发布到上述 Contabo 自托管节点。
