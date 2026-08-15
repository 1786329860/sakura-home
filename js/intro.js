/* ============================================================
   intro.js — 樱花铁路开场（复刻自 ztorch.fun 的 sakura-intro.js）
   一个封顶 2.35 秒的一次性开场：海报兜底 → 视频淡入 →
   花瓣画布 → 标题浮现 → 自动退场；支持跳过 / 重放 / Esc
   ============================================================ */

(() => {
  'use strict';

  const splash = document.getElementById('splash-screen');
  const video = document.getElementById('intro-video');
  const canvas = document.getElementById('intro-canvas');
  const skip = document.getElementById('skip-intro');
  const replay = document.getElementById('replay-intro');
  if (!splash) return;

  const context = canvas?.getContext?.('2d');
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection?.saveData);
  const videoSources = video ? [...video.querySelectorAll('source')].map((source) => source.getAttribute('src') || '') : [];
  const petalState = [];
  const timeouts = new Set();
  let frameId = 0;
  let startedAt = 0;
  let active = false;
  let hidden = false;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let videoReleased = false;

  const session = {
    get(key) { try { return sessionStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch (_) { /* Optional state. */ } },
    remove(key) { try { sessionStorage.removeItem(key); } catch (_) { /* Optional state. */ } },
  };

  const verses = [
    ['樱花落尽春将困，秋千架下归时。', '李煜《谢新恩》'],
    ['小园新种红樱树，闲绕花枝便当游。', '白居易《酬韩侍郎张博士雨后游曲江见寄》'],
    ['山樱如美人，红颜易消歇。', '邓溥雅《樱花》'],
    ['把日子过成星期日，风里都是樱花的甜。', '今日短句'],
  ];

  function todayIndex() {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts();
      const value = parts.map((part) => part.value).join('');
      return [...value].reduce((hash, char) => ((hash * 33) + char.charCodeAt(0)) >>> 0, 5381) % verses.length;
    } catch (_) {
      return new Date().getDate() % verses.length;
    }
  }

  function setVerse() {
    const target = document.getElementById('intro-daily-verse');
    if (!target) return;
    const verse = verses[todayIndex()];
    target.textContent = `${verse[0]} —— ${verse[1]}`;
  }

  function schedule(callback, delay) {
    const timer = window.setTimeout(() => {
      timeouts.delete(timer);
      callback();
    }, delay);
    timeouts.add(timer);
    return timer;
  }

  function clearTimers() {
    timeouts.forEach((timer) => window.clearTimeout(timer));
    timeouts.clear();
  }

  function resizeCanvas() {
    if (!canvas || !context) return;
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seedPetals() {
    petalState.length = 0;
    const count = Math.max(9, Math.min(18, Math.round(width / 110)));
    for (let index = 0; index < count; index += 1) {
      petalState.push({
        x: ((index * 97) % Math.max(width, 1)) - 20,
        y: ((index * 53) % Math.max(height * 0.64, 1)) - 20,
        drift: 14 + (index % 5) * 5,
        fall: 18 + (index % 4) * 7,
        size: 4 + (index % 4),
        angle: index * 0.67,
      });
    }
  }

  function draw(now) {
    if (!active || !context) return;
    const elapsed = Math.min(2.35, (now - startedAt) / 1000);
    context.clearRect(0, 0, width, height);
    const opacity = Math.min(1, elapsed / 0.45) * Math.max(0, 1 - Math.max(0, elapsed - 1.35) / 1.2);
    context.globalAlpha = opacity * 0.72;
    petalState.forEach((petal, index) => {
      const x = petal.x + elapsed * petal.drift + Math.sin(elapsed * 2 + petal.angle) * 18;
      const y = petal.y + elapsed * petal.fall;
      context.save();
      context.translate(x, y);
      context.rotate(elapsed * (index % 2 ? 2 : -2) + petal.angle);
      context.fillStyle = index % 3 === 0 ? 'rgba(255,246,249,.95)' : 'rgba(244,154,184,.76)';
      context.beginPath();
      context.ellipse(0, 0, petal.size, petal.size * 0.48, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    });
    if (elapsed < 2.35) frameId = requestAnimationFrame(draw);
  }

  function restoreVideo() {
    if (!video || !videoReleased) return;
    video.querySelectorAll('source').forEach((source, index) => {
      source.src = videoSources[index] || '';
    });
    video.load();
    videoReleased = false;
  }

  function releaseVideo() {
    if (!video || videoReleased) return;
    video.pause();
    video.querySelectorAll('source').forEach((source) => source.removeAttribute('src'));
    video.removeAttribute('src');
    video.load();
    videoReleased = true;
  }

  function stopMedia(release = false) {
    active = false;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    clearTimers();
    petalState.length = 0;
    if (context) context.clearRect(0, 0, width, height);
    if (video) {
      video.pause();
      if (!videoReleased) video.currentTime = 0;
      video.removeAttribute('data-playing');
    }
    if (release) releaseVideo();
  }

  function finish(hideDelay = 280) {
    if (hidden && splash.style.display === 'none') return;
    stopMedia(true);
    hidden = true;
    session.set('skyIntroPlayed', '1');
    splash.classList.add('loaded');
    splash.classList.remove('is-video-ready', 'is-rail-visible', 'is-title-visible');
    // 通知主背景做一次粒子绽放，并触发生日彩蛋检查
    window.SkyInkBackground?.burst?.(4);
    window.dispatchEvent(new CustomEvent('sky-intro-end'));
    schedule(() => { splash.style.display = 'none'; }, hideDelay);
  }

  function leave(fast = false) {
    if (!active) return;
    splash.classList.add('is-leaving');
    if (fast) splash.classList.add('is-skip');
    if (fast) {
      finish(280);
      return;
    }
    schedule(() => finish(280), 370);
  }

  function tryVideo() {
    if (!video || reduceMotion || saveData) return;
    restoreVideo();
    let settled = false;
    const markReady = () => {
      if (settled || !active) return;
      settled = true;
      splash.classList.add('is-video-ready');
    };
    schedule(() => {
      if (!settled) {
        settled = true;
        splash.classList.remove('is-video-ready');
      }
    }, 500);
    video.muted = true;
    video.currentTime = 0;
    video.play().then(() => {
      video.dataset.playing = 'true';
      if (video.readyState >= 2) markReady();
      else video.addEventListener('canplay', markReady, { once: true });
    }).catch(() => { splash.classList.remove('is-video-ready'); });
  }

  function play(force = false) {
    if (!force && session.get('skyIntroPlayed') === '1') {
      hidden = true;
      splash.classList.add('loaded');
      splash.style.display = 'none';
      releaseVideo();
      return;
    }
    stopMedia();
    hidden = false;
    active = true;
    splash.style.display = 'grid';
    splash.classList.remove('loaded', 'is-video-ready', 'is-rail-visible', 'is-title-visible', 'is-leaving', 'is-skip');
    startedAt = performance.now();
    setVerse();
    resizeCanvas();

    if (reduceMotion || saveData) {
      splash.classList.add('is-title-visible');
      schedule(() => leave(true), 320);
      return;
    }

    seedPetals();
    frameId = requestAnimationFrame(draw);
    tryVideo();
    schedule(() => splash.classList.add('is-rail-visible'), 350);
    schedule(() => splash.classList.add('is-title-visible'), 1050);
    schedule(() => leave(false), 2350);
  }

  skip?.addEventListener('click', () => leave(true));
  replay?.addEventListener('click', () => {
    session.remove('skyIntroPlayed');
    play(true);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && active) leave(true);
  });
  window.addEventListener('resize', resizeCanvas, { passive: true });
  video?.addEventListener('error', () => splash.classList.remove('is-video-ready'));

  setVerse();
  window.SkyIntro = Object.freeze({ play, hide: () => leave(true) });
  play();
})();
