/* main.js — điều khiển slide, ánh sáng, bụi, phím tắt, cửa sổ người trình bày. */
(function () {
  const stage = document.getElementById('stage');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const hud = document.getElementById('hud');
  const nav = document.getElementById('nav');
  const fadeEl = document.getElementById('fade');
  const dust = document.getElementById('dust');
  const total = slides.length;
  let cur = -1, step = 0, timers = [], presWin = null;

  initDecor();

  /* ---------- Co giãn vừa màn hình 16:9 ---------- */
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `scale(${s})`;
  }
  window.addEventListener('resize', fit); fit();

  /* ---------- Số bước (bấm tiếp) của mỗi slide ---------- */
  function maxStep(i) {
    const el = slides[i];
    let m = EXTRA_STEPS[i] || 0;
    el.querySelectorAll('[data-step],[data-lit]').forEach((n) => {
      m = Math.max(m, +(n.dataset.step || n.dataset.lit || 0));
    });
    if (el.dataset.fade) m = Math.max(m, 1);
    return m;
  }

  function applyStep(i, n) {
    const el = slides[i];
    el.querySelectorAll('[data-step]').forEach((x) => x.classList.toggle('on', +x.dataset.step <= n));
    el.querySelectorAll('[data-lit]').forEach((x) => x.classList.toggle('lit', +x.dataset.lit <= n));
    el.style.setProperty('--pan', Math.min(n, 2));
    fadeEl.classList.toggle('on', !!el.dataset.fade && n >= 1);
  }

  /* ---------- Ánh sáng ---------- */
  function setLight(i, n) {
    timers.forEach(clearTimeout); timers = [];
    const cfg = LIGHTS[i];
    const apply = (c) => {
      stage.style.setProperty('--bx', c.x + 'px');
      stage.style.setProperty('--bw', c.w + 'px');
      stage.style.setProperty('--bo', c.o);
      stage.style.setProperty('--po', c.po);
      stage.style.setProperty('--lc', lightColor(c.warm));
      dust.style.opacity = c.dust;
    };
    const merged = Object.assign({}, cfg, cfg.steps && cfg.steps[n] ? cfg.steps[n] : {});
    delete merged.steps; delete merged.seq;
    // slide 1 lúc mới mở: bắt đầu từ tối hẳn rồi mới sáng dần
    if (cur === 0 && n === 0 && cfg.seq) { stage.style.setProperty('--bo', 0); stage.style.setProperty('--po', 0); }
    timers.push(setTimeout(() => apply(merged), 250));
    (cfg.seq || []).forEach(([ms, patch]) => timers.push(setTimeout(() => apply(Object.assign({}, merged, patch)), ms)));
  }

  /* ---------- Chuyển slide ---------- */
  function go(i, st) {
    if (i < 0 || i >= total) return;
    const prev = cur;
    if (prev >= 0 && prev !== i) {
      slides[prev].classList.remove('active');
      if (HOOKS[prev] && HOOKS[prev].leave) HOOKS[prev].leave(slides[prev]);
    }
    cur = i; step = st || 0;
    const el = slides[i];
    if (prev !== i) {
      el.classList.remove('active'); void el.offsetWidth;   // chạy lại hiệu ứng vào
      el.classList.add('active');
      if (HOOKS[i] && HOOKS[i].enter) HOOKS[i].enter(el);
    }
    applyStep(i, step);
    setLight(i, step);
    document.getElementById('chapter').textContent = el.dataset.chapter || '';
    document.getElementById('counter').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    document.querySelector('#progress i').style.width = ((i + 1) / total * 100) + '%';
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) { /* file:// vẫn ổn */ }
    sendState();
  }

  function next() {
    if (step < maxStep(cur)) { step++; applyStep(cur, step); setLight(cur, step); sendState(); }
    else go(cur + 1, 0);
  }
  function prev() {
    if (step > 0) { step--; applyStep(cur, step); setLight(cur, step); sendState(); }
    else if (cur > 0) go(cur - 1, maxStep(cur - 1));
  }

  /* ---------- Cửa sổ người trình bày ---------- */
  function sendState() {
    if (presWin && !presWin.closed) {
      presWin.postMessage({ type: 'state', cur, step, maxStep: maxStep(cur), total, title: slides[cur].dataset.title,
        nextTitle: cur + 1 < total ? slides[cur + 1].dataset.title : '' }, '*');
    }
  }
  function openPresenter() {
    presWin = window.open('presenter.html', 'presenter', 'width=1100,height=760');
    setTimeout(sendState, 600);
  }
  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === 'hello') { presWin = e.source; sendState(); }
    if (d.type === 'next') next();
    if (d.type === 'prev') prev();
  });

  /* ---------- Phím, nút, vuốt ---------- */
  function toggleFull() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'Enter': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': e.preventDefault(); prev(); break;
      case 'Home': go(0, 0); break;
      case 'End': go(total - 1, 0); break;
      case 'f': case 'F': toggleFull(); break;
      case 'p': case 'P': openPresenter(); break;
      case 'h': case 'H': hud.classList.toggle('hide'); break;
    }
  });
  document.getElementById('btnNext').onclick = next;
  document.getElementById('btnPrev').onclick = prev;
  document.getElementById('btnFull').onclick = toggleFull;
  document.getElementById('btnPres').onclick = openPresenter;

  let tx = 0, ty = 0;
  window.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
  }, { passive: true });

  // Thanh nút tự ẩn khi không di chuột
  let idle;
  function wake() { nav.classList.remove('hide'); document.body.style.cursor = ''; clearTimeout(idle); idle = setTimeout(() => { nav.classList.add('hide'); document.body.style.cursor = 'none'; }, 2600); }
  window.addEventListener('mousemove', wake); wake();

  /* ---------- Bụi trong không khí ---------- */
  const ctx = dust.getContext('2d');
  const P = Array.from({ length: 90 }, () => ({
    x: Math.random() * 1920, y: Math.random() * 1080, r: Math.random() * 1.8 + .5,
    vx: (Math.random() - .5) * .12, vy: -Math.random() * .22 - .04, a: Math.random() * .6 + .25, ph: Math.random() * 6.28
  }));
  let tick = 0;
  function frame() {
    tick++;
    const cs = getComputedStyle(stage);
    const bx = parseFloat(cs.getPropertyValue('--bx')) || 960;
    const bw = parseFloat(cs.getPropertyValue('--bw')) || 600;
    const bo = parseFloat(cs.getPropertyValue('--bo')) || 0;
    ctx.clearRect(0, 0, 1920, 1080);
    for (const p of P) {
      p.x += p.vx + Math.sin(tick / 200 + p.ph) * .08; p.y += p.vy;
      if (p.y < -10) { p.y = 1090; p.x = Math.random() * 1920; }
      if (p.x < -10) p.x = 1930; if (p.x > 1930) p.x = -10;
      const half = (bw / 2) * (.1 + .9 * Math.min(1, Math.max(0, p.y / 1100)));
      const inside = Math.abs(p.x - bx) < half;
      const alpha = p.a * (inside ? (.25 + .7 * bo) : .05) * (.7 + .3 * Math.sin(tick / 40 + p.ph));
      ctx.fillStyle = `rgba(255, 238, 208, ${alpha.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Bắt đầu ---------- */
  const start = parseInt((location.hash || '').slice(1), 10);
  go(start >= 1 && start <= total ? start - 1 : 0, 0);
  window.__deck = { go, next, prev, maxStep, get state() { return { cur, step }; } };   // phục vụ kiểm thử
})();
