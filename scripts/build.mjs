import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFile } from "node:process";
import { renderPage } from "./site-config.mjs";

const root = new URL("../", import.meta.url);
try {
  loadEnvFile(fileURLToPath(new URL(".env", root)));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const commit = (
  process.env.WORKERS_CI_COMMIT_SHA ||
  execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: fileURLToPath(root),
    encoding: "utf8",
  })
).trim();

if (!/^[0-9a-f]{40}$/i.test(commit)) {
  throw new Error("Expected a full Git commit SHA for the footer version.");
}

const html = renderPage(
  await readFile(new URL("public/index.html", root), "utf8"),
  process.env,
  commit,
);

const output = new URL("dist/", root);
await mkdir(output, { recursive: true });
// 保留目录本身，避免 Windows 上与 Wrangler 的目录监听冲突。
for (const entry of await readdir(output)) {
  await rm(join(fileURLToPath(output), entry), {
    recursive: true,
    force: true,
  });
}
await cp(new URL("public/", root), output, { recursive: true });
await writeFile(new URL("dist/index.html", root), html);
console.log(`Built static page for commit ${commit.slice(0, 7)}.`);
