(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animate = hasGsap && !reduce;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  /* ---------- Nav state + scroll progress ---------- */
  const nav = $('.nav');
  const bar = $('.scroll-progress span');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Count-up numbers ---------- */
  const countUp = (el) => {
    const to = +el.dataset.to;
    if (!animate) { el.textContent = fmt(to); return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)) });
  };
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('.count').forEach((el) => countIO.observe(el));

  /* ---------- How it works: active step ---------- */
  const steps = $$('.how__step');
  const panels = $$('.how__panel');
  const setStep = (i) => {
    steps.forEach((s, k) => {
      s.classList.toggle('is-active', k === i);
      s.setAttribute('aria-pressed', k === i);
    });
    panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
  };
  // Steps are also clickable / keyboard-activatable
  const stage = $('.how__stage');
  steps.forEach((s, i) => {
    s.setAttribute('role', 'button');
    s.setAttribute('tabindex', '0');
    s.setAttribute('aria-controls', 'howStage');
    const pick = () => {
      lockUntil = Date.now() + 1200; // let the click win over the scroll observer briefly
      setStep(i);
      // On narrow screens the stage isn't sticky — bring it into view if it's off-screen
      const r = stage.getBoundingClientRect();
      if (r.bottom < 80 || r.top > innerHeight) stage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      if (animate) gsap.fromTo(s.querySelector('.how__num'), { scale: 0.85 }, { scale: 1, duration: 0.6, ease: 'back.out(3)', transformOrigin: '50% 80%' });
    };
    s.addEventListener('click', pick);
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
    });
  });
  let lockUntil = 0;
  const stepIO = new IntersectionObserver((entries) => {
    if (Date.now() < lockUntil) return;
    entries.forEach((e) => { if (e.isIntersecting) setStep(+e.target.dataset.step); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => stepIO.observe(s));

  /* ---------- Points calculator (demo rates) ---------- */
  const km = $('#km'), kcal = $('#kcal');
  const kmOut = $('#kmOut'), kcalOut = $('#kcalOut'), ptsOut = $('#ptsOut'), hint = $('#ptsHint');
  const pts = { v: 70 };
  const hints = [
    [0, 'เริ่มขยับก่อน แล้วคะแนนจะตามมา 💪'],
    [100, 'แลกกาแฟได้อีกนิดเดียว ☕'],
    [120, 'พอแลกคูปองกาแฟฟรี 1 แก้วแล้ว ☕'],
    [300, 'แลกสิทธิ์ลุ้นรางวัลใหญ่ได้หลายสิทธิ์ 🎟️'],
    [600, 'สายโหด! ติด Top Ranking แน่นอน 🏆'],
  ];
  const fill = (r) => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%');
  const calc = () => {
    fill(km); fill(kcal);
    kmOut.textContent = (+km.value).toFixed(km.value % 1 ? 1 : 0);
    kcalOut.textContent = fmt(+kcal.value);
    const target = km.value * 10 + kcal.value / 20;
    hint.textContent = hints.filter(([min]) => target >= min).pop()[1];
    if (animate) {
      gsap.to(pts, { v: target, duration: 0.5, ease: 'power2.out', overwrite: true, onUpdate: () => (ptsOut.textContent = fmt(pts.v)) });
      gsap.fromTo(ptsOut, { scale: 1.08 }, { scale: 1, duration: 0.4, ease: 'back.out(3)', overwrite: 'auto' });
    } else ptsOut.textContent = fmt(target);
  };
  km.addEventListener('input', calc);
  kcal.addEventListener('input', calc);
  calc();

  /* ---------- Ranking board ---------- */
  const boards = {
    week: [
      ['Mint R.', 'Strava · 64.2 กม.', '2,140'], ['Pond K.', 'Apple Health · 58.0 กม.', '1,980'],
      ['Ploy S.', 'Samsung Health · 51.6 กม.', '1,742'], ['ThaiMove Runner', 'คุณ · 32.0 กม.', '1,240', 'me', 42],
    ],
    month: [
      ['Arm T.', 'Garmin → Strava · 248 กม.', '8,420'], ['Mint R.', 'Strava · 231 กม.', '7,960'],
      ['Fah P.', 'Huawei Health · 205 กม.', '6,880'], ['ThaiMove Runner', 'คุณ · 118 กม.', '4,120', 'me', 27],
    ],
    club: [
      ['ThaiMove Night Runners', '128 สมาชิก', '42,800'], ['Chiang Mai Trail Club', '96 สมาชิก', '39,150'],
      ['Phuket Ride & Run', '74 สมาชิก', '31,600'], ['ทีมของคุณ', '24 สมาชิก', '12,480', 'me', 18],
    ],
  };
  const list = $('#boardList');
  const renderBoard = (key) => {
    list.innerHTML = boards[key].map(([n, s, sc, me, pos], i) => `
      <li class="${me || ''}"><span class="pos">#${pos || i + 1}</span><span class="av">${n[0]}</span>
      <span class="nm">${n}<small>${s}</small></span><span class="sc">${sc} pt</span></li>`).join('');
    if (animate) {
      gsap.from(list.children, { x: -30, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' });
      gsap.fromTo('.podium__bar', { scaleY: 0 }, { scaleY: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.6)' });
    }
  };
  $$('.seg__btn').forEach((b) => b.addEventListener('click', () => {
    $$('.seg__btn').forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
    renderBoard(b.dataset.board);
  }));
  list.innerHTML = '';
  if (!animate) renderBoard('week');

  /* ---------- Tile spotlight (pointer) ---------- */
  $$('.tile').forEach((t) => t.addEventListener('pointermove', (e) => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', e.clientX - r.left + 'px');
    t.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  if (!animate) return;

  /* ======================================================
     GSAP motion
     ====================================================== */
  gsap.registerPlugin(ScrollTrigger);
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Hero intro (phone is centered via xPercent/yPercent so GSAP owns its transform) */
  gsap.set('.hero__phone', { xPercent: -50, yPercent: -50, x: 0, y: 0 });
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro
    .from('.nav__inner > *', { y: -20, opacity: 0, duration: 0.8, stagger: 0.08 })
    .from('.hero__title .word', { yPercent: 115, skewY: 6, duration: 1.1, stagger: 0.12 }, 0.1)
    .from('.hero-reveal', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.45)
    .from('.hero__sources li', { y: 12, opacity: 0, duration: 0.5, stagger: 0.05 }, 0.9)
    .from('.hero__phone', { y: 140, rotate: 8, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0.25)
    .from('.hero__phone .bar__fill', { scaleX: 0, duration: 1.2, ease: 'power2.inOut' }, 1)
    .from('.hero__phone .app-feed li', { x: 24, opacity: 0, duration: 0.6, stagger: 0.12 }, 1.1)
    .from('.beam', { opacity: 0, duration: 0.8, stagger: 0.08 }, 0.9)
    .from('.chip-src', { scale: 0.4, opacity: 0, duration: 0.8, stagger: 0.09, ease: 'back.out(2)' }, 1)
    .from('.toast', { scale: 0, opacity: 0, duration: 0.7, stagger: 0.3, ease: 'back.out(2.5)' }, 1.6)
    .from('.scroll-cue', { opacity: 0, duration: 0.6 }, 1.8);

  /* Idle float loops */
  $$('.chip-src').forEach((c, i) => {
    gsap.to(c, { y: i % 2 ? 10 : -10, x: i % 3 ? 4 : -4, duration: 2.6 + i * 0.35, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });
  });
  gsap.to('.toast--pts', { y: -12, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.4 });
  gsap.to('.toast--rank', { y: 10, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.4 });

  /* Re-pop the "+52 pt" toast as if a new sync arrived */
  gsap.timeline({ repeat: -1, repeatDelay: 3.5, delay: 5 })
    .to('.toast--pts', { scale: 1.15, duration: 0.18, ease: 'power2.out' })
    .to('.toast--pts', { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' });

  /* Hero mouse parallax */
  if (finePointer) {
    const vis = $('.hero__visual');
    // Phone tilts toward the pointer; chips/toasts keep their own float loops.
    const phone = $('.hero__phone');
    $('.hero').addEventListener('pointermove', (e) => {
      if (intro.isActive()) return;
      const r = vis.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      gsap.to(phone, { x: dx * 24, y: dy * 24, rotateY: dx * 12, rotateX: -dy * 12, transformPerspective: 1000, duration: 1, ease: 'power3.out', overwrite: 'auto' });
      gsap.to('.hero__beams', { x: dx * -14, y: dy * -14, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
    });
  }

  /* Hero scroll-out */
  gsap.to('.hero__copy', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__glow', { scale: 1.4, opacity: 0.4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Generic reveals */
  ScrollTrigger.batch('.reveal', {
    start: 'top 85%', once: true,
    onEnter: (els) => gsap.from(els, { y: 60, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out' }),
  });

  /* Section headings: split-ish line rise */
  $$('.h2').forEach((h) => {
    gsap.from(h, { clipPath: 'inset(0 0 100% 0)', y: 40, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
  });

  /* Marquee speeds up with scroll velocity */
  const track = $('.marquee__track');
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => {
      const v = Math.min(Math.abs(self.getVelocity()) / 1500, 3);
      track.style.animationDuration = 28 / (1 + v) + 's';
    },
  });

  /* How: steps slide in */
  // Animate the step contents, not .how__step itself — it has CSS transitions on opacity/transform.
  gsap.from('.how__step > *', { x: -40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.how__steps', start: 'top 80%' } });
  gsap.from('.how__stage', { scale: 0.92, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.how__stage', start: 'top 85%' } });

  /* Bento */
  gsap.from('.tile', {
    y: 80, opacity: 0, rotateX: -12, transformOrigin: '50% 100%', duration: 1, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: '.bento', start: 'top 80%' },
  });
  gsap.from('.mini-chart span', { scaleY: 0, duration: 0.9, stagger: 0.07, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.mini-chart', start: 'top 90%' } });
  gsap.from('.rank-badge', { scale: 0.6, opacity: 0, transformOrigin: '100% 100%', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.tile--rank', start: 'top 80%' } });
  gsap.from('.avatars i', { x: 40, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(2)', scrollTrigger: { trigger: '.tile--club', start: 'top 85%' } });
  /* 3D tilt on tiles */
  if (finePointer) {
    $$('.tilt').forEach((t) => {
      t.addEventListener('pointermove', (e) => {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(t, { rotateY: px * 6, rotateX: -py * 6, transformPerspective: 900, duration: 0.5, ease: 'power2.out' });
      });
      t.addEventListener('pointerleave', () => gsap.to(t, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }));
    });
  }

  /* Ranking: build board when in view */
  ScrollTrigger.create({ trigger: '.board', start: 'top 75%', once: true, onEnter: () => renderBoard('week') });
  gsap.from('.podium__av', { y: -30, opacity: 0, duration: 0.8, stagger: 0.12, delay: 0.5, ease: 'bounce.out', scrollTrigger: { trigger: '.board', start: 'top 75%' } });

  /* Clubs */
  gsap.from('.club-card', { rotate: -4, y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.clubs__visual', start: 'top 80%' } });
  gsap.from('.club-challenge .bar__fill', { scaleX: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: '.club-challenge', start: 'top 90%' } });
  gsap.from('.club-bubble', { scale: 0, opacity: 0, duration: 0.7, stagger: 0.35, delay: 0.5, ease: 'back.out(2.4)', scrollTrigger: { trigger: '.clubs__visual', start: 'top 75%' } });
  gsap.to('.b1', { y: -10, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.b2', { y: 10, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.from('.checks li', { x: -30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.checks', start: 'top 85%' } });

  /* Events: pinned horizontal scroll on desktop */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 981px)', () => {
    const section = $('.events');
    const evTrack = $('.events__track');
    section.classList.add('is-pinned');
    const dist = () => Math.max(0, evTrack.scrollWidth - innerWidth);
    const tween = gsap.to(evTrack, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.events__pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true },
    });
    $$('.event').forEach((ev) => {
      gsap.from(ev.querySelector('h3'), {
        y: 50, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ev, containerAnimation: tween, start: 'left 85%' },
      });
    });
    return () => section.classList.remove('is-pinned');
  });
  mm.add('(max-width: 980px)', () => {
    gsap.from('.event', { y: 60, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.events__track', start: 'top 85%' } });
  });

  /* CTA */
  gsap.from('.cta__mark', { scale: 0.4, rotate: -20, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top 85%', end: 'top 35%', scrub: 1 } });
  gsap.from('.cta__title', { y: 80, opacity: 0, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '.cta__title', start: 'top 88%' } });
  gsap.from('.store__btn', { y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'back.out(2)', scrollTrigger: { trigger: '.store', start: 'top 92%' } });

  /* Magnetic buttons */
  if (finePointer) {
    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power3.out' });
      });
      b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }));
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
