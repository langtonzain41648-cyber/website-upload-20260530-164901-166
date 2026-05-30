const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initMobileMenu() {
    const toggle = $('[data-mobile-toggle]');
    const menu = $('[data-mobile-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
        const open = !menu.classList.contains('is-open');
        menu.classList.toggle('is-open', open);
        toggle.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
    });
}

function initHero() {
    const slides = $$('[data-hero-slide]');
    const dots = $$('[data-hero-dot]');
    const next = $('[data-hero-next]');
    const prev = $('[data-hero-prev]');
    if (!slides.length) return;
    let index = 0;
    let timer = null;
    const show = (value) => {
        index = (value + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };
    const play = () => {
        clearInterval(timer);
        timer = setInterval(() => show(index + 1), 5000);
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => {
        show(i);
        play();
    }));
    if (next) next.addEventListener('click', () => {
        show(index + 1);
        play();
    });
    if (prev) prev.addEventListener('click', () => {
        show(index - 1);
        play();
    });
    play();
}

function initCategoryFilter() {
    const input = $('[data-category-filter]');
    const year = $('[data-year-filter]');
    const cards = $$('[data-movie-card]');
    if (!input || !cards.length) return;
    const run = () => {
        const keyword = input.value.trim().toLowerCase();
        const yearValue = year ? year.value : '';
        cards.forEach((card) => {
            const text = (card.getAttribute('data-search') || '').toLowerCase();
            const cardYear = card.getAttribute('data-year') || '';
            const matched = (!keyword || text.includes(keyword)) && (!yearValue || cardYear === yearValue);
            card.classList.toggle('is-filtered-out', !matched);
        });
    };
    input.addEventListener('input', run);
    if (year) year.addEventListener('change', run);
}

function initSearchPage() {
    const input = $('#searchInput');
    const region = $('#searchRegion');
    const type = $('#searchType');
    const results = $('#searchResults');
    const status = $('#searchStatus');
    if (!input || !results || !window.SEARCH_MOVIES) return;
    const createCard = (movie) => {
        const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
        return `<a class="movie-card" href="${movie.href}">
    <span class="poster-wrap">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="poster-overlay"><svg class="icon-play" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span>
    </span>
    <span class="movie-card-body">
        <strong>${escapeHtml(movie.title)}</strong>
        <span class="movie-meta">${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.type)}</span>
        <span class="movie-desc">${escapeHtml(movie.oneLine)}</span>
        <span class="tag-row">${tags}</span>
    </span>
</a>`;
    };
    const render = () => {
        const keyword = input.value.trim().toLowerCase();
        const regionValue = region ? region.value : '';
        const typeValue = type ? type.value : '';
        const filtered = window.SEARCH_MOVIES.filter((movie) => {
            const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' ')].join(' ').toLowerCase();
            return (!keyword || text.includes(keyword)) && (!regionValue || movie.region === regionValue) && (!typeValue || movie.type === typeValue);
        }).slice(0, 120);
        results.innerHTML = filtered.map(createCard).join('');
        status.textContent = filtered.length ? `搜索结果：${filtered.length} 部影片` : '暂无匹配影片';
    };
    input.addEventListener('input', render);
    if (region) region.addEventListener('change', render);
    if (type) type.addEventListener('change', render);
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
    }[char]));
}

function initImages() {
    $$('img').forEach((img) => {
        img.addEventListener('error', () => {
            img.style.opacity = '0';
        }, { once: true });
    });
}

function initPlayer() {
    const holder = $('[data-player-src]');
    const video = $('[data-player]');
    const button = $('[data-player-button]');
    if (!holder || !video || !button) return;
    const source = holder.getAttribute('data-player-src');
    let ready = false;
    let hls = null;
    const load = () => {
        if (!ready) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ maxBufferLength: 30 });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            ready = true;
        }
        button.classList.add('is-hidden');
        video.controls = true;
        const result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(() => {
                button.classList.remove('is-hidden');
            });
        }
    };
    button.addEventListener('click', load);
    video.addEventListener('click', () => {
        if (!ready || video.paused) load();
    });
    window.addEventListener('beforeunload', () => {
        if (hls) hls.destroy();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHero();
    initCategoryFilter();
    initSearchPage();
    initImages();
    initPlayer();
});
