/* ============================================================
   sky-bg.js — 樱花粒子背景
   花瓣缓缓飘落（摇摆 + 旋转）+ 光斑浮动 + 风痕
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('sky-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let running = true;
  let rafId = 0;
  let lastTime = 0;

  const petals = [];  // 樱花花瓣
  const motes = [];   // 光斑
  const streaks = []; // 风痕

  function rand(min, max) { return min + Math.random() * (max - min); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---- 樱花花瓣 ---- */
  function spawnPetal(initial) {
    return {
      x: rand(-30, width + 30),
      y: initial ? rand(0, height) : rand(-80, -20),
      size: rand(4, 9),
      fall: rand(0.35, 1.1),       // 下落速度
      sway: rand(0.6, 1.6),        // 摇摆幅度
      swaySpeed: rand(0.8, 2.2),   // 摇摆频率
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-1.6, 1.6),
      phase: rand(0, Math.PI * 2),
      alpha: rand(0.3, 0.72),
      white: Math.random() < 0.32, // 少量浅白花瓣
    };
  }

  function drawPetal(p, now) {
    const t = now * 0.001;
    const x = p.x + Math.sin(t * p.swaySpeed + p.phase) * 26 * p.sway;
    const y = p.y + t * p.fall * 60;
    const rot = p.rot + t * p.rotSpeed;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.white ? 'rgba(255,246,249,0.95)' : 'rgba(244,154,184,0.8)';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    // 花瓣凹口：在花瓣一端叠加背景色小椭圆
    ctx.globalAlpha = p.alpha * 0.9;
    ctx.fillStyle = p.white ? 'rgba(255,255,255,0.9)' : 'rgba(255,214,230,0.9)';
    ctx.beginPath();
    ctx.ellipse(p.size * 0.45, 0, p.size * 0.34, p.size * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ---- 光斑 ---- */
  function spawnMote() {
    return {
      x: rand(0, width),
      y: rand(0, height),
      r: rand(1.2, 3.4),
      vy: rand(-0.1, -0.28),
      vx: rand(-0.08, 0.08),
      phase: rand(0, Math.PI * 2),
      alpha: rand(0.2, 0.6),
    };
  }

  function drawMote(m, t) {
    const twinkle = 0.55 + 0.45 * Math.sin(t * 0.002 + m.phase);
    ctx.globalAlpha = m.alpha * twinkle;
    ctx.fillStyle = '#fff5f9';
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ---- 风痕 ---- */
  function spawnStreak() {
    return {
      x: rand(0, width),
      y: rand(height * 0.15, height * 0.85),
      len: rand(50, 160),
      speed: rand(1.4, 3.2),
      alpha: 0,
      fade: rand(0.002, 0.005),
    };
  }

  function drawStreak(s) {
    s.x += s.speed;
    s.alpha = Math.min(s.alpha + s.fade, 0.12);
    const grad = ctx.createLinearGradient(s.x - s.len, s.y, s.x, s.y);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(1, 'rgba(255,214,230,' + s.alpha + ')');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(s.x - s.len, s.y);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
  }

  function init() {
    resize();
    petals.length = 0;
    for (let i = 0; i < 26; i++) petals.push(spawnPetal(true));
    motes.length = 0;
    for (let i = 0; i < 30; i++) motes.push(spawnMote());
    streaks.length = 0;
  }

  let streakTimer = rand(2, 5) * 1000;

  function loop(now) {
    if (!running) return;
    const dt = Math.min(now - lastTime, 100) || 16;
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    // 花瓣
    for (const p of petals) {
      const y = p.y + (now * 0.001) * p.fall * 60;
      if (y > height + 30) {
        Object.assign(p, spawnPetal(false));
        continue;
      }
      drawPetal(p, now);
    }

    // 光斑
    for (const m of motes) {
      m.y += m.vy * dt * 0.06;
      m.x += m.vx * dt * 0.06;
      if (m.y < -10) { Object.assign(m, spawnMote()); m.y = height + 10; }
      if (m.x < -10) m.x = width + 10;
      if (m.x > width + 10) m.x = -10;
      drawMote(m, now);
    }

    // 风痕
    streakTimer -= dt;
    if (streakTimer <= 0) {
      streaks.push(spawnStreak());
      streakTimer = rand(2, 5) * 1000;
    }
    for (let i = streaks.length - 1; i >= 0; i--) {
      drawStreak(streaks[i]);
      if (streaks[i].x - streaks[i].len > width) streaks.splice(i, 1);
    }

    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (!running) return;
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  /* ---- 对外：开场结束时的花瓣绽放 ---- */
  function burst(count) {
    for (let i = 0; i < (count || 1); i++) {
      petals.push({
        x: width * 0.5 + rand(-120, 120),
        y: height * 0.45 + rand(-80, 80),
        size: rand(5, 10),
        fall: rand(0.5, 1.2),
        sway: rand(0.8, 1.8),
        swaySpeed: rand(1, 2.4),
        rot: rand(0, Math.PI * 2),
        rotSpeed: rand(-2, 2),
        phase: rand(0, Math.PI * 2),
        alpha: rand(0.6, 0.95),
        white: Math.random() < 0.3,
      });
    }
  }

  window.SkyInkBackground = { burst };

  // 页面不可见时暂停
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  window.addEventListener('resize', init);

  init();
  if (!reducedMotion) start();
})();
