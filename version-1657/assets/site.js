(function () {
    var mobileToggle = document.querySelector('.mobile-toggle');
    var mobileMenu = document.querySelector('.mobile-menu');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            var open = mobileMenu.classList.toggle('is-open');
            mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.getElementById('heroSlider');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var current = 0;
        var timer;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        startTimer();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applySearch(input) {
        var scope = document.querySelector('.movie-filter-scope');

        if (!scope) {
            return;
        }

        var keyword = normalize(input.value);
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || ''));
            var match = !keyword || text.indexOf(keyword) !== -1;
            card.style.display = match ? '' : 'none';
            if (match) {
                visible += 1;
            }
        });

        scope.classList.toggle('is-empty', visible === 0);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    searchInputs.forEach(function (input) {
        if (query && !input.value) {
            input.value = query;
        }
        input.addEventListener('input', function () {
            applySearch(input);
        });
        applySearch(input);
    });

    var playerBox = document.querySelector('.player-box');

    if (playerBox) {
        var video = playerBox.querySelector('video');
        var startButton = playerBox.querySelector('.player-start');
        var stream = playerBox.getAttribute('data-stream');
        var started = false;
        var requestedPlay = false;
        var hlsInstance = null;

        function revealButton() {
            if (startButton && !requestedPlay) {
                startButton.classList.remove('is-hidden');
            }
        }

        function beginPlayback() {
            if (!video) {
                return;
            }
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {
                    requestedPlay = false;
                    revealButton();
                });
            }
        }

        function loadVideo() {
            if (!video || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', stream);
                }
            } else if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (requestedPlay) {
                            beginPlayback();
                        }
                    });
                }
            } else if (!video.getAttribute('src')) {
                video.setAttribute('src', stream);
            }
        }

        function startVideo() {
            requestedPlay = true;
            started = true;
            loadVideo();
            beginPlayback();
        }

        if (startButton) {
            startButton.addEventListener('click', startVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started || video.paused) {
                    startVideo();
                }
            });
            video.addEventListener('play', function () {
                if (startButton) {
                    startButton.classList.add('is-hidden');
                }
            });
        }
    }
}());
