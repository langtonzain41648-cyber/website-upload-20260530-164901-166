(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function initFilters() {
        var search = document.querySelector('[data-search]');
        var typeFilter = document.querySelector('[data-type-filter]');
        var sort = document.querySelector('[data-sort]');
        var container = document.querySelector('[data-card-container]');
        if (!container) {
            return;
        }
        var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
        function apply() {
            var query = normalize(search && search.value);
            var typeValue = normalize(typeFilter && typeFilter.value);
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));
                var type = normalize(card.getAttribute('data-type'));
                var matched = (!query || text.indexOf(query) !== -1) && (!typeValue || type.indexOf(typeValue) !== -1);
                card.classList.toggle('hidden-card', !matched);
            });
        }
        function sortCards() {
            if (!sort) {
                return;
            }
            var mode = sort.value;
            var sorted = cards.slice().sort(function (a, b) {
                var ay = parseInt(a.getAttribute('data-year') || '0', 10);
                var by = parseInt(b.getAttribute('data-year') || '0', 10);
                var at = a.getAttribute('data-title') || '';
                var bt = b.getAttribute('data-title') || '';
                if (mode === 'year-desc') {
                    return by - ay;
                }
                if (mode === 'year-asc') {
                    return ay - by;
                }
                if (mode === 'title') {
                    return at.localeCompare(bt, 'zh-Hans-CN');
                }
                return 0;
            });
            sorted.forEach(function (card) {
                container.appendChild(card);
            });
            cards = sorted;
            apply();
        }
        if (search) {
            search.addEventListener('input', apply);
        }
        if (typeFilter) {
            typeFilter.addEventListener('change', apply);
        }
        if (sort) {
            sort.addEventListener('change', sortCards);
        }
    }

    window.setupMoviePlayer = function (url) {
        var video = document.getElementById('movie-player');
        var button = document.getElementById('play-toggle');
        if (!video) {
            return;
        }
        var attached = false;
        var hlsInstance = null;
        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
            attached = true;
        }
        function play() {
            attach();
            if (button) {
                button.classList.add('is-hidden');
            }
            video.controls = true;
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
