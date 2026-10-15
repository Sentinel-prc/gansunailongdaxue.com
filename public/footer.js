for (const nav of document.querySelectorAll(".footer-links")) {
  const links = [...nav.querySelectorAll("a")];
  const center = (link) => link.offsetTop + link.offsetHeight / 2;
  function updateSeparators() {
    links.forEach((link, index) => {
      link.classList.toggle(
        "starts-row",
        index === 0 || Math.abs(center(link) - center(links[index - 1])) > 1,
      );
    });
    nav.classList.add("separators-ready");
  }
  updateSeparators();
  document.fonts.ready.then(updateSeparators);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(updateSeparators).observe(nav);
  } else {
    window.addEventListener("resize", updateSeparators);
  }
}
