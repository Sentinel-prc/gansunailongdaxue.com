import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

async function openPage(storage = new Map(), blocked = false) {
  let confirm;
  const notice = {
    hidden: true,
    dataset: { version: "2026-10-15" },
    getBoundingClientRect: () => ({ height: 160 }),
    querySelector: () => ({
      addEventListener: (_, listener) => {
        confirm = listener;
      },
    }),
  };
  const classes = new Set();
  const context = {
    document: {
      querySelector: () => notice,
      body: {
        classList: {
          add: (name) => classes.add(name),
          remove: (name) => classes.delete(name),
        },
      },
      documentElement: { style: { setProperty() {} } },
    },
    window: { addEventListener() {} },
    localStorage: {
      getItem(key) {
        if (blocked) throw new Error("Storage blocked");
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        if (blocked) throw new Error("Storage blocked");
        storage.set(key, value);
      },
    },
  };
  runInNewContext(
    await readFile(new URL("../public/notice.js", import.meta.url), "utf8"),
    context,
  );
  return { notice, classes, confirm: () => confirm() };
}

test("首次展示提示，确认后关闭并在下次访问记住", async () => {
  const storage = new Map();
  const first = await openPage(storage);
  assert.equal(first.notice.hidden, false);
  first.confirm();
  assert.equal(first.notice.hidden, true);
  assert.equal(first.classes.size, 0);
  assert.equal((await openPage(storage)).notice.hidden, true);
});

test("旧版本记录不会阻止展示更新后的提示", async () => {
  const storage = new Map();
  (await openPage(storage)).confirm();
  for (const key of storage.keys()) storage.set(key, "old-version");
  assert.equal((await openPage(storage)).notice.hidden, false);
});

test("本地存储被禁用时仍可展示并关闭提示", async () => {
  const page = await openPage(new Map(), true);
  assert.equal(page.notice.hidden, false);
  assert.doesNotThrow(page.confirm);
  assert.equal(page.notice.hidden, true);
});
