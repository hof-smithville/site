(function () {
  var mascot = document.getElementById("mascot");
  if (!mascot) return;

  var img = mascot.querySelector("[data-mascot-img]");
  var hint = mascot.querySelector("[data-mascot-hint]");
  var canHover = window.matchMedia("(hover: hover)").matches;

  function setHint(text) {
    if (hint) hint.textContent = text;
  }

  if (canHover) {
    mascot.addEventListener("mouseenter", function () {
      img.src = img.dataset.hover;
      setHint("Click to watch");
    });
    mascot.addEventListener("mouseleave", function () {
      img.src = img.dataset.rest;
      setHint("Hover · click to watch");
    });
  } else {
    setHint("Tap to watch");
  }

  mascot.addEventListener("click", function () {
    window.open(mascot.dataset.videoSrc, "_blank", "noopener");
  });
})();
