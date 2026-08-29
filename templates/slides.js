(() => {
  const stage = document.querySelector('.deck-stage');
  const slides = Array.from(document.querySelectorAll('.slide'));
  let index = 0;

  const clamp = (value) => Math.max(0, Math.min(slides.length - 1, value));

  const indexFromHash = () => {
    const match = window.location.hash.match(/^#\/(\d+)$/);
    return match ? clamp(Number(match[1]) - 1) : 0;
  };

  const scaleStage = () => {
    const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 1000);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  };

  const checkOverflow = () => {
    const failures = [];
    document.querySelectorAll('[data-overflow-check]').forEach((element) => {
      const overflow = element.scrollHeight > element.clientHeight + 1 ||
        element.scrollWidth > element.clientWidth + 1;
      element.classList.toggle('overflow-warning', overflow);
      if (overflow) failures.push(element.closest('.slide')?.dataset.slideId || 'unknown');
    });
    return failures;
  };

  const show = (nextIndex, updateHash = true) => {
    index = clamp(nextIndex);
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if (updateHash) history.replaceState(null, '', `#/${index + 1}`);
    document.title = `${slides[index].dataset.slideTitle} — ${index + 1}/${slides.length}`;
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  };

  window.addEventListener('resize', scaleStage);
  window.addEventListener('hashchange', () => show(indexFromHash(), false));
  window.addEventListener('keydown', (event) => {
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(event.key)) {
      event.preventDefault();
      show(index + 1);
    } else if (['ArrowLeft', 'ArrowUp', 'Backspace', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      show(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      show(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      show(slides.length - 1);
    } else if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      toggleFullscreen();
    }
  });

  window.deckQA = {
    slideCount: slides.length,
    currentSlide: () => index + 1,
    overflows: checkOverflow,
    show: (slideNumber) => show(slideNumber - 1)
  };

  scaleStage();
  show(indexFromHash(), false);
  document.fonts.ready.then(checkOverflow);
})();
