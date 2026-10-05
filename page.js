/* Shared motion for subpages (privacy / terms / contact). */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined' && !reduce;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Scroll progress */
  const bar = $('.scroll-progress span');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Table of contents: highlight the section in view */
  const tocLinks = $$('.toc a');
  if (tocLinks.length) {
    const byId = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove('is-active'));
        byId.get(e.target.id)?.classList.add('is-active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* Pointer spotlight on contact cards */
  $$('.contact-card').forEach((c) => c.addEventListener('pointermove', (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', e.clientX - r.left + 'px');
    c.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  if (!animate) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('.nav__inner > *', { y: -20, opacity: 0, duration: 0.7, stagger: 0.08 })
    .from('.page-title .word', { yPercent: 115, skewY: 6, duration: 1.1, stagger: 0.12 }, 0.1)
    .from('.page-reveal', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.3)
    .from('.page-hero__glow', { scale: 0.6, opacity: 0, duration: 1.6, ease: 'power2.out' }, 0)
    .from('.toc', { x: -30, opacity: 0, duration: 0.9 }, 0.5)
    .from('.toc li', { x: -12, opacity: 0, duration: 0.5, stagger: 0.04 }, 0.7);

  ScrollTrigger.batch('.legal-reveal', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.from(els, { y: 50, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }),
  });
  $$('.rights, .defs').forEach((g) => {
    gsap.from(g.children, { y: 24, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 85%' } });
  });

  if ($('.contact__grid')) {
    gsap.from('.contact-card', { y: 70, opacity: 0, rotateX: -10, transformOrigin: '50% 100%', duration: 1, stagger: 0.09, ease: 'power3.out', delay: 0.4 });
    gsap.from('.contact-card__ic', { scale: 0, rotate: -30, duration: 0.7, stagger: 0.09, ease: 'back.out(2.4)', delay: 0.8 });
    gsap.from('.contact-note', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.contact-note', start: 'top 95%' } });

    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      $$('.contact-card').forEach((c) => {
        c.addEventListener('pointermove', (e) => {
          const r = c.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(c, { rotateY: px * 6, rotateX: -py * 6, transformPerspective: 900, duration: 0.5, ease: 'power2.out' });
        });
        c.addEventListener('pointerleave', () => gsap.to(c, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }));
      });
    }
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
