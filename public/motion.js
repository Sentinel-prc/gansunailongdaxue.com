const scene = document.querySelector(".scene");
const go = document.querySelector(".go");
const wipe = document.querySelector(".exit-wipe");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
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
  if (reducedMotion.matches) {
    resetPointer();
    resetExit();
  }
}

reducedMotion.addEventListener("change", renderMotion);

function arrowDirection(x = Math.SQRT1_2, y = -Math.SQRT1_2) {
  const angle = Math.atan2(y, x);
  const rotation = (((angle * 180) / Math.PI + 45 + 540) % 360) - 180;
  go.style.setProperty("--arrow-x", `${Math.cos(angle) * 6}px`);
  go.style.setProperty("--arrow-y", `${Math.sin(angle) * 6}px`);
  go.style.setProperty("--arrow-exit-x", `${Math.cos(angle) * 56}px`);
  go.style.setProperty("--arrow-exit-y", `${Math.sin(angle) * 56}px`);
  go.style.setProperty("--arrow-rotation", `${rotation}deg`);
}

go.addEventListener("pointerenter", (event) => {
  if (!finePointer.matches || event.pointerType === "touch") return;
  const rect = go.getBoundingClientRect();
  arrowDirection(
    (event.clientX - rect.left - rect.width / 2) / rect.width,
    (event.clientY - rect.top - rect.height / 2) / rect.height,
  );
});
go.addEventListener("focus", () => {
  if (go.matches(":focus-visible")) arrowDirection();
});

scene.addEventListener("pointermove", (event) => {
  if (
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
