const WEBSITE_ID = "ee3cbb93-6ca4-4164-8a6c-4bb22b80675d";
const DAY = 86_400_000;
const UTC8 = 8 * 60 * 60 * 1000;

export function todayStart(time = Date.now()) {
  return Math.floor((time + UTC8) / DAY) * DAY - UTC8;
}

function shareSlug(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Invalid share configuration");
  }
  const match = url.pathname.match(
    /^\/share\/([a-zA-Z0-9_-]{1,100})(?:\/[^/]+)?\/?$/,
  );
  if (
    url.origin !== "https://umami.amoe.cc" ||
    url.username ||
    url.password ||
    !match
  ) {
    throw new Error("Invalid share configuration");
  }
  return match[1];
}

function count(input) {
  const value =
    typeof input === "object" && input !== null ? input.value : input;
  if (!Number.isSafeInteger(value) || value < 0)
    throw new Error("Invalid count");
  return value;
}

export function createTrafficService({ fetcher = fetch, now = Date.now } = {}) {
  let cached;
  let flight;

  async function load(slug, time) {
    const signal = AbortSignal.timeout(8000);
    async function get(path, token) {
      const headers = { Accept: "application/json" };
      if (token) {
        headers["x-umami-share-token"] = token;
        headers["x-umami-share-context"] = "1";
      }
      const response = await fetcher(`https://umami.amoe.cc${path}`, {
        headers,
        signal,
        redirect: "manual",
      });
      if (!response.ok) throw new Error("Umami unavailable");
      const text = await response.text();
      if (text.length > 65536) throw new Error("Invalid response");
      return JSON.parse(text);
    }

    const share = await get(`/api/share/${slug}`);
    if (
      share?.websiteId !== WEBSITE_ID ||
      typeof share.token !== "string" ||
      !share.token ||
      share.token.length > 16384 ||
      (share.shareType != null && share.shareType !== 1)
    ) {
      throw new Error("Invalid website share");
    }
    async function counts(start) {
      const query = new URLSearchParams({
        startAt: String(start),
        endAt: String(time),
        timezone: "Asia/Shanghai",
      });
      const data = await get(
        `/api/websites/${WEBSITE_ID}/stats?${query}`,
        share.token,
      );
      return {
        visitors: count(data?.visitors),
        pageviews: count(data?.pageviews),
      };
    }
    const [today, total, active] = await Promise.all([
      counts(todayStart(time)),
      counts(0),
      get(`/api/websites/${WEBSITE_ID}/active`, share.token),
    ]);
    return {
      today,
      total,
      online: count(active?.visitors),
      updatedAt: new Date(time).toISOString(),
    };
  }

  return async function traffic(shareURL) {
    const slug = shareSlug(shareURL);
    const time = now();
    const key = `${slug}:${todayStart(time)}`;
    if (cached?.key === key && time < cached.until) {
      if (cached.failed) throw new Error("Umami unavailable");
      return cached.value;
    }
    if (flight?.key === key) return flight.promise;
    const current = { key };
    current.promise = load(slug, time)
      .then((value) => {
        cached = {
          key,
          value,
          until: Math.min(now() + 30000, todayStart(time) + DAY),
        };
        return value;
      })
      .catch(() => {
        cached = {
          key,
          failed: true,
          until: Math.min(now() + 5000, todayStart(time) + DAY),
        };
        throw new Error("Umami unavailable");
      })
      .finally(() => {
        if (flight === current) flight = undefined;
      });
    flight = current;
    return current.promise;
  };
}
