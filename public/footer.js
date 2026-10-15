for (const nav of document.querySelectorAll(".footer-links, .traffic-stats")) {
  const items = [...nav.querySelectorAll("a, .traffic-group")];
  const center = (item) => item.offsetTop + item.offsetHeight / 2;
  function updateSeparators() {
    items.forEach((item, index) => {
      item.classList.toggle(
        "starts-row",
        index === 0 || Math.abs(center(item) - center(items[index - 1])) > 1,
      );
    });
    nav.classList.add("separators-ready");
  }
  updateSeparators();
  document.fonts.ready.then(updateSeparators);
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(updateSeparators);
    observer.observe(nav);
    items.forEach((item) => observer.observe(item));
  } else {
    window.addEventListener("resize", updateSeparators);
  }
}
