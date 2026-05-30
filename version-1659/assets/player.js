(function () {
  window.initMoviePlayer = function (options) {
    const video = document.getElementById(options.videoId);
    const cover = document.getElementById(options.coverId);
    const button = document.getElementById(options.buttonId);
    const source = options.source;
    let attached = false;

    if (!video || !source) {
      return;
    }

    const attach = function () {
      if (attached) {
        return Promise.resolve();
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return Promise.resolve();
      }

      video.src = source;
      return Promise.resolve();
    };

    const start = function () {
      attach().then(function () {
        if (cover) {
          cover.classList.add('hidden');
        }
        const playing = video.play();
        if (playing && typeof playing.catch === 'function') {
          playing.catch(function () {});
        }
      });
    };

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  };
})();
