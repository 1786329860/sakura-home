/* ============================================================
   birthday-special.js — 生日彩蛋
   当系统日期命中 settings.birthday (MM-DD) 时，
   开场结束后弹出气球 + 樱花祝福卡
   ============================================================ */

(function () {
  'use strict';

  const overlay = document.getElementById('birthday-overlay');
  if (!overlay) return;

  const STORAGE_KEY = 'sky_birthday_seen_';

  async function loadSettings() {
    try {
      const res = await fetch('data/settings.json', { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  function todayKey() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return mm + '-' + dd;
  }

  function celebrate(name) {
    if (document.hidden) return;

    overlay.setAttribute('aria-hidden', 'false');
    overlay.innerHTML = '';

    // 云朵气球画布
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    overlay.appendChild(canvas);

    const card = document.createElement('div');
    card.className = 'birthday-card';
    card.innerHTML =
      '<span style="font-size:2.4rem;">🎂</span>' +
      '<h2>生日快乐，' + name + '！</h2>' +
      '<p>愿你新的一岁，风自由、花常开，天天都是星期日。</p>' +
      '<button type="button" class="neo-btn" id="birthday-close"><i class="fas fa-gift"></i> 收下祝福</button>';
    overlay.appendChild(card);

    document.getElementById('birthday-close').addEventListener('click', () => {
      overlay.innerHTML = '';
      overlay.setAttribute('aria-hidden', 'true');
    });

    // 气球动画
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ['#f4a6c4', '#ffd9a8', '#e5b8dc', '#ffc2c9', '#b8d9a8'];
    const balloons = Array.from({ length: 16 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 300,
      r: 16 + Math.random() * 14,
      vy: 0.8 + Math.random() * 1.6,
      wob: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let raf = 0;
    function anim() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const b of balloons) {
        b.y -= b.vy;
        b.wob += 0.02;
        const x = b.x + Math.sin(b.wob) * 22;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.ellipse(x, b.y, b.r, b.r * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(90,110,140,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, b.y + b.r * 1.2);
        ctx.quadraticCurveTo(x + 4, b.y + b.r * 1.2 + 14, x + 2, b.y + b.r * 1.2 + 24);
        ctx.stroke();
      }
      balloons.splice(0, 0);
      if (balloons.some((b) => b.y > -60)) {
        raf = requestAnimationFrame(anim);
      }
    }
    raf = requestAnimationFrame(anim);
    setTimeout(() => cancelAnimationFrame(raf), 26000);
  }

  async function init() {
    const settings = await loadSettings();
    const birthday = settings && settings.birthday;
    if (!birthday || !/^\d{2}-\d{2}$/.test(birthday)) return;
    if (todayKey() !== birthday) return;

    const name = (settings && settings.profile_name) || '朋友';
    const key = STORAGE_KEY + birthday;
    let celebrated = false;
    try { celebrated = localStorage.getItem(key) === String(new Date().getFullYear()); } catch (e) { /* noop */ }

    if (celebrated) return;

    window.addEventListener('sky-intro-end', () => {
      celebrate(name);
      try { localStorage.setItem(key, String(new Date().getFullYear())); } catch (e) { /* noop */ }
    });
  }

  init();
})();
