/* ============================================================
   Methindu Damsara portfolio. Premium minimal.
   Theme toggle, cinematic scroll reveals, staggered hero
   entrance, topbar scroll state, soft pointer parallax glow.
   No em dashes anywhere in this file.
   ============================================================ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
  const root = document.documentElement;

  // Run each module in isolation so one failure can never abort the others
  // (in particular, never leaves reveal/entrance content stuck hidden).
  function run(fn) { try { fn(); } catch (e) { /* keep going */ } }

  /* ---------- hero entrance (runs first, content critical) ---------- */
  run(function entrance() {
    requestAnimationFrame(function () {
      document.body.classList.add('is-loaded');
    });
  });

  /* ---------- cinematic scroll reveal (content critical) ---------- */
  run(function reveal() {
    const els = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (el) { io.observe(el); });
  });

  /* ---------- theme toggle + persistence ---------- */
  run(function theme() {
    const meta = document.querySelector('meta[name="theme-color"][data-dynamic]');
    function applyMeta() {
      if (meta) meta.setAttribute('content', root.getAttribute('data-theme') === 'light' ? '#f6f7f9' : '#08090c');
    }
    applyMeta();
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('mdtheme', next); } catch (e) {}
      applyMeta();
    });
  });

  /* ---------- topbar scroll state ---------- */
  run(function topbar() {
    const bar = document.querySelector('.topbar');
    if (!bar) return;
    let ticking = false;
    function update() {
      bar.classList.toggle('scrolled', window.scrollY > 8);
      ticking = false;
    }
    update();
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  });

  /* ---------- pointer parallax on ambient glow ---------- */
  run(function parallax() {
    const glow = document.querySelector('.glow');
    if (!glow || isTouch || reduceMotion) return;
    let tx = 50, ty = 18, cx = 50, cy = 18, raf = 0;
    window.addEventListener('mousemove', function (e) {
      tx = 50 + (e.clientX / window.innerWidth - 0.5) * 16;
      ty = 18 + (e.clientY / window.innerHeight - 0.5) * 16;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    function loop() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      glow.style.setProperty('--gx', cx.toFixed(2) + '%');
      glow.style.setProperty('--gy', cy.toFixed(2) + '%');
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    }
  });

  /* ---------- mobile hamburger nav ---------- */
  run(function mobileNav() {
    const btn = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    if (!btn || !nav) return;
    function close() {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
    }
    function open() {
      nav.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close menu');
    }
    btn.addEventListener('click', function () {
      if (nav.classList.contains('open')) close(); else open();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) close(); });
  });

  /* ---------- interactive constellation ---------- */
  run(function constellation() {
    if (reduceMotion) return;

    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LINK = 168;          // max distance two nodes link across
    const CURSOR_LINK = 200;   // distance the cursor links to nodes
    let w = 0, h = 0, nodes = [], hidden = false;
    let mx = -9999, my = -9999;

    function accent() {
      const v = getComputedStyle(root).getPropertyValue('--accent-rgb').trim();
      return v || '52, 225, 196';
    }

    function seed() {
      const count = Math.min(Math.round((w * h) / 30000), 26);
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 1.3 + Math.random() * 0.9,
          tw: Math.random() * Math.PI * 2   // twinkle phase
        });
      }
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { hidden = document.hidden; });

    if (!isTouch) {
      window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
      window.addEventListener('mouseleave', function () { mx = -9999; my = -9999; });
    }

    let t = 0;
    function frame() {
      requestAnimationFrame(frame);
      if (hidden || !w) return;
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      const rgb = accent();
      // teal reads fainter on the light background, so boost opacity there
      const k = root.getAttribute('data-theme') === 'light' ? 1.7 : 1;

      // move
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -6) n.x = w + 6; else if (n.x > w + 6) n.x = -6;
        if (n.y < -6) n.y = h + 6; else if (n.y > h + 6) n.y = -6;
      }

      // links between nearby nodes
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK) {
            const o = (1 - dist / LINK) * 0.16 * k;
            ctx.strokeStyle = 'rgba(' + rgb + ',' + o.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // links from cursor to nearby nodes (interactive)
      if (mx > -9998) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const dx = n.x - mx, dy = n.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CURSOR_LINK) {
            const o = (1 - dist / CURSOR_LINK) * 0.3 * k;
            ctx.strokeStyle = 'rgba(' + rgb + ',' + o.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        }
      }

      // nodes (with gentle twinkle)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const a = Math.min(0.9, (0.4 + 0.25 * Math.sin(t + n.tw)) * k);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb + ',' + a.toFixed(3) + ')';
        ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  });

})();
