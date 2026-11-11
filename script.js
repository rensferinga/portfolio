const updateClock = () => {
  const now = new Date();
  const el = document.getElementById('local-clock');
  if (!el) return;

  const time = now.toLocaleTimeString('en-GB', {
    hour12: false,
    timeZone: 'UTC'
  });

  el.textContent = time;
};

const viewAutoplayVideos = Array.from(document.querySelectorAll('[data-play-when-visible]'));
viewAutoplayVideos.forEach((video) => {
  const startTime = Number(video.dataset.startTime);
  if (!Number.isFinite(startTime) || startTime <= 0) return;

  const seekToStart = () => {
    if (video.duration > startTime) video.currentTime = startTime;
  };

  video.addEventListener('loadedmetadata', seekToStart);
  video.addEventListener('ended', () => {
    const loopFrom = Number(video.dataset.loopFrom);
    if (!Number.isFinite(loopFrom) || loopFrom < 0 || loopFrom >= video.duration) return;
    video.currentTime = loopFrom;
    const playback = video.play();
    if (playback) {
      playback.catch((error) => {
        if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
          console.error(`Unable to replay the ${video.getAttribute('aria-label') || 'project'} video.`, error);
        }
      });
    }
  });
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) seekToStart();
});

if (viewAutoplayVideos.length > 0) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        const playback = video.play();
        if (playback) {
          playback.catch((error) => {
            if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
              console.error(`Unable to autoplay the ${video.getAttribute('aria-label') || 'project'} video.`, error);
            }
          });
        }
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.35 });

  viewAutoplayVideos.forEach((video) => videoObserver.observe(video));
}

const slides = Array.from(document.querySelectorAll('.slide'));
const dots = Array.from(document.querySelectorAll('.pagination .dot'));
const track = document.querySelector('.carousel-track');
const artworkSources = [
  'Images/HeaderAnimatie.png',
  'Images/HorrorStories3.png',
  'Images/DesignChallenge (4).jpeg',
  'Images/GlasTeVer (13).png'
];
const artworkCaptions = [
  'Animation: Verbeelding, 2026',
  'Game: Horror Stories, 2026',
  'Design Challenge: Tomorrowland, 2026',
  'Game: Een Glas Te Ver, 2025'
];

let currentIndex = 0;

const showSlide = (index) => {
  if (!track || slides.length === 0) return;

  currentIndex = (index + slides.length) % slides.length;
  track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === currentIndex);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
};

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    showSlide(Number(dot.dataset.index));
  });
});

const carousel = document.querySelector('.feature-carousel');
if (carousel) {
  slides.forEach((slide) => {
    const index = Number(slide.dataset.viewerIndex);
    slide.tabIndex = 0;
    slide.setAttribute('role', 'button');
    slide.setAttribute('aria-label', `Open image ${index + 1} full screen`);
    slide.addEventListener('click', () => {
      window.location.href = `viewer.html?slide=${index}`;
    });
    slide.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.location.href = `viewer.html?slide=${index}`;
      }
    });
  });

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') showSlide(currentIndex + 1);
    if (event.key === 'ArrowLeft') showSlide(currentIndex - 1);
  });
}

const fullscreenViewer = document.querySelector('.fullscreen-viewer');
if (fullscreenViewer) {
  const image = fullscreenViewer.querySelector('.fullscreen-image');
  const caption = fullscreenViewer.querySelector('.viewer-caption');
  const previousButton = fullscreenViewer.querySelector('.viewer-previous');
  const nextButton = fullscreenViewer.querySelector('.viewer-next');
  const closeButton = fullscreenViewer.querySelector('.viewer-close');
  const requestedIndex = Number(new URLSearchParams(window.location.search).get('slide'));
  let viewerIndex = Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < artworkSources.length
    ? requestedIndex
    : 0;
  let transitionTimeout;

  const showFullscreenSlide = (index) => {
    viewerIndex = (index + artworkSources.length) % artworkSources.length;
    fullscreenViewer.classList.add('is-changing');

    window.clearTimeout(transitionTimeout);
    transitionTimeout = window.setTimeout(() => {
      image.src = artworkSources[viewerIndex];
      image.alt = `Portfolio artwork ${viewerIndex + 1} of ${artworkSources.length}`;
      caption.textContent = artworkCaptions[viewerIndex];
      previousButton.hidden = viewerIndex === 0;

      requestAnimationFrame(() => {
        transitionTimeout = window.setTimeout(() => {
          fullscreenViewer.classList.remove('is-changing');
        }, 70);
      });
    }, 140);
  };

  previousButton.addEventListener('click', () => showFullscreenSlide(viewerIndex - 1));
  nextButton.addEventListener('click', () => showFullscreenSlide(viewerIndex + 1));
  closeButton.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') window.location.href = 'index.html';
    if (event.key === 'ArrowRight') showFullscreenSlide(viewerIndex + 1);
    if (event.key === 'ArrowLeft' && viewerIndex > 0) showFullscreenSlide(viewerIndex - 1);
  });

  showFullscreenSlide(viewerIndex);
}

updateClock();
setInterval(updateClock, 1000);
showSlide(0);
