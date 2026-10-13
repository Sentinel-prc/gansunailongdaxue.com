# 甘肃奶龙大学.com

一个轻量的 Cloudflare Workers 入口页。GO 前往 [兰州理工大学](https://www.lut.edu.cn)，页脚提供当前提交、GitHub 仓库及 [查找更多奶群和奶站](https://nai.amoe.cc) 链接。响应式布局，自动跟随系统深色模式。

## 本地开发

需要 Node.js 22 或更新版本，以及 pnpm 11.23.0。

```sh
pnpm install
pnpm run dev
```

打开 http://127.0.0.1:8787。修改 HTML、CSS 或 Worker 后会自动重新加载。

Wrangler 会自动执行 `pnpm run build`，将静态资源生成到 `dist/` 并注入当前提交的前 7 位 hash 和完整提交链接。Cloudflare 构建优先读取 `WORKERS_CI_COMMIT_SHA`，本地使用 `git rev-parse HEAD`。生成文件不提交到 Git。

## 检查与部署

```sh
# 验证配置和打包，不上传
pnpm run check

# 登录 Cloudflare 并部署
pnpm exec wrangler login
pnpm run deploy
```

部署后，在 Cloudflare 控制台打开此 Worker 的「Settings → Domains & Routes → Add → Custom Domain」，添加 `甘肃奶龙大学.com`。该域名需要位于当前 Cloudflare 账号管理的 DNS 区域中。

## 文件与配置

- `public/index.html`：页面模板、页脚链接及 Umami 脚本。
- `public/styles.css`：页面样式、深色模式和响应式布局。
- `public/motion.js`：指针牵引、跳转过渡和动效暂停控制。
- `public/logo.png`、`public/favicon.ico`：裁切后的透明校徽与站点图标。
- `src/index.js`：通过 `ASSETS` 绑定返回静态资源。
- `scripts/build.mjs`：生成静态资源并注入提交版本。
- `wrangler.jsonc`：Worker 名称及静态资源配置。
- `pnpm-lock.yaml`：锁定依赖版本。
- `pnpm-workspace.yaml`：允许 `esbuild` 和 `workerd` 执行安装脚本。

Umami 当前使用 `https://umami.amoe.cc/script.js`，网站 ID 为 `ee3cbb93-6ca4-4164-8a6c-4bb22b80675d`。更换统计配置时编辑 `public/index.html` 的 `<script>`；无需环境变量。

页面使用原生 HTML/CSS 和少量 JavaScript，构建脚本只复制资源并注入版本；唯一开发依赖是 Wrangler。图标从用户提供的原图裁切，保留圆圈内部图案，圈外透明。

页面采用流光背景与偏心轨道，入场约 2.4 秒，光点与星芒以 32～55 秒周期持续公转。页脚可暂停持续动效；系统开启“减少动态效果”时自动关闭动画。页面隐藏时暂停循环动画，返回时复位跳转效果。GO 保留原生新窗口打开行为，并在当前页面播放光圈过渡；禁用 JavaScript 后页面保持静止，所有链接仍可使用。

