import assert from "node:assert/strict";
import test from "node:test";
import worker from "../src/index.js";

test("未配置统计时返回无缓存的明确失败，不代理任意查询 URL", async () => {
  const response = await worker.fetch(
    new Request("https://site.test/api/traffic?url=https://other.test"),
    {},
  );
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), { error: "访问统计暂不可用" });
});

test("统计接口只接受 GET", async () => {
  const response = await worker.fetch(
    new Request("https://site.test/api/traffic", { method: "POST" }),
    {},
  );
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "GET");
});

test("页面和静态资源仍转交 ASSETS", async () => {
  for (const path of ["/", "/styles.css", "/motion.js", "/traffic.js"]) {
    const request = new Request(`https://site.test${path}`);
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch(received) {
          assert.equal(received, request);
          return new Response("asset");
        },
      },
    });
    assert.equal(await response.text(), "asset");
  }
});
