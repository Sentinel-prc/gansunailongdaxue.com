const scene = document.querySelector(".scene");
const go = document.querySelector(".go");
const toggle = document.querySelector(".motion-toggle");
const wipe = document.querySelector(".exit-wipe");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
let paused = false;
let exitTimer;
let pointerFrame;

function resetExit() {
  clearTimeout(exitTimer);
  scene.classList.remove("is-leaving");
}

function resetPointer() {
  cancelAnimationFrame(pointerFrame);
  scene.style.setProperty("--pointer-x", "0px");
  scene.style.setProperty("--pointer-y", "0px");
}

function renderMotion() {
  scene.classList.toggle("is-paused", paused);
  toggle.hidden = reducedMotion.matches;
  toggle.setAttribute("aria-pressed", String(paused));
  toggle.querySelector("span").textContent = paused ? "继续动效" : "暂停动效";
  if (paused || reducedMotion.matches) {
    resetPointer();
    resetExit();
  }
}

toggle.addEventListener("click", () => {
  paused = !paused;
  renderMotion();
});
reducedMotion.addEventListener("change", renderMotion);

scene.addEventListener("pointermove", (event) => {
  if (
    paused ||
    reducedMotion.matches ||
    !finePointer.matches ||
    event.pointerType === "touch"
  )
    return;
  cancelAnimationFrame(pointerFrame);
  pointerFrame = requestAnimationFrame(() => {
    const rect = scene.getBoundingClientRect();
    scene.style.setProperty(
      "--pointer-x",
      `${(event.clientX - rect.left - rect.width / 2) * 0.025}px`,
    );
    scene.style.setProperty(
      "--pointer-y",
      `${(event.clientY - rect.top - rect.height / 2) * 0.025}px`,
    );
  });
});
scene.addEventListener("pointerleave", resetPointer);

go.addEventListener("click", (event) => {
  // 保留原生链接打开方式，避免动画延迟导致新窗口被拦截。
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    paused ||
    reducedMotion.matches
  )
    return;
  resetExit();
  const button = go.getBoundingClientRect();
  const area = scene.getBoundingClientRect();
  wipe.style.left = `${button.left - area.left + button.width / 2}px`;
  wipe.style.top = `${button.top - area.top + button.height / 2}px`;
  wipe.style.setProperty(
    "--wipe-scale",
    Math.hypot(area.width, area.height) / 10,
  );
  void wipe.offsetWidth;
  scene.classList.add("is-leaving");
  exitTimer = setTimeout(resetExit, 1500);
});

document.addEventListener("visibilitychange", () => {
  scene.classList.toggle("is-hidden", document.hidden);
  if (!document.hidden) resetExit();
});
window.addEventListener("focus", resetExit);
window.addEventListener("pageshow", resetExit);

renderMotion();
scene.classList.add("is-entering");
