const stats = document.querySelector(".traffic-stats");
const refresh = document.querySelector(".traffic-refresh");
const counters = document.querySelector(".traffic-values");
const label = refresh.querySelector("span");
let busy = false;

function showState(state) {
  const loading = state === "loading";
  counters.hidden = state !== "ready";
  refresh.disabled = loading;
  stats.setAttribute("aria-busy", String(loading));
  label.textContent = loading
    ? "访问统计加载中"
    : state === "failed"
      ? "访问统计加载失败，尝试刷新"
      : "刷新";
  refresh.setAttribute(
    "aria-label",
    state === "ready" ? "刷新访问统计" : label.textContent,
  );
}

async function loadTraffic() {
  if (busy) return;
  busy = true;
  showState("loading");
  try {
    const response = await fetch("/api/traffic", {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Unavailable");
    const data = await response.json();
    const values = {
      "today-visitors": data?.today?.visitors,
      "today-pageviews": data?.today?.pageviews,
      "total-visitors": data?.total?.visitors,
      "total-pageviews": data?.total?.pageviews,
      online: data?.online,
    };
    if (
      !Object.values(values).every(
        (value) => Number.isSafeInteger(value) && value >= 0,
      )
    )
      throw new Error("Invalid counts");
    for (const [name, value] of Object.entries(values)) {
      stats.querySelector(`[data-count="${name}"]`).textContent = String(value);
    }
    showState("ready");
  } catch {
    showState("failed");
  } finally {
    busy = false;
  }
}

refresh.addEventListener("click", loadTraffic);
void loadTraffic();
