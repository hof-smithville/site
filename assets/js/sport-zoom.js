(function () {
  var overlay = document.getElementById("sport-zoom");
  if (!overlay) return;

  var zoomImg = document.getElementById("sport-zoom-img");
  var zoomName = document.getElementById("sport-zoom-name");

  function close() {
    overlay.hidden = true;
    zoomImg.src = "";
  }

  document.querySelectorAll("[data-sport-zoom]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var icon = btn.querySelector("img");
      if (!icon) return;
      zoomImg.src = icon.src;
      zoomImg.alt = icon.alt;
      zoomName.textContent = icon.alt;
      overlay.hidden = false;
    });
  });

  overlay.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) close();
  });
})();
