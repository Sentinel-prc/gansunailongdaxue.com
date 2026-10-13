# 甘肃奶龙大学.com

一个轻量的 Cloudflare Workers 入口页。GO 前往 [兰州理工大学](https://www.lut.edu.cn)，页脚链接到 [查找奶群](https://nai.amoe.cc)。响应式布局，自动跟随系统深色模式。

## 本地开发

需要 Node.js 22 或更新版本，以及 pnpm 11.23.0。

```sh
pnpm install
pnpm run dev
```

打开 http://127.0.0.1:8787。修改 HTML、CSS 或 Worker 后会自动重新加载。

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

- `public/index.html`：页面内容、两个外链及 Umami 脚本。
- `public/styles.css`：页面样式、深色模式和响应式布局。
- `public/logo.png`、`public/favicon.ico`：裁切后的透明校徽与站点图标。
- `src/index.js`：通过 `ASSETS` 绑定返回静态资源。
- `wrangler.jsonc`：Worker 名称及静态资源配置。
- `pnpm-lock.yaml`：锁定依赖版本。
- `pnpm-workspace.yaml`：允许 `esbuild` 和 `workerd` 执行安装脚本。

Umami 当前使用 `https://umami.amoe.cc/script.js`，网站 ID 为 `ee3cbb93-6ca4-4164-8a6c-4bb22b80675d`。更换统计配置时编辑 `public/index.html` 的 `<script>`；无需环境变量。

页面使用纯 HTML/CSS，无前端构建步骤；唯一开发依赖是 Wrangler。图标从用户提供的原图裁切，保留圆圈内部图案，圈外透明。

