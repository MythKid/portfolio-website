(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function accentRGB() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? '45, 82, 209'
      : '107, 142, 255';
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     THEME · persist + toggle
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const stored = localStorage.getItem('mdtheme');
  if (stored === 'light') document.documentElement.setAttribute('data-theme', 'light');

  function applyThemeLabel() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.querySelectorAll('[data-theme-label]').forEach((el) => {
      el.textContent = isLight ? 'LIGHT' : 'DARK';
    });
  }
  applyThemeLabel();

  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';
      if (next === 'light') document.documentElement.setAttribute('data-theme', 'light');
      else                  document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('mdtheme', next);
      applyThemeLabel();
    });
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     TEXT DECRYPTION · 3x slower scramble on hover/focus
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#$%&¥§Ω∆◊';

  function scramble(el) {
    if (!el || reduceMotion) return;
    if (!el.dataset.decryptText) el.dataset.decryptText = el.textContent;
    const original = el.dataset.decryptText;

    if (el._scrambleRAF) cancelAnimationFrame(el._scrambleRAF);

    const queue = [];
    for (let i = 0; i < original.length; i++) {
      const ch = original[i];
      const start = Math.floor(Math.random() * 8) * 3;
      const end = start + (6 + Math.floor(Math.random() * 12)) * 3;
      queue.push({ ch, start, end, current: '' });
    }

    let frame = 0;
    function update() {
      let out = '';
      let done = 0;
      for (let i = 0; i < queue.length; i++) {
        const q = queue[i];
        if (frame >= q.end) {
          out += q.ch;
          done++;
        } else if (frame >= q.start && q.ch !== ' ') {
          if (!q.current || Math.random() < 0.18) {
            q.current = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
          out += '<span class="decrypt-char">' + q.current + '</span>';
        } else {
          out += q.ch === ' ' ? ' ' : q.ch;
        }
      }
      el.innerHTML = out;
      if (done < queue.length) {
        frame++;
        el._scrambleRAF = requestAnimationFrame(update);
      } else {
        el.textContent = original;
        el._scrambleRAF = null;
      }
    }
    update();
  }

  function bindDecrypt(host) {
    const target = host.querySelector('.decrypt-text') || host;
    if (!target.dataset.decryptText) target.dataset.decryptText = target.textContent;
    host.addEventListener('mouseenter', () => scramble(target));
    host.addEventListener('focus',      () => scramble(target));
  }

  document.querySelectorAll('.decrypt').forEach(bindDecrypt);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BACKGROUND · subtle node network canvas (slightly more visible)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const bgCanvas = document.getElementById('bgCanvas');
  if (bgCanvas && !reduceMotion) {
    const ctx = bgCanvas.getContext('2d');
    let W = 0, H = 0, nodes = [];
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      bgCanvas.width  = W * dpr;
      bgCanvas.height = H * dpr;
      bgCanvas.style.width  = W + 'px';
      bgCanvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(28, Math.min(58, Math.floor((W * H) / 32000)));
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x:  Math.random() * W,
          y:  Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
        });
      }
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const LINK_DIST = 200;

    function frame() {
      ctx.clearRect(0, 0, W, H);
      const col = accentRGB();

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            const a = (1 - d / LINK_DIST) * 0.24;
            ctx.strokeStyle = 'rgba(' + col + ', ' + a.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = 'rgba(' + col + ', 0.72)';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }
    frame();
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MOUSE DATA TRAIL · segmented digital particles
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const trailCanvas = document.getElementById('trailCanvas');
  if (trailCanvas && !reduceMotion) {
    const tctx = trailCanvas.getContext('2d');
    let TW = 0, TH = 0;
    let tdpr = Math.min(window.devicePixelRatio || 1, 2);

    function tresize() {
      tdpr = Math.min(window.devicePixelRatio || 1, 2);
      TW = window.innerWidth;
      TH = window.innerHeight;
      trailCanvas.width  = TW * tdpr;
      trailCanvas.height = TH * tdpr;
      trailCanvas.style.width  = TW + 'px';
      trailCanvas.style.height = TH + 'px';
      tctx.setTransform(tdpr, 0, 0, tdpr, 0, 0);
    }
    tresize();
    window.addEventListener('resize', tresize, { passive: true });

    const trail = [];
    const particles = [];
    const MAX_TRAIL = 18;
    const MAX_PARTICLES = 90;

    let lastX = -1000, lastY = -1000;
    let hasMouse = false;

    window.addEventListener('mousemove', (e) => {
      const x = e.clientX, y = e.clientY;
      if (!hasMouse) { lastX = x; lastY = y; hasMouse = true; return; }
      const dx = x - lastX, dy = y - lastY;
      const d = Math.hypot(dx, dy);
      if (d < 2) return;
      lastX = x; lastY = y;

      trail.push({ x, y, life: 1 });
      if (trail.length > MAX_TRAIL) trail.shift();

      const count = Math.min(2, Math.max(1, Math.floor(d / 16)));
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        particles.push({
          x: x + (Math.random() - 0.5) * 5,
          y: y + (Math.random() - 0.5) * 5,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35 + 0.04,
          size: Math.random() < 0.22 ? 2 : 1,
          life: 1,
          decay: 0.022 + Math.random() * 0.022,
        });
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => { hasMouse = false; });

    function tframe() {
      tctx.clearRect(0, 0, TW, TH);
      const col = accentRGB();

      if (trail.length > 1) {
        tctx.lineWidth = 1;
        for (let i = 1; i < trail.length; i++) {
          const a = trail[i].life * 0.32;
          tctx.strokeStyle = 'rgba(' + col + ', ' + a.toFixed(3) + ')';
          tctx.beginPath();
          tctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          tctx.lineTo(trail[i].x, trail[i].y);
          tctx.stroke();
        }
      }
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= 0.07;
        if (trail[i].life <= 0) trail.splice(i, 1);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const a = Math.max(0, p.life * 0.78);
        tctx.fillStyle = 'rgba(' + col + ', ' + a.toFixed(3) + ')';
        tctx.fillRect(p.x | 0, p.y | 0, p.size, p.size);
      }

      if (hasMouse) {
        tctx.fillStyle = 'rgba(' + col + ', 0.92)';
        tctx.fillRect(lastX - 1.5, lastY - 1.5, 3, 3);
      }

      requestAnimationFrame(tframe);
    }
    requestAnimationFrame(tframe);
  }

})();
