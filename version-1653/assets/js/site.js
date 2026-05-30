(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const carousel = document.querySelector("[data-carousel]");
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
        let index = 0;
        let timer = null;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                if (timer) {
                    window.clearInterval(timer);
                }
                start();
            });
        });

        show(0);
        start();
    }

    const searchInput = document.querySelector("[data-page-search]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const emptyState = document.querySelector("[data-empty-state]");
    const filters = Array.from(document.querySelectorAll("[data-filter]"));
    let activeFilter = "all";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
        const query = normalize(searchInput ? searchInput.value : "");
        let visible = 0;

        cards.forEach(function (card) {
            const haystack = normalize((card.dataset.title || "") + " " + (card.dataset.meta || ""));
            const matchQuery = !query || haystack.indexOf(query) !== -1;
            const matchFilter = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
            const show = matchQuery && matchFilter;
            card.classList.toggle("hidden-by-filter", !show);
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    if (searchInput) {
        if (searchInput.hasAttribute("data-url-query")) {
            const params = new URLSearchParams(window.location.search);
            const value = params.get("q");
            if (value) {
                searchInput.value = value;
            }
        }
        searchInput.addEventListener("input", applyFilter);
    }

    filters.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.dataset.filter || "all";
            filters.forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            applyFilter();
        });
    });

    if (cards.length && (searchInput || filters.length)) {
        applyFilter();
    }
}());
