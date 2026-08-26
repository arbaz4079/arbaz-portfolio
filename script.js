/* ───────────────────────────────────────────────
   SCRIPT.JS — Editorial interactions & Animation Engine
   Strictly: No Dark Mode, No Neon Glows, No Glassmorphism
   ─────────────────────────────────────────────── */

function startApp() {
  const siteHeader = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const siteNav = document.getElementById('site-nav');
  const loader = document.getElementById('loader');
  const loaderPct = document.getElementById('loader-pct');
  const loaderProgress = document.getElementById('loader-progress');
  const loaderPhase = document.getElementById('loader-phase');
  const loaderStep = document.getElementById('loader-step');
  const loaderClock = document.getElementById('loader-clock');
  const siteShell = document.getElementById('site-shell');
  const heroArtCard = document.getElementById('hero-art-card');
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const readingProgressBar = document.getElementById('reading-progress');
  const subscribeModal = document.getElementById('subscribe-modal');
  const subscribeForm = document.getElementById('subscribe-form');
  const subscribeName = document.getElementById('subscribe-name');
  const subscribeMessage = document.getElementById('subscribe-message');
  const subscribeCount = document.getElementById('subscriber-count');
  const subscribeClose = document.getElementById('subscribe-close');
  const subscribeLater = document.getElementById('subscribe-later');

  /* ─── Live Clock in Loader ─── */
  const updateClock = () => {
    if (!loaderClock) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    loaderClock.textContent = `${h}:${m}:${s}`;
  };
  updateClock();
  const clockInterval = setInterval(updateClock, 1000);

  /* ─── First-Visit Subscription Prompt ─── */
  const subscriberCountKey = 'arbazSubscriberCount';
  const subscriptionSeenKey = 'arbazSubscriptionPromptSeen';
  const storedCount = Number.parseInt(localStorage.getItem(subscriberCountKey) || '0', 10);
  let currentSubscriberCount = Number.isNaN(storedCount) ? 0 : storedCount;

  const updateSubscriberCount = () => {
    if (!subscribeCount) return;
    subscribeCount.textContent = `${currentSubscriberCount} subscriber${currentSubscriberCount === 1 ? '' : 's'}`;
  };
  const closeSubscribePrompt = () => {
    if (!subscribeModal) return;
    subscribeModal.hidden = true;
    localStorage.setItem(subscriptionSeenKey, 'true');
  };
  updateSubscriberCount();

  if (subscribeModal && !localStorage.getItem(subscriptionSeenKey)) {
    subscribeModal.hidden = false;
    window.setTimeout(() => subscribeName?.focus(), 350);
  }

  subscribeForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!subscribeName?.checkValidity()) {
      subscribeName?.reportValidity();
      return;
    }
    currentSubscriberCount += 1;
    localStorage.setItem(subscriberCountKey, String(currentSubscriberCount));
    updateSubscriberCount();
    if (subscribeMessage) {
      subscribeMessage.textContent = 'You are subscribed. Thank you.';
      subscribeMessage.classList.add('is-success');
    }
    localStorage.setItem(subscriptionSeenKey, 'true');
    window.setTimeout(closeSubscribePrompt, 900);
  });
  subscribeClose?.addEventListener('click', closeSubscribePrompt);
  subscribeLater?.addEventListener('click', closeSubscribePrompt);
  subscribeModal?.addEventListener('click', (event) => {
    if (event.target === subscribeModal) closeSubscribePrompt();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && subscribeModal && !subscribeModal.hidden) closeSubscribePrompt();
  });

  /* ─── Animated Desktop Cursor ─── */
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (finePointerQuery.matches) {
    const cursorDot = document.createElement('span');
    const cursorRing = document.createElement('span');
    cursorDot.className = 'custom-cursor-dot';
    cursorRing.className = 'custom-cursor-ring';
    cursorDot.setAttribute('aria-hidden', 'true');
    cursorRing.setAttribute('aria-hidden', 'true');
    document.body.append(cursorDot, cursorRing);

    let pointerX = -100;
    let pointerY = -100;
    let ringX = pointerX;
    let ringY = pointerY;
    let cursorFrame;

    const animateCursor = () => {
      ringX += (pointerX - ringX) * 0.16;
      ringY += (pointerY - ringY) * 0.16;
      cursorDot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      cursorFrame = requestAnimationFrame(animateCursor);
    };

    const interactiveSelector = 'a, button, .project, .timeline article, .recognition-item, .skill-tag, .hero-art';
    document.body.classList.add('has-custom-cursor');
    document.addEventListener('pointermove', (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      document.body.classList.toggle('cursor-hover', Boolean(event.target.closest(interactiveSelector)));
    });
    document.addEventListener('pointerleave', () => {
      document.body.classList.remove('has-custom-cursor', 'cursor-hover');
    });
    document.addEventListener('pointerenter', () => {
      document.body.classList.add('has-custom-cursor');
    });
    animateCursor();

    window.addEventListener('beforeunload', () => cancelAnimationFrame(cursorFrame), { once: true });
  }

  /* ─── Safe Letter Hover Interaction ─── */
  const makeLettersInteractive = (element) => {
    if (!element) return;
    const textNodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.trim().length > 0) {
        textNodes.push(node);
      }
    }
    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      [...textNode.nodeValue].forEach((character) => {
        if (character === ' ' || character === '\n' || character === '\t') {
          fragment.appendChild(document.createTextNode(character));
        } else {
          const letter = document.createElement('span');
          letter.className = 'letter';
          letter.textContent = character;
          fragment.appendChild(letter);
        }
      });
      if (textNode.parentNode) {
        textNode.parentNode.replaceChild(fragment, textNode);
      }
    });
  };

  try {
    document.querySelectorAll('main h1, main h2, main h3, .project-visual strong, .about-marker, .detail-block .eyebrow').forEach(makeLettersInteractive);
  } catch (err) {
    console.warn('Letter interaction fallback:', err);
  }

  /* ═══════════════════════════════════════════════
     EDITORIAL LETTER-BY-LETTER LOADER ENGINE
     ═══════════════════════════════════════════════ */
  const allChars = Array.from(document.querySelectorAll('.loader .l-char'));

  const LOADER_DURATION = 2100; // ms total load time
  let loaderStartTime = null;
  let isLoaderComplete = false;
  let isTransitioningOut = false;

  const statusPhases = [
    { threshold: 0.25, step: '[ 01 / 04 ]', text: 'Setting up typography & index...' },
    { threshold: 0.55, step: '[ 02 / 04 ]', text: 'Loading portfolio assets & artwork...' },
    { threshold: 0.85, step: '[ 03 / 04 ]', text: 'Preparing case studies & timeline...' },
    { threshold: 1.00, step: '[ 04 / 04 ]', text: 'Ready — revealing portfolio' }
  ];

  // Graceful Reveal Transition into Portfolio
  const triggerReveal = () => {
    if (isTransitioningOut) return;
    isTransitioningOut = true;
    isLoaderComplete = true;
    clearInterval(clockInterval);

    // Activate all remaining characters immediately
    allChars.forEach((char) => {
      char.classList.add('is-active');
      char.classList.remove('is-current');
    });

    if (loaderPct) loaderPct.textContent = '100%';
    if (loaderProgress) loaderProgress.style.width = '100%';
    if (loaderPhase) loaderPhase.textContent = 'Ready — revealing portfolio';
    if (loaderStep) loaderStep.textContent = '[ 04 / 04 ]';

    const REVEAL_DURATION = 420; // ms
    const revealStart = performance.now();

    const animateReveal = (now) => {
      const elapsed = now - revealStart;
      const progress = Math.min(elapsed / REVEAL_DURATION, 1);
      const ease = Math.min(progress * 1.4, 1);

      if (loader) {
        loader.style.opacity = `${1 - ease}`;
      }

      if (progress < 1) {
        requestAnimationFrame(animateReveal);
      } else {
        if (loader) {
          loader.classList.add('is-done');
          loader.style.display = 'none';
        }
        if (siteShell) {
          siteShell.classList.add('is-revealed');
        }
        triggerVisibleOnScreen();
      }
    };

    requestAnimationFrame(animateReveal);
  };

  // Main Loading Animation Loop — Letter-by-Letter Kinetic Reveal
  const updateLoaderPhysics = (now) => {
    if (isTransitioningOut) return;
    if (!loaderStartTime) loaderStartTime = now;
    const elapsed = now - loaderStartTime;
    const rawProgress = Math.min(elapsed / LOADER_DURATION, 1);

    // Smooth cubic progress interpolation
    const easeProgress = 1 - Math.pow(1 - rawProgress, 2.4);
    const pct = Math.round(easeProgress * 100);

    // Letter-by-letter sequential activation
    if (allChars.length > 0) {
      // Reveal letters progressively from 0.04 to 0.88 progress
      const charProgress = Math.min(Math.max((rawProgress - 0.04) / 0.84, 0), 1);
      const activeCount = Math.floor(charProgress * (allChars.length + 1));

      allChars.forEach((char, index) => {
        if (index < activeCount) {
          char.classList.add('is-active');
          if (index === activeCount - 1 && rawProgress < 0.95) {
            char.classList.add('is-current');
          } else {
            char.classList.remove('is-current');
          }
        } else {
          char.classList.remove('is-active');
          char.classList.remove('is-current');
        }
      });
    }

    // UI readouts
    if (loaderPct) {
      loaderPct.textContent = `${String(pct).padStart(2, '0')}%`;
    }
    if (loaderProgress) {
      loaderProgress.style.width = `${pct}%`;
    }
    if (loaderPhase && loaderStep) {
      const currentPhase = statusPhases.find((p) => rawProgress <= p.threshold) || statusPhases[statusPhases.length - 1];
      if (loaderPhase.textContent !== currentPhase.text) {
        loaderStep.textContent = currentPhase.step;
        loaderPhase.textContent = currentPhase.text;
      }
    }

    if (rawProgress < 1) {
      requestAnimationFrame(updateLoaderPhysics);
    } else {
      triggerReveal();
    }
  };

  // Start animation loop
  requestAnimationFrame(updateLoaderPhysics);

  // Safety watchdog: ensure reveal triggers even if backgrounded or frame dropped
  setTimeout(() => {
    if (!isLoaderComplete) {
      triggerReveal();
    }
  }, LOADER_DURATION + 1000);

  // Click anywhere to skip loader immediately
  loader?.addEventListener('click', () => {
    triggerReveal();
  });

  // Keyboard shortcut support to skip loader
  window.addEventListener('keydown', (e) => {
    if (!isLoaderComplete && (e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter')) {
      e.preventDefault();
      triggerReveal();
    }
  });

  /* ─── Reading Scroll Progress Bar & Header Scrolled State ─── */
  const onScrollHandler = () => {
    const scrollY = window.scrollY;
    if (siteHeader) {
      siteHeader.classList.toggle('is-scrolled', scrollY > 20);
    }
    if (readingProgressBar) {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(Math.max(scrollY / totalHeight, 0), 1);
        readingProgressBar.style.width = `${(progress * 100).toFixed(2)}%`;
      }
    }
  };
  window.addEventListener('scroll', onScrollHandler, { passive: true });

  /* ─── Active Navigation Link on Scroll ─── */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.site-nav a');

  const highlightNavOnScroll = () => {
    const scrollPos = window.scrollY + 140;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  };
  window.addEventListener('scroll', highlightNavOnScroll, { passive: true });

  /* ─── 3D Perspective Tilt on Hero Art Card (Calm, Natural) ─── */
  if (heroArtCard) {
    const svgContainer = heroArtCard.querySelector('.hero-svg-container');
    const badge1 = heroArtCard.querySelector('.badge-top-right');
    const badge2 = heroArtCard.querySelector('.badge-bottom-left');

    heroArtCard.addEventListener('mousemove', (e) => {
      const rect = heroArtCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -3.5;
      const rotateY = ((x - centerX) / centerX) * 3.5;

      heroArtCard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      if (svgContainer) {
        svgContainer.style.transform = `translateZ(10px)`;
      }
      if (badge1) {
        badge1.style.transform = `translateZ(14px) translate(${rotateY * 0.3}px, ${-rotateX * 0.3}px)`;
      }
      if (badge2) {
        badge2.style.transform = `translateZ(14px) translate(${-rotateY * 0.3}px, ${rotateX * 0.3}px)`;
      }
    });

    heroArtCard.addEventListener('mouseleave', () => {
      heroArtCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      if (svgContainer) svgContainer.style.transform = 'translateZ(0px)';
      if (badge1) badge1.style.transform = 'translateZ(0px)';
      if (badge2) badge2.style.transform = 'translateZ(0px)';
    });
  }

  /* ─── Copy Email Interaction ─── */
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = 'arbazmulla913@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        copyEmailBtn.classList.add('is-copied');
        setTimeout(() => {
          copyEmailBtn.classList.remove('is-copied');
        }, 2200);
      } catch (err) {
        const tempInput = document.createElement('input');
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        copyEmailBtn.classList.add('is-copied');
        setTimeout(() => {
          copyEmailBtn.classList.remove('is-copied');
        }, 2200);
      }
    });
  }

  /* ─── Mobile Menu Toggle & Dismiss UX ─── */
  const closeMobileMenu = () => {
    siteNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    if (menuToggle) menuToggle.textContent = 'Menu';
  };

  menuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = siteNav?.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? 'Close' : 'Menu';
  });

  document.querySelectorAll('.site-nav a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    if (siteNav?.classList.contains('open') && !siteHeader?.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Close mobile nav on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && siteNav?.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  /* ─── Intersection Observer — Scroll Reveals ─── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .section-enter').forEach((el) => revealObserver.observe(el));

  const projectRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        projectRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.project-reveal').forEach((el) => projectRevealObserver.observe(el));

  // Trigger reveals for elements initially in viewport
  function triggerVisibleOnScreen() {
    document.querySelectorAll('.hero .reveal, .hero.section-enter').forEach((el) => {
      el.classList.add('visible');
    });
  }
}

// Ensure execution whether loaded before or after DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
