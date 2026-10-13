const audioIndex =
  "https://cdn.amoe.cc/web-static/private/tomyjan-website/nailong/audio/index.json";
const clips = [];
let playing;

async function preloadAudio() {
  try {
    const response = await fetch(audioIndex, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return;
    const index = await response.json();
    if (!Array.isArray(index.audio)) return;
    await Promise.allSettled(
      [...new Set(index.audio)].map(async (source) => {
        if (typeof source !== "string") return;
        const url = new URL(source, audioIndex);
        if (url.protocol !== "https:") return;
        const response = await fetch(url, {
          signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) return;
        const audio = new Audio();
        audio.preload = "auto";
        audio.volume = 0.36;
        audio.src = URL.createObjectURL(await response.blob());
        audio.load();
        clips.push(audio);
      }),
    );
  } catch {
    // 音频为可选交互，失败时不打扰页面使用。
  }
}

function scheduleAudio() {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => void preloadAudio(), { timeout: 2000 });
  } else {
    setTimeout(() => void preloadAudio(), 0);
  }
}

if (document.readyState === "complete") scheduleAudio();
else window.addEventListener("load", scheduleAudio, { once: true });

document.querySelector(".logo-wrap").addEventListener("click", () => {
  if (!clips.length) return;
  if (playing) {
    playing.pause();
    playing.currentTime = 0;
  }
  playing = clips[Math.floor(Math.random() * clips.length)];
  void playing.play().catch(() => {});
});
