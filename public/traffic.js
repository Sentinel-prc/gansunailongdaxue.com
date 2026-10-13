const stats = document.querySelector(".traffic-stats");
const refresh = document.querySelector(".traffic-refresh");
const status = document.querySelector(".traffic-status");
let busy = false;
let hasData = false;

async function loadTraffic() {
  if (busy) return;
  busy = true;
  refresh.disabled = true;
  stats.setAttribute("aria-busy", "true");
  status.hidden = true;
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
    hasData = true;
  } catch {
    status.textContent = hasData ? "刷新失败，请稍后重试" : "统计暂不可用";
    status.hidden = false;
  } finally {
    busy = false;
    refresh.disabled = false;
    stats.setAttribute("aria-busy", "false");
  }
}

refresh.hidden = false;
refresh.addEventListener("click", loadTraffic);
void loadTraffic();
