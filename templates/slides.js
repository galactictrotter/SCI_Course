(() => {
  const stage = document.querySelector('.deck-stage');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const navigation = document.querySelector('.deck-navigation');
  const menuToggle = document.querySelector('#lesson-menu-toggle');
  const lessonMenu = document.querySelector('#lesson-menu');
  const sectionSelect = document.querySelector('#section-select');
  const firstSlide = document.querySelector('#first-slide');
  const lastSlide = document.querySelector('#last-slide');
  const previousSlide = document.querySelector('#previous-slide');
  const nextSlide = document.querySelector('#next-slide');
  const sectionStarts = Array.from(sectionSelect.options, option => Number(option.value));
  let index = 0;

  const closeMenu = (restoreFocus = false) => {
    lessonMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuToggle.focus();
  };

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
    closeMenu();
    index = clamp(nextIndex);
    sectionSelect.value = String(sectionStarts.filter(start => start <= index + 1).at(-1));
    firstSlide.disabled = previousSlide.disabled = index === 0;
    lastSlide.disabled = nextSlide.disabled = index === slides.length - 1;
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

  menuToggle.addEventListener('click', () => {
    const opening = lessonMenu.hidden;
    closeMenu();
    if (opening) {
      lessonMenu.hidden = false;
      menuToggle.setAttribute('aria-expanded', 'true');
      const current = lessonMenu.querySelector('[aria-current="page"]') || lessonMenu.querySelector('a');
      current?.focus({ preventScroll: true });
      current?.scrollIntoView({ block: 'nearest' });
    }
  });
  lessonMenu.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link?.getAttribute('aria-current') === 'page') {
      event.preventDefault();
      closeMenu(true);
      show(0);
    }
  });
  firstSlide.addEventListener('click', () => show(0));
  lastSlide.addEventListener('click', () => show(slides.length - 1));
  previousSlide.addEventListener('click', () => show(index - 1));
  nextSlide.addEventListener('click', () => show(index + 1));
  sectionSelect.addEventListener('change', () => show(Number(sectionSelect.value) - 1));
  document.addEventListener('click', event => {
    if (!navigation.contains(event.target)) closeMenu();
  });
  document.addEventListener('focusin', event => {
    if (!navigation.contains(event.target)) closeMenu();
  });
  lessonMenu.addEventListener('keydown', event => {
    const links = Array.from(lessonMenu.querySelectorAll('a'));
    const current = links.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = Math.min(current + 1, links.length - 1);
    if (event.key === 'ArrowUp') next = Math.max(current - 1, 0);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = links.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      links[next]?.focus();
    }
  });

  window.addEventListener('resize', scaleStage);
  window.addEventListener('hashchange', () => show(indexFromHash(), false));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lessonMenu.hidden) {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    // Keep arrow navigation working when switching between clicks and the keyboard.
    const slideArrow = ['ArrowLeft', 'ArrowRight'].includes(event.key) &&
      event.target.closest('#first-slide, #previous-slide, #next-slide, #last-slide');
    // Native dropdowns, links and other button keys keep their normal behavior.
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
        (!slideArrow && event.target.closest('button, select, input, textarea, a, [contenteditable="true"]'))) return;
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
