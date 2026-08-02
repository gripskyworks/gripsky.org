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
- `/zh/*`：对应中文页面；英文页面使用不带前缀的路径

所有导航、卡片和按钮均指向真实页面或公开 GitHub 地址。

## 搜索与站点标识

- `favicon.ico`、48/96 像素搜索图标、Apple Touch Icon 与 192/512 像素安装图标均由同一方形母版导出，公开 URL 保持稳定。
- `robots.txt` 允许抓取公开页面、排除接口路径，并指向自动生成的 `sitemap.xml`。
- 每个中英文页面均提供独立标题、摘要、规范网址及互相对应的 `hreflang`；英文无前缀，中文使用 `/zh`。
- 首页提供 `Organization` 与 `WebSite` JSON-LD，说明 GripSky、维护者临观、公开仓库与组织标识之间的关系。
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

基础订阅免费。访客可选择世界观、技能、兼容性、研究或服务主题，通过六位邮箱验证码确认地址。联系表单先写入 D1；配置 SES 后同时转发到指定收件箱。

需要的运行变量见 `.dev.vars.example`：

- `AWS_SES_REGION`
- `AWS_SES_ACCESS_KEY_ID`
- `AWS_SES_SECRET_ACCESS_KEY`
- `SES_FROM_EMAIL`
- `SERVICE_INBOX_EMAIL`
- `SUBSCRIPTION_CODE_PEPPER`

本地界面验证可以设置 `LOCAL_EMAIL_PREVIEW=true`，验证码会显示在页面上，不会发送邮件。不要将真实密钥写入项目文件。

D1 表结构由 `db/schema.ts` 定义，迁移文件位于 `drizzle/`。接口在首次本地调用时也会以 `CREATE TABLE IF NOT EXISTS` 检查基础表，方便原型直接运行。

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

生产环境变量只保存在服务器的 `deploy/contabo/.env`，不进入 Git。订阅和联系记录保存在 `deploy/contabo/data/gripsky.sqlite`；删除项目时应先决定是否保留或导出该数据目录。

访问 `http://localhost:3000/`。常用检查：

```bash
npm run lint
npm test
```

本地改动通过测试、签名提交和公网验收后，发布到上述 Contabo 自托管节点。
