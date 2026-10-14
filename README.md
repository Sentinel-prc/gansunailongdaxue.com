# 甘肃奶龙大学.com

一个轻量的 Cloudflare Workers 入口页。GO 前往 [兰州理工大学](https://www.lut.edu.cn)，页脚以当前版本短 hash 链接到 GitHub 仓库，并提供加入兰理奶群及 [查找更多奶群和奶站](https://nai.amoe.cc) 链接。响应式布局，自动跟随系统深色模式。

## 本地开发

需要 Node.js 22 或更新版本，以及 pnpm 11.23.0。

```sh
pnpm install
pnpm run dev
```

打开 http://127.0.0.1:8787。修改 HTML、CSS 或 Worker 后会自动重新加载。

Wrangler 会自动执行 `pnpm run build`，将静态资源生成到 `dist/` 并注入当前提交的前 7 位 hash。Cloudflare 构建优先读取 `WORKERS_CI_COMMIT_SHA`，本地使用 `git rev-parse HEAD`。生成文件不提交到 Git。

## 检查与部署

```sh
# 验证配置和打包，不上传
pnpm run check

# 验证统计代理
pnpm test

# 登录 Cloudflare 并部署
pnpm exec wrangler login
pnpm run deploy
```

部署后，在 Cloudflare 控制台进入「Workers & Pages → gansunailongdaxue-com → Domains（域名）」，添加已有域名 `甘肃奶龙大学.com` 作为此 Worker 的自定义域名。该域名需要位于当前 Cloudflare 账号管理且已激活的 DNS 区域中；Cloudflare 会自动创建对应的 DNS 记录和证书。

## 文件与配置

- `public/index.html`：页面模板、页脚链接及 Umami 脚本。
- `public/styles.css`：页面样式、深色模式和响应式布局。
- `public/motion.js`：指针牵引及进入方向对应的按钮、校徽动效。
- `public/audio.js`：页面载入后后台缓存音频，点击校徽随机播放，音量为 36%，不显示控件或提示。
- `public/traffic.js`：页脚统计加载与手动刷新。
- `public/logo.png`、`public/favicon.ico`：裁切后的透明校徽与站点图标。
- `src/index.js`：返回静态资源与 `/api/traffic` 统计接口。
- `src/traffic.js`：Umami 汇总查询、缓存与并发合并。
- `scripts/build.mjs`：生成静态资源并注入提交版本。
- `wrangler.jsonc`：Worker 名称及静态资源配置。
- `pnpm-lock.yaml`：锁定依赖版本。
- `pnpm-workspace.yaml`：允许 `esbuild` 和 `workerd` 执行安装脚本。

Umami 当前使用 `https://umami.amoe.cc/script.js`，网站 ID 为 `ee3cbb93-6ca4-4164-8a6c-4bb22b80675d`。更换统计配置时编辑 `public/index.html` 的 `<script>`；无需环境变量。

页面使用原生 HTML/CSS 和少量 JavaScript，构建脚本只复制资源并注入版本；唯一开发依赖是 Wrangler。图标从用户提供的原图裁切，保留圆圈内部图案，圈外透明。

页面采用流光背景与偏心轨道，入场约 2.4 秒，光点与星芒以 32～55 秒周期持续公转。系统开启“减少动态效果”时自动关闭动画。入场状态直接写入 HTML，从首次绘制开始显示动画，不等待交互脚本。页面隐藏时暂停循环动画。GO 按钮的位移、倾斜、流光及箭头动效跟随指针进入方向，校徽悬停也按进入方向移动与倾斜；键盘聚焦默认朝右上方。原生新窗口打开行为保持不变。入场及轨道动画由 CSS 执行，禁用 JavaScript 后所有链接仍可使用。

## 页脚访问统计

Worker 直接代理 Umami 汇总查询，无需额外后端、数据库或付费绑定。在 Umami 中为此站点创建**网站分享链接**，最少勾选「流量 → 概览」。本地在不提交 Git 的 `.dev.vars` 中配置：

```env
UMAMI_SHARE_URL=https://umami.amoe.cc/share/分享码
```

生产环境在 Worker 的「Settings → Variables and Secrets」中添加类型为 Secret、名称为 `UMAMI_SHARE_URL` 的配置，值填写真实分享链接；也可运行 `pnpm exec wrangler secret put UMAMI_SHARE_URL` 交互输入。分享链接和运行时获取的 token 仅供 Worker 使用，不写入 `wrangler.jsonc`、前端资源或 Git。`.dev.vars` 已被 Git 忽略，仅用于本地开发。只支持当前统计域名和此站点 ID；加载中显示「访问统计加载中」，未配置或查询失败显示「访问统计加载失败，尝试刷新」，点击即可重试。成功后显示统计数字和刷新入口。

今日按 UTC+8 零点起算；总计为 Umami 全历史汇总；当前在线为最近五分钟的活跃访客。浏览器仅在载入和点击「刷新」时查询本站 `/api/traffic`，不自动轮询。Worker 合并并发请求，并使用内存及 Cloudflare Cache API 缓存汇总结果最多 30 秒、跨天失效；缓存按边缘数据中心复用，未命中时请求 Umami 四次。失败短暂退避 5 秒。载入或刷新期间隐藏数字，失败时显示重试入口。

