(function () {
  const ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(function () {
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
      const slides = Array.from(hero.querySelectorAll(".hero-slide"));
      const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
      const prev = hero.querySelector("[data-hero-prev]");
      const next = hero.querySelector("[data-hero-next]");
      let index = 0;
      let timer = null;

      const show = function (nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });

        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };

      const play = function () {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          play();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }

      play();
    }

    const searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));
    const cards = Array.from(document.querySelectorAll("[data-search-card]"));

    searchInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        const value = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          const text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-year") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();

          card.classList.toggle("is-hidden", value && text.indexOf(value) === -1);
        });
      });
    });
  });
})();

function initPlayer(videoId, buttonId, coverId, streamUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  const cover = document.getElementById(coverId);

  if (!video || !button || !cover || !streamUrl) {
    return;
  }

  let initialized = false;

  const attach = function () {
    if (initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  };

  const start = function () {
    attach();
    cover.classList.add("is-hidden");
    video.controls = true;
    const attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {});
    }
  };

  cover.addEventListener("click", start);
  button.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!initialized) {
      start();
    }
  });
}
