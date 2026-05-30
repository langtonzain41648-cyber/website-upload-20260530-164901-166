(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    };

    const restart = function () {
      window.clearInterval(timer);
      start();
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  }

  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    const input = panel.querySelector('[data-card-search]');
    const buttons = Array.from(panel.querySelectorAll('[data-filter]'));
    const scope = panel.closest('section') || document;
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    let activeType = 'all';

    const apply = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        const type = card.getAttribute('data-type') || '';
        const title = card.getAttribute('data-title') || '';
        const region = card.getAttribute('data-region') || '';
        const year = card.getAttribute('data-year') || '';
        const searchable = (title + ' ' + region + ' ' + type + ' ' + year).toLowerCase();
        const typeMatched = activeType === 'all' || type === activeType;
        const keywordMatched = !keyword || searchable.indexOf(keyword) !== -1;
        card.classList.toggle('hidden', !(typeMatched && keywordMatched));
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
  });
})();
