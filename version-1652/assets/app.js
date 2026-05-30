(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function menu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function hero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var current = 0;

    function show(index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }
  }

  function filters() {
    var input = document.querySelector("[data-filter-input]");
    var sort = document.querySelector("[data-sort-select]");
    var grid = document.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-no-result]");

    function queryFromUrl() {
      try {
        return new URLSearchParams(window.location.search).get("q") || "";
      } catch (err) {
        return "";
      }
    }

    if (input && !input.value) {
      input.value = queryFromUrl();
    }

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var shown = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var ok = !q || text.indexOf(q) !== -1;
        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });

      if (sort) {
        var mode = sort.value;
        cards.slice().sort(function (a, b) {
          if (mode === "year") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }
          if (mode === "heat") {
            return Number(b.getAttribute("data-heat") || 0) - Number(a.getAttribute("data-heat") || 0);
          }
          return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
        }).forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (sort) {
      sort.addEventListener("change", apply);
    }
    apply();
  }

  function player() {
    var video = document.querySelector("[data-player-video]");
    var button = document.querySelector("[data-player-button]");
    var raw = document.getElementById("stream-json");
    if (!video || !button || !raw) {
      return;
    }

    var media = "";
    var loaded = false;

    try {
      media = (JSON.parse(raw.textContent || "{}").media || "");
    } catch (err) {
      media = "";
    }

    function attach() {
      if (loaded || !media) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = media;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(media);
        hls.attachMedia(video);
        return;
      }
      video.src = media;
    }

    function play() {
      attach();
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
      button.classList.add("is-hidden");
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
  }

  ready(function () {
    menu();
    hero();
    filters();
    player();
  });
})();
