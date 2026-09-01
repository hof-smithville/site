(function () {
  document.querySelectorAll("[data-moving-portrait]").forEach(function (el) {
    var img = el.querySelector("[data-portrait-img]");
    var video = el.querySelector("[data-portrait-video]");
    if (!img || !video) return;

    var canHover = window.matchMedia("(hover: hover)").matches;

    function play() {
      img.hidden = true;
      video.hidden = false;
      video.currentTime = 0;
      video.play().catch(function () {});
    }

    function stop() {
      video.pause();
      video.hidden = true;
      img.hidden = false;
    }

    if (canHover) {
      el.addEventListener("mouseenter", play);
      el.addEventListener("mouseleave", stop);
    } else {
      var playing = false;
      el.addEventListener("click", function () {
        playing = !playing;
        if (playing) play();
        else stop();
      });
    }
  });
})();
