const notice = document.querySelector(".privacy-notice");
const noticeKey = "privacy-notice-version";
let acknowledged = false;

try {
  acknowledged = localStorage.getItem(noticeKey) === notice.dataset.version;
} catch {
  // 存储被禁用时，提示仍可在本次访问中关闭。
}

function reserveSpace() {
  document.documentElement.style.setProperty(
    "--notice-space",
    `${notice.hidden ? 0 : notice.getBoundingClientRect().height + 32}px`,
  );
}

if (!acknowledged) {
  notice.hidden = false;
  document.body.classList.add("notice-open");
  reserveSpace();
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(reserveSpace).observe(notice);
  } else {
    window.addEventListener("resize", reserveSpace);
  }
}

notice.querySelector("button").addEventListener("click", () => {
  try {
    localStorage.setItem(noticeKey, notice.dataset.version);
  } catch {
    // 不影响关闭按钮及其他页面功能。
  }
  notice.hidden = true;
  document.body.classList.remove("notice-open");
  reserveSpace();
});
