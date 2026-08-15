/* ============================================================
   main.js — 应用主逻辑
   路由 / 场景切换 / 模拟时钟 / 天气 / 内容加载 /
   文章弹窗 / 留言板 / 最近更新 / 提示气泡
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ---------------- 工具函数 ---------------- */
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function fetchJson(url) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  window.SkyToast = { show: toast };

  /* ---------------- 元素 ---------------- */
  const navButtons = document.querySelectorAll('.nav-btn[data-page]');
  const navCards = document.querySelectorAll('[data-page-link]');
  const sections = document.querySelectorAll('.page-section');
  const sceneSidebar = window.SkySceneSidebar;
  const sceneRegistry = window.SkySceneRegistry;

  const PAGES = ['home', 'logs', 'acg', 'notes', 'guest', 'game'];
  const pageTitles = {
    home: '首页',
    logs: '生活志',
    acg: 'ACG 收藏',
    notes: '随笔',
    guest: '留言板',
    game: '小工具&小游戏',
  };

  /* ---------------- 路由 ---------------- */
  let currentPage = 'home';
  let restoredScroll = false;

  function switchPage(page, pushHash) {
    if (!PAGES.includes(page)) page = 'home';

    sections.forEach((s) => s.classList.toggle('active', s.id === page + '-page'));
    navButtons.forEach((b) => {
      const active = b.dataset.page === page;
      b.classList.toggle('active', active);
      if (active) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });

    currentPage = page;
    if (sceneSidebar) sceneSidebar.apply(page);

    const scene = sceneRegistry ? sceneRegistry.get(page) : null;
    document.title = page === 'home'
      ? '乐享星期日 · 樱华小屋'
      : pageTitles[page] + ' · 樱华小屋';

    if (pushHash !== false) {
      try {
        if (location.hash !== '#' + page) history.replaceState(null, '', '#' + page);
      } catch (e) { /* noop */ }
    }

    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  navButtons.forEach((b) => {
    b.addEventListener('click', () => switchPage(b.dataset.page, true));
  });

  navCards.forEach((c) => {
    c.addEventListener('click', () => switchPage(c.dataset.pageLink, true));
  });

  window.addEventListener('hashchange', () => {
    const page = location.hash.replace('#', '') || 'home';
    if (page !== currentPage) switchPage(page, false);
  });

  /* ---------------- 模拟时钟 ---------------- */
  const hourHand = document.getElementById('hour-hand');
  const minuteHand = document.getElementById('minute-hand');
  const secondHand = document.getElementById('second-hand');

  function tickClock() {
    const now = new Date();
    const s = now.getSeconds();
    const m = now.getMinutes();
    const h = now.getHours() % 12;
    if (hourHand) hourHand.style.transform = 'rotate(' + ((h + m / 60) * 30) + 'deg)';
    if (minuteHand) minuteHand.style.transform = 'rotate(' + ((m + s / 60) * 6) + 'deg)';
    if (secondHand) secondHand.style.transform = 'rotate(' + (s * 6) + 'deg)';
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------------- 天气（open-meteo，失败回退到静态文案） ---------------- */
  const WEATHER_CODES = {
    0: ['fas fa-sun', '晴空万里'],
    1: ['fas fa-sun', '基本晴朗'],
    2: ['fas fa-cloud-sun', '晴间多云'],
    3: ['fas fa-cloud', '多云'],
    45: ['fas fa-smog', '轻雾'],
    48: ['fas fa-smog', '雾'],
    51: ['fas fa-cloud-rain', '毛毛雨'],
    53: ['fas fa-cloud-rain', '小雨'],
    55: ['fas fa-cloud-rain', '小雨'],
    61: ['fas fa-cloud-showers-heavy', '小雨'],
    63: ['fas fa-cloud-showers-heavy', '中雨'],
    65: ['fas fa-cloud-showers-heavy', '大雨'],
    71: ['fas fa-snowflake', '小雪'],
    73: ['fas fa-snowflake', '中雪'],
    75: ['fas fa-snowflake', '大雪'],
    80: ['fas fa-cloud-rain', '阵雨'],
    81: ['fas fa-cloud-rain', '阵雨'],
    82: ['fas fa-cloud-showers-heavy', '强阵雨'],
    95: ['fas fa-bolt', '雷阵雨'],
    96: ['fas fa-bolt', '雷阵雨伴冰雹'],
    99: ['fas fa-bolt', '强雷暴'],
  };

  async function loadWeather(settings) {
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const iconEl = document.querySelector('.weather-icon');
    if (!tempEl || !descEl) return;

    const conf = (settings && settings.weather) || {};
    if (conf.provider === 'open-meteo' && conf.latitude != null && conf.longitude != null) {
      try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + conf.latitude +
          '&longitude=' + conf.longitude + '&current_weather=true';
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const cw = data.current_weather;
          if (cw && cw.temperature != null) {
            const code = WEATHER_CODES[cw.weathercode] || ['fas fa-cloud-sun', '微风轻拂'];
            tempEl.textContent = Math.round(cw.temperature) + '°C';
            descEl.textContent = (conf.city ? conf.city + ' · ' : '') + code[1];
            if (iconEl) {
              iconEl.className = 'weather-icon ' + code[0];
            }
            return;
          }
        }
      } catch (e) { /* 回退到静态文案 */ }
    }
    tempEl.textContent = '24°C';
    descEl.textContent = '微风 · 樱花轻摇';
  }

  /* ---------------- 站点设置注入 ---------------- */
  async function applySettings(settings) {
    if (!settings) return;
    const s = settings;

    if (s.profile_name) {
      const el = document.querySelector('.profile-name');
      if (el) el.textContent = s.profile_name;
    }
    if (s.profile_motto) {
      const el = document.querySelector('.profile-motto');
      if (el) el.textContent = '“' + s.profile_motto + '”';
    }
    if (s.profile_avatar) {
      const el = document.getElementById('profile-avatar-img');
      if (el) el.src = s.profile_avatar;
    }
    const gh = document.querySelector('.social-btn[aria-label="GitHub"]');
    if (gh && s.github_url) gh.href = s.github_url;
    const mail = document.querySelector('.social-btn[aria-label="邮箱"]');
    if (mail && s.email) mail.href = 'mailto:' + s.email;
    if (s.site_title) document.title = s.site_title;
    if (s.footer_text) {
      const el = document.querySelector('footer div:nth-of-type(2)');
      if (el) el.textContent = s.footer_text;
    }
  }

  /* ---------------- 内容加载与渲染 ---------------- */
  const cmsState = {
    life: { status: 'loading', items: [] },
    acg: { status: 'loading', items: [] },
    notes: { status: 'loading', items: [] },
  };

  const TYPE_LABEL = { life: '生活日志', acg: 'ACG 收藏', note: '随笔' };

  function renderLogs() {
    const container = document.querySelector('.timeline-container');
    if (!container) return;
    const items = cmsState.life.items;
    if (!items.length) return; // 保留 HTML 内 fallback

    container.innerHTML = items.map((p) =>
      '<div class="timeline-item" data-slug="' + escapeHtml(p.slug || p.id) + '">' +
      '  <div class="timeline-node"></div>' +
      '  <article class="neo-flat log-card" data-post="' + escapeHtml(p.id) + '">' +
      '    <div class="log-header">' +
      '      <span class="log-date">' + escapeHtml(p.date) + '</span>' +
      '      <span class="log-mood">' + escapeHtml(p.mood || '☀️ 生活日志') + '</span>' +
      '    </div>' +
      '    <h2 class="log-title">' + escapeHtml(p.title) + '</h2>' +
      '    <p class="log-content">' + escapeHtml(p.summary || '') + '</p>' +
      '    <div class="log-media"><div class="polaroid-frame sky-emoji-frame">' + (p.emoji || '🌸') + '</div></div>' +
      '  </article>' +
      '</div>'
    ).join('');
  }

  function renderAcg() {
    const container = document.querySelector('.acg-grid');
    if (!container) return;
    const items = cmsState.acg.items;
    if (!items.length) return;

    container.innerHTML = items.map((p) =>
      '<article class="neo-flat acg-card" data-post="' + escapeHtml(p.id) + '">' +
      '  <div class="acg-banner sky-emoji-banner">' +
      '    <span class="acg-tag">' + escapeHtml(p.tag || '收藏') + '</span>' +
      (p.emoji || '🎬') +
      '  </div>' +
      '  <div class="acg-body">' +
      '    <h2 class="acg-title">' + escapeHtml(p.title) + '</h2>' +
      '    <p class="acg-review">' + escapeHtml(p.summary || '') + '</p>' +
      '    <div class="acg-score"><i class="fas fa-star"></i> ' + (p.score != null ? p.score + ' / 10' : '未评分') + '</div>' +
      '  </div>' +
      '</article>'
    ).join('');
  }

  function renderNotes() {
    const container = document.querySelector('.notes-grid');
    if (!container) return;
    const items = cmsState.notes.items;
    if (!items.length) return;

    container.innerHTML = items.map((p) =>
      '<article class="neo-flat note-card" data-post="' + escapeHtml(p.id) + '">' +
      '  <span class="note-kicker">Notes</span>' +
      '  <h2>' + escapeHtml(p.title) + '</h2>' +
      '  <p>' + escapeHtml(p.summary || '') + '</p>' +
      '  <span class="note-date">' + escapeHtml(p.date) + '</span>' +
      '</article>'
    ).join('');
  }

  function renderRecentUpdates() {
    const grid = document.getElementById('recent-updates-grid');
    const box = document.getElementById('recent-updates');
    if (!grid || !box) return;

    const all = [
      ...cmsState.life.items.map((p) => ({ ...p, kind: 'life' })),
      ...cmsState.acg.items.map((p) => ({ ...p, kind: 'acg' })),
      ...cmsState.notes.items.map((p) => ({ ...p, kind: 'note' })),
    ].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6);

    if (!all.length) return;

    box.hidden = false;
    grid.innerHTML = all.map((p) =>
      '<button type="button" class="neo-flat update-card" data-post="' + escapeHtml(p.id) + '">' +
      '  <span class="update-type">' + TYPE_LABEL[p.kind] + '</span>' +
      '  <h3>' + escapeHtml(p.title) + '</h3>' +
      '  <p>' + escapeHtml(p.summary || '') + '</p>' +
      '  <span class="update-date">' + escapeHtml(p.date) + '</span>' +
      '</button>'
    ).join('');
  }

  async function loadPosts() {
    const [life, acg, notes] = await Promise.all([
      fetchJson('data/posts-life.json'),
      fetchJson('data/posts-acg.json'),
      fetchJson('data/posts-notes.json'),
    ]);

    cmsState.life.items = (life && life.posts) || [];
    cmsState.acg.items = (acg && acg.posts) || [];
    cmsState.notes.items = (notes && notes.posts) || [];

    renderLogs();
    renderAcg();
    renderNotes();
    renderRecentUpdates();
    bindPostCards();
  }

  function findPost(id) {
    const all = [
      ...cmsState.life.items,
      ...cmsState.acg.items,
      ...cmsState.notes.items,
    ];
    return all.find((p) => String(p.id) === String(id)) || null;
  }

  /* ---------------- 文章弹窗 ---------------- */
  const articleModal = document.getElementById('article-modal');
  const viewCounts = (() => {
    try { return JSON.parse(localStorage.getItem('sky_view_counts') || '{}'); }
    catch (e) { return {}; }
  })();

  function openArticle(id) {
    const post = findPost(id);
    if (!post || !articleModal) return;

    viewCounts[id] = (viewCounts[id] || 0) + 1;
    try { localStorage.setItem('sky_view_counts', JSON.stringify(viewCounts)); } catch (e) { /* noop */ }

    document.getElementById('article-hero').textContent = post.emoji || '🌸';
    document.getElementById('article-type').textContent = TYPE_LABEL[post.type] || '随笔';
    document.getElementById('article-title').textContent = post.title;
    document.getElementById('article-meta').innerHTML =
      '<span><i class="fas fa-calendar-days"></i>' + escapeHtml(post.date) + '</span>' +
      (post.tag ? '<span><i class="fas fa-tag"></i>' + escapeHtml(post.tag) + '</span>' : '') +
      '<span><i class="fas fa-eye"></i>' + viewCounts[id] + ' 次阅读</span>';
    document.getElementById('article-body').innerHTML = post.content_html || '<p>' + escapeHtml(post.summary || '') + '</p>';

    articleModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeArticle() {
    if (!articleModal || articleModal.hidden) return;
    articleModal.hidden = true;
    document.body.style.overflow = '';
  }

  function bindPostCards() {
    document.querySelectorAll('[data-post]').forEach((el) => {
      el.addEventListener('click', () => openArticle(el.dataset.post));
    });
  }
  bindPostCards(); // HTML 内 fallback 卡片

  articleModal.querySelectorAll('[data-close-article]').forEach((el) => {
    el.addEventListener('click', closeArticle);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeArticle();
      closeToolIfAny();
    }
  });

  /* ---------------- 留言板 ---------------- */
  const stickerBoard = document.getElementById('sticker-board');
  const guestForm = document.getElementById('guestbook-form');
  const authorInput = document.getElementById('author-input');
  const messageInput = document.getElementById('message-input');
  const STORAGE_KEY = 'sky_guestbook';

  function loadGuestbook() {
    let stored = [];
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { stored = []; }
    return stored;
  }

  function saveGuestbook(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* noop */ }
  }

  function renderStickers(seed) {
    if (!stickerBoard) return;
    const stored = loadGuestbook();
    const all = [...stored, ...(seed || [])];

    if (!all.length) {
      stickerBoard.innerHTML = '<div class="sticker-empty">还没有留言，来放飞第一张樱花寄语吧 🌸</div>';
      return;
    }

    stickerBoard.innerHTML = all.map((c, i) =>
      '<div class="sticker-note paper-' + (i % 5) + '">' +
      '  <div class="sticker-author">' + escapeHtml(c.author) + '</div>' +
      '  <div class="sticker-content">' + escapeHtml(c.content) + '</div>' +
      '  <span class="sticker-date">' + escapeHtml(c.date) + '</span>' +
      '</div>'
    ).join('');
  }

  let guestSeed = [];

  async function initGuestbook() {
    const seed = await fetchJson('data/comments.json');
    guestSeed = seed && seed.comments ? seed.comments : [];
    renderStickers(guestSeed);
  }

  if (guestForm) {
    guestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = authorInput.value.trim();
      const content = messageInput.value.trim();
      if (!author || !content) return;

      const now = new Date();
      const date = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');

      const list = loadGuestbook();
      list.unshift({ author, content, date });
      if (list.length > 60) list.length = 60;
      saveGuestbook(list);
      renderStickers(guestSeed);
      messageInput.value = '';
      toast('🌸 留言已放飞！');
    });
  }

  /* ---------------- 关闭小工具弹窗（由 tool-hub 提供） ---------------- */
  function closeToolIfAny() {
    if (window.SkyToolHub && window.SkyToolHub.close) window.SkyToolHub.close();
  }

  /* ---------------- 启动 ---------------- */
  async function boot() {
    const settings = await fetchJson('data/settings.json');
    applySettings(settings);
    loadWeather(settings);

    const page = (location.hash.replace('#', '') || 'home');
    switchPage(PAGES.includes(page) ? page : 'home', false);

    loadPosts();
    initGuestbook();
  }

  boot();
});
