(function () {
  var mascot = document.getElementById("mascot");
  if (!mascot) return;

  var img = mascot.querySelector("[data-mascot-img]");
  var video = mascot.querySelector("[data-mascot-video]");
  var hint = mascot.querySelector("[data-mascot-hint]");
  var canHover = window.matchMedia("(hover: hover)").matches;
  var playing = false;

  function setHint(text) {
    if (hint) hint.textContent = text;
  }

  function showImage(src) {
    img.hidden = false;
    video.hidden = true;
    video.pause();
    img.src = src;
  }

  function playVideo() {
    img.hidden = true;
    video.hidden = false;
    video.currentTime = 0;
    video.play().catch(function () {});
  }

  if (canHover) {
    mascot.addEventListener("mouseenter", function () {
      if (!playing) {
        showImage(img.dataset.hover);
        setHint("Click to play");
      }
    });
    mascot.addEventListener("mouseleave", function () {
      if (!playing) {
        showImage(img.dataset.rest);
        setHint("Hover · click to play");
      }
    });
  }

  mascot.addEventListener("click", function () {
    playing = !playing;
    if (playing) {
      playVideo();
      setHint("Click to stop");
    } else {
      showImage(img.dataset.rest);
      setHint(canHover ? "Hover · click to play" : "Tap to play");
    }
  });
})();
