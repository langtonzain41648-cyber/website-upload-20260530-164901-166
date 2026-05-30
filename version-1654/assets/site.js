(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        start();
      });
    });

    showSlide(0);
    start();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var list = document.querySelector("[data-search-list]");
    if (!input || !list) {
      return;
    }
    var items = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var haystack = (item.getAttribute("data-search") || "").toLowerCase();
        item.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }

  function setupPlayer() {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-player-toggle]");
    var status = shell.querySelector("[data-player-status]");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-source");

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function markReady() {
      shell.classList.add("is-ready");
    }

    if (source) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, markReady);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus("视频加载失败，请稍后重试");
            shell.classList.remove("is-ready");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", markReady, { once: true });
      } else {
        setStatus("当前浏览器暂不支持该视频播放");
      }
    }

    function togglePlayback() {
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setStatus("点击播放按钮开始播放");
          });
        }
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        togglePlayback();
      });
    }

    video.addEventListener("click", togglePlayback);
    video.addEventListener("canplay", markReady);
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      shell.classList.remove("is-playing");
    });
    video.addEventListener("ended", function () {
      shell.classList.remove("is-playing");
    });
  }

  onReady(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayer();
  });
})();
