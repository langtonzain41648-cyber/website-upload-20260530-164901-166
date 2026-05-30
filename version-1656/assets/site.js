(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function() {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener("click", function() {
                mobileMenu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll(".hero-carousel").forEach(function(carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
            var prev = carousel.querySelector(".hero-arrow.prev");
            var next = carousel.querySelector(".hero-arrow.next");
            var index = 0;
            var timer;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function(slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function(dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function startTimer() {
                clearInterval(timer);
                timer = setInterval(function() {
                    show(index + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function() {
                    show(index - 1);
                    startTimer();
                });
            }

            if (next) {
                next.addEventListener("click", function() {
                    show(index + 1);
                    startTimer();
                });
            }

            dots.forEach(function(dot, i) {
                dot.addEventListener("click", function() {
                    show(i);
                    startTimer();
                });
            });

            show(0);
            startTimer();
        });

        document.querySelectorAll(".js-card-search").forEach(function(input) {
            var scope = input.closest("section") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var typeSelect = scope.querySelector(".js-filter-select");
            var sortSelect = scope.querySelector(".js-year-sort");
            var grid = scope.querySelector(".movie-grid");

            function applyFilters() {
                var query = input.value.trim().toLowerCase();
                var typeValue = typeSelect ? typeSelect.value : "";
                cards.forEach(function(card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var type = card.getAttribute("data-type") || "";
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchType = !typeValue || type === typeValue;
                    card.classList.toggle("is-hidden-card", !(matchQuery && matchType));
                });
            }

            function applySort() {
                if (!grid || !sortSelect) {
                    return;
                }
                var value = sortSelect.value;
                if (value === "default") {
                    cards.sort(function(a, b) {
                        return Number(a.getAttribute("data-order") || 0) - Number(b.getAttribute("data-order") || 0);
                    });
                } else {
                    cards.sort(function(a, b) {
                        var ay = Number(a.getAttribute("data-year") || 0);
                        var by = Number(b.getAttribute("data-year") || 0);
                        return value === "new" ? by - ay : ay - by;
                    });
                }
                cards.forEach(function(card) {
                    grid.appendChild(card);
                });
                applyFilters();
            }

            input.addEventListener("input", applyFilters);
            if (typeSelect) {
                typeSelect.addEventListener("change", applyFilters);
            }
            if (sortSelect) {
                sortSelect.addEventListener("change", applySort);
            }
        });

        document.querySelectorAll("[data-player]").forEach(function(shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".player-poster");
            var hls;

            function bindStream() {
                if (!video) {
                    return;
                }
                var streamUrl = video.getAttribute("data-m3u8");
                if (!streamUrl || video.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls();
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                video.setAttribute("data-ready", "1");
                video.setAttribute("controls", "controls");
            }

            function playVideo() {
                bindStream();
                if (button) {
                    button.classList.add("is-hidden");
                }
                if (video) {
                    video.play().catch(function() {});
                }
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }

            if (video) {
                video.addEventListener("click", function() {
                    if (video.paused) {
                        playVideo();
                    } else {
                        video.pause();
                    }
                });
            }
        });
    });
})();
