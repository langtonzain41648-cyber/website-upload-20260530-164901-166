document.addEventListener('DOMContentLoaded', function () {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var cover = shell.querySelector('[data-player-cover]');
  var button = shell.querySelector('[data-player-button]');
  var streamUrl = shell.getAttribute('data-stream');
  var hls = null;
  var ready = false;

  function tryPlay() {
    if (!video) {
      return;
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function bindStream() {
    if (!video || !streamUrl || ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          tryPlay();
        });
      }

      return;
    }

    video.src = streamUrl;
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
    }

    bindStream();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    tryPlay();
    window.setTimeout(tryPlay, 300);
    window.setTimeout(tryPlay, 1200);
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
});
