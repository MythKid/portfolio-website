(function () {
  'use strict';

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     THEME — persist across pages via localStorage
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
      localStorage.setItem('theme', isLight ? 'dark' : 'light');
      triggerBurst(e.clientX, e.clientY);
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     CLOCK
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const clockEl = document.getElementById('clock');
  function tickClock() {
    if (!clockEl) return;
    const d = new Date();
    clockEl.textContent =
      String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0');
  }
  tickClock();
  setInterval(tickClock, 30000);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     NEON TRACER CURSOR (lerp via RAF)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const tracer = document.getElementById('neon-tracer');
  let mX = -200, mY = -200, tX = -200, tY = -200;

  document.addEventListener('mousemove', (e) => { mX = e.clientX; mY = e.clientY; });
  document.addEventListener('mouseleave', () => { mX = -200; mY = -200; });

  const interactors = 'a, button, .skill-tag, .role-item, .entry-row, .topo-node, .contact-btn';
  document.querySelectorAll(interactors).forEach((el) => {
    el.addEventListener('mouseenter', () => tracer && tracer.classList.add('expanded'));
    el.addEventListener('mouseleave', () => tracer && tracer.classList.remove('expanded'));
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MATRIX DATA BURST
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const BCHARS = '01ABCDEF!@#$%/\\|<>{}[]?;:~`*^';

  function triggerBurst(cx, cy) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 20; i++) {
      const el = document.createElement('span');
      el.className = 'burst-p';
      el.textContent = BCHARS[Math.floor(Math.random() * BCHARS.length)];
      const angle = (Math.PI * 2 * i / 20) + (Math.random() - 0.5) * 0.5;
      const spd   = 50 + Math.random() * 100;
      el.style.cssText =
        'left:' + cx + 'px;top:' + cy + 'px;' +
        '--dx:' + (Math.cos(angle) * spd) + 'px;' +
        '--dy:' + (Math.sin(angle) * spd) + 'px;' +
        'animation-delay:' + (Math.random() * 0.06) + 's;';
      el.addEventListener('animationend', () => el.remove(), { once: true });
      frag.appendChild(el);
    }
    document.body.appendChild(frag);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     HOMEPAGE — TOPOLOGY
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const topoWrap = document.getElementById('topo-wrap');

  if (topoWrap) {

    /* ── Typewriter: "Methindu Damsara" then "· Matt ·" ── */
    const mainEl = document.getElementById('type-main');
    const prefEl = document.getElementById('type-pref');
    const MAIN   = 'Methindu Damsara';
    const PREF   = '· Matt ·';

    function typeSequence() {
      let i = 0;
      function typeMain() {
        if (i <= MAIN.length) {
          mainEl.textContent = MAIN.slice(0, i);
          i++;
          setTimeout(typeMain, 55);
        } else {
          setTimeout(typePref, 320);
        }
      }
      let j = 0;
      function typePref() {
        if (j <= PREF.length) {
          prefEl.textContent = PREF.slice(0, j);
          j++;
          setTimeout(typePref, 75);
        }
      }
      typeMain();
    }
    typeSequence();

    /* ── SVG topology lines ── */
    const svg    = document.getElementById('topo-svg');
    const hub    = document.getElementById('topo-hub');
    const nodes  = document.querySelectorAll('.topo-node');
    const lines  = [];

    function drawLines() {
      if (!svg || !hub || !nodes.length) return;
      svg.innerHTML = '';

      const wRect = topoWrap.getBoundingClientRect();
      const hRect = hub.getBoundingClientRect();
      const hcx   = hRect.left - wRect.left + hRect.width  / 2;
      const hcy   = hRect.top  - wRect.top  + hRect.height / 2;

      svg.setAttribute('viewBox', '0 0 ' + wRect.width + ' ' + wRect.height);
      lines.length = 0;

      nodes.forEach((node) => {
        const nRect = node.getBoundingClientRect();
        const nx    = nRect.left - wRect.left + nRect.width  / 2;
        const ny    = nRect.top  - wRect.top  + nRect.height / 2;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', hcx);
        line.setAttribute('y1', hcy);
        line.setAttribute('x2', nx);
        line.setAttribute('y2', ny);
        line.setAttribute('class', 'topo-line');
        svg.appendChild(line);
        lines.push({ el: line, node });
      });
    }

    /* Highlight line on node hover */
    nodes.forEach((node, idx) => {
      node.addEventListener('mouseenter', () => {
        if (lines[idx]) lines[idx].el.classList.add('lit');
      });
      node.addEventListener('mouseleave', () => {
        if (lines[idx]) lines[idx].el.classList.remove('lit');
      });
    });

    /* Node click: burst then navigate */
    nodes.forEach((node) => {
      node.addEventListener('click', (e) => {
        e.preventDefault();
        const href = node.getAttribute('href');
        triggerBurst(e.clientX, e.clientY);
        setTimeout(() => { window.location.href = href; }, 360);
      });
    });

    /* Draw lines after layout settles, redraw on resize */
    requestAnimationFrame(() => {
      requestAnimationFrame(drawLines);
    });
    window.addEventListener('resize', drawLines);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     WORK PAGE — entry expand/collapse
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  document.querySelectorAll('.entry').forEach((entry) => {
    const btn = entry.querySelector('.entry-row');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = entry.dataset.open === 'true';
      entry.dataset.open = open ? 'false' : 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     WORK PAGE — tab filter
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  document.querySelectorAll('.f-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.f-tab').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;
      document.querySelectorAll('.entry').forEach((entry) => {
        entry.dataset.hidden =
          (filter === 'all' || entry.dataset.type === filter) ? 'false' : 'true';
      });
    });
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RAF LOOP — neon tracer lerp
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function loop() {
    if (tracer) {
      tX += (mX - tX) * 0.13;
      tY += (mY - tY) * 0.13;
      tracer.style.left = tX + 'px';
      tracer.style.top  = tY + 'px';
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

})();
