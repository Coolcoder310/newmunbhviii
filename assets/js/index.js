document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     Sticky header shadow on scroll
     ===================================================== */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =====================================================
     Mobile nav toggle
     ===================================================== */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  function setNavOpen(isOpen) {
    mainNav.classList.toggle('is-open', isOpen);
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  navToggle.addEventListener('click', () => {
    setNavOpen(!mainNav.classList.contains('is-open'));
  });

  // Close mobile nav when a link is tapped
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      setNavOpen(false);
    });
  });

  /* =====================================================
     Active nav link on scroll (scrollspy)
     ===================================================== */
  const sections = ['top', 'councils', 'oc', 'faq', 'gallery']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(mainNav.querySelectorAll('.nav-link'));

  const setActiveLink = (id) => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  if ('IntersectionObserver' in window && sections.length) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(section => spyObserver.observe(section));
  }

  /* =====================================================
     Scroll reveal animations
     ===================================================== */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* =====================================================
     Countdown timer
     Set TARGET_DATE to the real conference start date/time.
     Currently defaults to 1 day, 2 hours, 3 minutes, 4 seconds
     from page load to match the design mock.
     ===================================================== */
  const TARGET_DATE = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(d.getHours() + 2);
    d.setMinutes(d.getMinutes() + 3);
    d.setSeconds(d.getSeconds() + 4);
    return d;
  })();

  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
  };

  const pad = (n) => String(Math.max(n, 0)).padStart(2, '0');

  /* -----------------------------------------------------
     Odometer digit reel
     Each countdown-num becomes two stacked "reels" (tens
     and units). Each reel holds a vertical strip of 0-9.
     Rolling to a new digit slides the strip down so the
     new digit drops into place, like a mechanical odometer.
     ----------------------------------------------------- */
  function buildReel(container) {
    // Build one reel with digits 0-9 stacked, tallest first for downward roll
    const strip = document.createElement('div');
    strip.className = 'digit-reel-strip';
    for (let i = 0; i <= 9; i++) {
      const span = document.createElement('span');
      span.textContent = i;
      strip.appendChild(span);
    }
    const reel = document.createElement('div');
    reel.className = 'digit-reel';
    reel.appendChild(strip);
    reel.dataset.current = '0';
    container.appendChild(reel);
    return reel;
  }

  function initDigitDisplay(container) {
    container.textContent = '';
    const tens = buildReel(container);
    const units = buildReel(container);
    return { tens, units };
  }

  function setReel(reel, digit) {
    if (reel.dataset.current === String(digit)) return;
    reel.dataset.current = String(digit);
    const strip = reel.querySelector('.digit-reel-strip');
    // Each digit cell is 1.3em tall; shift the strip up by that many cells
    strip.style.transform = `translateY(-${digit * 1.3}em)`;
  }

  function setDigits(reels, value) {
    const str = pad(value);
    setReel(reels.tens, str[0]);
    setReel(reels.units, str[1]);
  }

  const reels = {
    days: els.days ? initDigitDisplay(els.days) : null,
    hours: els.hours ? initDigitDisplay(els.hours) : null,
    mins: els.mins ? initDigitDisplay(els.mins) : null,
    secs: els.secs ? initDigitDisplay(els.secs) : null,
  };

  function updateCountdown() {
    const now = new Date();
    let diff = Math.max(TARGET_DATE - now, 0);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);
    const secs = Math.floor(diff / 1000);

    if (reels.days) setDigits(reels.days, days);
    if (reels.hours) setDigits(reels.hours, hours);
    if (reels.mins) setDigits(reels.mins, mins);
    if (reels.secs) setDigits(reels.secs, secs);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* =====================================================
     FAQ accordion
     ===================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // close all others (single-open accordion, matches design)
      faqItems.forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

});


/* =====================================================
   gemini code below!
   ===================================================== */



   /* =====================================================
     Modal / Popup Handler (Councils & OC)
     ===================================================== */
  const modalTriggers = document.querySelectorAll('.modal-trigger');
  const modalBackdrop = document.getElementById('modalBackdrop');

  function openModal(modalId) {
    if (!modalBackdrop) return;
    const targetModal = document.getElementById(modalId);
    if (!targetModal) return;

    // Hide all modals first
    modalBackdrop.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    
    // Show target modal
    targetModal.style.display = 'block';
    modalBackdrop.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  modalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modalId = btn.getAttribute('data-modal');
      openModal(modalId);
    });
  });

  if (modalBackdrop) {
    modalBackdrop.querySelectorAll('.modal-close').forEach(closeBtn => {
      closeBtn.addEventListener('click', closeModal);
    });

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  /* =====================================================
     Gallery Slider Handler
     ===================================================== */
  const sliderTrack = document.getElementById('sliderTrack');
  const prevBtn = document.getElementById('slidePrev');
  const nextBtn = document.getElementById('slideNext');

  if (sliderTrack && prevBtn && nextBtn) {
    let currentSlide = 0;

    const getVisibleCards = () => {
      if (window.innerWidth <= 650) return 1;
      if (window.innerWidth <= 960) return 2;
      return 3;
    };

    const updateSlider = () => {
      const cards = sliderTrack.querySelectorAll('.gallery-card');
      const maxSlide = cards.length - getVisibleCards();
      currentSlide = Math.max(0, Math.min(currentSlide, maxSlide));

      const cardWidth = cards[0].offsetWidth + 28; // card width + gap
      sliderTrack.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
    };

    nextBtn.addEventListener('click', () => {
      currentSlide++;
      updateSlider();
    });

    prevBtn.addEventListener('click', () => {
      currentSlide--;
      updateSlider();
    });

    window.addEventListener('resize', updateSlider);
  }

  /* =====================================================
     Gallery External Album Link Popup
     ===================================================== */
  const galleryLinkBtns = document.querySelectorAll('.gallery-link-btn:not([disabled])');
  const galleryModalBackdrop = document.getElementById('galleryModalBackdrop');
  const galleryModalClose = document.getElementById('galleryModalClose');
  const confirmAlbumBtn = document.getElementById('confirmAlbumBtn');

  if (galleryModalBackdrop) {
    galleryLinkBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-link');
        if (confirmAlbumBtn) confirmAlbumBtn.setAttribute('href', url);
        galleryModalBackdrop.classList.add('is-active');
      });
    });

    const closeGalleryModal = () => galleryModalBackdrop.classList.remove('is-active');

    if (galleryModalClose) galleryModalClose.addEventListener('click', closeGalleryModal);
    galleryModalBackdrop.addEventListener('click', (e) => {
      if (e.target === galleryModalBackdrop) closeGalleryModal();
    });
  }