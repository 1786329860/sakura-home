/* ============================================================
   tool-hub.js — 小工具中心
   渲染工具网格 + 弹窗承载 + 五个樱花主题工具的实现
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const catalog = window.SkyToolCatalog;
  if (!catalog) return;

  const grid = document.getElementById('tool-grid');
  const modal = document.getElementById('tool-modal');
  const modalTitle = document.getElementById('tool-modal-title');
  const modalDesc = document.getElementById('tool-modal-desc');
  const modalIcon = document.getElementById('tool-modal-icon');
  const modalBody = document.getElementById('tool-modal-body');
  const filterBtns = document.querySelectorAll('.tool-filter');

  let activeFilter = 'all';
  let activeCleanup = null;

  function toast(msg) {
    if (window.SkyToast) window.SkyToast.show(msg);
  }

  /* ---------------- 网格渲染 ---------------- */
  function renderGrid() {
    const list = catalog.byCategory(activeFilter);
    grid.innerHTML = list.map((t) =>
      '<button type="button" class="neo-flat tool-card" data-tool="' + t.id + '">' +
      '  <div class="tool-card__icon">' + t.icon + '</div>' +
      '  <span class="tool-card__tag">' + t.tag + '</span>' +
      '  <h3>' + t.name + '</h3>' +
      '  <p>' + t.desc + '</p>' +
      '</button>'
    ).join('');
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.toolFilter;
      filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      renderGrid();
    });
  });

  /* ---------------- 弹窗 ---------------- */
  function openTool(id) {
    const tool = catalog.get(id);
    if (!tool || !modal) return;

    modalTitle.textContent = tool.name;
    modalDesc.textContent = tool.desc;
    modalIcon.textContent = tool.icon;
    modalBody.innerHTML = '';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    const impl = implementations[id];
    if (impl) {
      const cleanup = impl(modalBody);
      activeCleanup = (typeof cleanup === 'function') ? cleanup : null;
    }
  }

  function closeTool() {
    if (!modal || modal.hidden) return;
    if (typeof activeCleanup === 'function') {
      try { activeCleanup(); } catch (e) { /* noop */ }
    }
    activeCleanup = null;
    modalBody.innerHTML = '';
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('[data-tool]');
    if (card) openTool(card.dataset.tool);
  });

  modal.querySelectorAll('[data-close-tool]').forEach((el) => {
    el.addEventListener('click', closeTool);
  });

  window.SkyToolHub = { open: openTool, close: closeTool };

  /* ============================================================
     工具实现区：每个函数接收容器元素，返回清理函数
     ============================================================ */

  const implementations = {
    /* ---------- 1. 樱花色卡 ---------- */
    'sakura-palette': function (root) {
      const PRESETS = [
        { name: '早樱 · 晨光', colors: ['#f6c6d8', '#fde3ec', '#fff4f2', '#ffd9c2'] },
        { name: '樱吹雪 · 晴昼', colors: ['#ef9fbc', '#fcd5e3', '#fff2f6', '#ffffff'] },
        { name: '夕樱 · 晚照', colors: ['#d98ba8', '#eeb8cf', '#ffd3c2', '#ffe9d4'] },
        { name: '夜樱 · 星蓝', colors: ['#6f5a86', '#9b7ba8', '#d0b8d8', '#f2e3f2'] },
        { name: '樱叶 · 初绿', colors: ['#a9c8a4', '#cfe3c8', '#f0f5e8', '#fdf6ec'] },
        { name: '落樱 · 水面', colors: ['#e58fae', '#f7c3d2', '#fde9e5', '#e8f4f4'] },
      ];

      root.innerHTML =
        '<div class="palette-toolbar">' +
        '  <button type="button" class="neo-btn" id="palette-random"><i class="fas fa-shuffle"></i> 换一换</button>' +
        '  <button type="button" class="neo-btn" id="palette-time"><i class="fas fa-clock"></i> 按当前时间</button>' +
        '</div>' +
        '<div class="tool-grid" id="palette-grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr));"></div>';

      const pGrid = root.querySelector('#palette-grid');

      function cssOf(colors) {
        return 'linear-gradient(180deg, ' +
          colors[0] + ' 0%, ' + colors[1] + ' 40%, ' + colors[2] + ' 75%, ' + colors[3] + ' 100%)';
      }

      function timePalette() {
        const h = new Date().getHours();
        let a, b;
        if (h < 6) { a = PRESETS[3].colors; b = PRESETS[0].colors; }
        else if (h < 11) { a = PRESETS[0].colors; b = PRESETS[1].colors; }
        else if (h < 17) { a = PRESETS[1].colors; b = PRESETS[1].colors; }
        else if (h < 19) { a = PRESETS[1].colors; b = PRESETS[2].colors; }
        else { a = PRESETS[2].colors; b = PRESETS[3].colors; }
        const t = Math.random();
        const colors = a.map((c, i) => mixColor(c, b[i], t));
        return { name: '此刻 · 樱花', colors };
      }

      function mixColor(c1, c2, t) {
        const p = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
        const [r1, g1, b1] = p(c1);
        const [r2, g2, b2] = p(c2);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
      }

      function render(list) {
        pGrid.innerHTML = list.map((pal, idx) =>
          '<div class="palette-chip" data-idx="' + idx + '" style="background:' + cssOf(pal.colors) + ';">' +
          '  <div class="palette-chip__name">' + pal.name + '</div>' +
          '  <div class="palette-chip__colors">' + pal.colors.map((c) => '<span style="background:' + c + ';"></span>').join('') + '</div>' +
          '  <div class="palette-chip__css">background: ' + cssOf(pal.colors) + ';</div>' +
          '</div>'
        ).join('');
      }

      let current = PRESETS.slice();
      render(current);

      root.querySelector('#palette-random').addEventListener('click', () => {
        const base = PRESETS[Math.floor(Math.random() * PRESETS.length)];
        const other = PRESETS[Math.floor(Math.random() * PRESETS.length)];
        const colors = base.colors.map((c, i) => mixColor(c, other.colors[i], Math.random()));
        current = [{ name: '随机 · 花笺', colors }];
        render(current);
      });

      root.querySelector('#palette-time').addEventListener('click', () => {
        current = [timePalette()];
        render(current);
      });

      pGrid.addEventListener('click', (e) => {
        const chip = e.target.closest('.palette-chip');
        if (!chip) return;
        const pal = current[Number(chip.dataset.idx)];
        const css = 'background: ' + cssOf(pal.colors) + ';';
        const done = () => toast('🎨 CSS 已复制到剪贴板');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(css).then(done).catch(() => { fallbackCopy(css); done(); });
        } else {
          fallbackCopy(css);
          done();
        }
      });

      function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* noop */ }
        ta.remove();
      }

      return null;
    },

    /* ---------- 2. 花瓣画板 ---------- */
    'petal-sketchpad': function (root) {
      root.innerHTML =
        '<div class="sketch-toolbar">' +
        '  <div class="sketch-size">' +
        '    <button type="button" data-size="3" style="width:10px;height:10px;"></button>' +
        '    <button type="button" data-size="8" style="width:16px;height:16px;"></button>' +
        '    <button type="button" data-size="16" style="width:24px;height:24px;"></button>' +
        '    <button type="button" data-size="30" style="width:34px;height:34px;"></button>' +
        '  </div>' +
        '  <button type="button" class="sketch-color" data-color="#ffffff" style="background:#ffffff;"></button>' +
        '  <button type="button" class="sketch-color" data-color="#f4a6c4" style="background:#f4a6c4;"></button>' +
        '  <button type="button" class="sketch-color" data-color="#d94f7c" style="background:#d94f7c;"></button>' +
        '  <button type="button" class="sketch-color" data-color="#ffd9a8" style="background:#ffd9a8;"></button>' +
        '  <button type="button" class="sketch-color" data-color="#b8d9a8" style="background:#b8d9a8;"></button>' +
        '  <button type="button" class="sketch-color" data-color="#9b7ba8" style="background:#9b7ba8;"></button>' +
        '  <span style="flex:1;"></span>' +
        '  <button type="button" class="neo-btn" id="sketch-clear"><i class="fas fa-eraser"></i> 清空</button>' +
        '  <button type="button" class="neo-btn" id="sketch-save"><i class="fas fa-download"></i> 保存 PNG</button>' +
        '</div>' +
        '<canvas class="sketch-canvas" id="sketch-canvas" width="800" height="440"></canvas>';

      const canvas = root.querySelector('#sketch-canvas');
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      let color = '#d94f7c';
      let size = 8;
      let drawing = false;
      let lastX = 0;
      let lastY = 0;

      function setup() {
        const cssW = canvas.clientWidth || 800;
        const cssH = Math.round(cssW * 0.55);
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        canvas.style.height = cssH + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      setup();

      function pos(e) {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }

      function down(e) {
        drawing = true;
        const p = pos(e);
        lastX = p.x; lastY = p.y;
        canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      }

      function move(e) {
        if (!drawing) return;
        const p = pos(e);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        lastX = p.x; lastY = p.y;
      }

      function up() { drawing = false; }

      canvas.addEventListener('pointerdown', down);
      canvas.addEventListener('pointermove', move);
      canvas.addEventListener('pointerup', up);
      canvas.addEventListener('pointerleave', up);

      root.querySelectorAll('.sketch-color').forEach((b) => {
        b.addEventListener('click', () => {
          color = b.dataset.color;
          root.querySelectorAll('.sketch-color').forEach((x) => x.classList.remove('active'));
          b.classList.add('active');
        });
      });

      root.querySelectorAll('[data-size]').forEach((b) => {
        b.addEventListener('click', () => { size = Number(b.dataset.size); });
      });

      root.querySelector('#sketch-clear').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      });

      root.querySelector('#sketch-save').addEventListener('click', () => {
        const a = document.createElement('a');
        a.download = '花瓣涂鸦-' + Date.now() + '.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
        toast('✏️ 画作已保存');
      });

      return null;
    },

    /* ---------- 3. 花签 ---------- */
    'sakura-fortune': function (root) {
      const QUOTES = [
        ['🌸', '风来听风，雨来赏雨，风遇山止，船到岸停。', '—— 你的签名'],
        ['💮', '樱花落下的速度是秒速五厘米，而美好值得慢慢收藏。', '今日花签：慢'],
        ['🌺', '花期会过，但看过花的人会记得整个春天。', '今日宜赏花'],
        ['🎐', '风铃响了，是樱花在替远方的人说你好。', '今日好运'],
        ['🍡', '把烦恼折进花瓣，让风带走。', '今日轻盈'],
        ['🌷', '花不知道自己的花期，只管开得认真。', '今日笃定'],
        ['🌟', '走得慢一点没关系，只要方向是心里的光。', '今日重启'],
        ['🍃', '今天的日子，值得配一杯茶和一场樱花。', '今日自由'],
      ];

      root.innerHTML =
        '<div class="fortune-stage">' +
        '  <div class="fortune-card" id="fortune-card">' +
        '    <div class="fortune-emoji" id="fortune-emoji">🍀</div>' +
        '    <div class="fortune-text" id="fortune-text">点击下面的按钮，抽一支今日的花签</div>' +
        '    <div class="fortune-sub" id="fortune-sub">樱花会把想说的话捎给你</div>' +
        '  </div>' +
        '  <button type="button" class="neo-btn" id="fortune-btn" style="font-size:1rem;padding:12px 30px;">' +
        '    <i class="fas fa-wind"></i> 抽一签' +
        '  </button>' +
        '</div>';

      const card = root.querySelector('#fortune-card');
      let lastIdx = -1;

      root.querySelector('#fortune-btn').addEventListener('click', () => {
        let idx;
        do { idx = Math.floor(Math.random() * QUOTES.length); } while (idx === lastIdx && QUOTES.length > 1);
        lastIdx = idx;
        const q = QUOTES[idx];
        card.classList.remove('flipping');
        void card.offsetWidth; // 重启动画
        card.classList.add('flipping');
        setTimeout(() => {
          root.querySelector('#fortune-emoji').textContent = q[0];
          root.querySelector('#fortune-text').textContent = q[1];
          root.querySelector('#fortune-sub').textContent = q[2];
        }, 350);
      });

      return null;
    },

    /* ---------- 4. 接樱花瓣 ---------- */
    'petal-catch': function (root) {
      root.innerHTML =
        '<div class="game-wrap">' +
        '  <div class="game-hud">' +
        '    <span><i class="fas fa-star"></i>得分 <b id="pc-score">0</b></span>' +
        '    <span><i class="fas fa-heart"></i>生命 <b id="pc-lives">3</b></span>' +
        '    <span><i class="fas fa-clock"></i>时间 <b id="pc-time">60</b>s</span>' +
        '  </div>' +
        '  <canvas class="game-canvas" id="pc-canvas" width="560" height="360"></canvas>' +
        '  <p class="game-tip">移动鼠标 / 触摸 / 方向键 ←→ 控制花篮接住飘落的樱花瓣</p>' +
        '</div>';

      const canvas = root.querySelector('#pc-canvas');
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const W = 560;
      const H = 360;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const state = {
        score: 0,
        lives: 3,
        timeLeft: 60,
        running: false,
        over: false,
        basketX: W / 2,
        basketW: 84,
        petals: [],
        spawnTimer: 0,
        lastNow: 0,
      };

      let rafId = 0;
      let timerId = 0;

      const scoreEl = root.querySelector('#pc-score');
      const livesEl = root.querySelector('#pc-lives');
      const timeEl = root.querySelector('#pc-time');

      function rand(a, b) { return a + Math.random() * (b - a); }

      function spawnPetal() {
        state.petals.push({
          x: rand(30, W - 30),
          y: -30,
          vy: rand(1.2, 2.4),
          sway: rand(1.4, 2.8),
          t: rand(0, Math.PI * 2),
          rot: rand(0, Math.PI * 2),
          size: rand(10, 16),
        });
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);

        // 花篮
        const bx = state.basketX;
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = '#b98a5e';
        ctx.beginPath();
        ctx.moveTo(bx - 44, H - 30);
        ctx.quadraticCurveTo(bx, H - 12, bx + 44, H - 30);
        ctx.lineTo(bx + 34, H - 22);
        ctx.quadraticCurveTo(bx, H - 48, bx - 34, H - 22);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🧺', bx, H - 26);

        // 樱花瓣
        for (const p of state.petals) {
          p.t += 0.03;
          p.y += p.vy;
          const x = p.x + Math.sin(p.t * p.sway) * 26;
          ctx.save();
          ctx.translate(x, p.y);
          ctx.rotate(Math.sin(p.t) * 0.7);
          ctx.fillStyle = Math.random() < 0.2 ? 'rgba(255,240,246,0.95)' : 'rgba(244,150,182,0.9)';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      function update(dt) {
        if (!state.running) return;

        state.spawnTimer -= dt;
        if (state.spawnTimer <= 0) {
          spawnPetal();
          state.spawnTimer = rand(420, 900);
        }

        for (let i = state.petals.length - 1; i >= 0; i--) {
          const p = state.petals[i];
          const x = p.x + Math.sin(p.t * p.sway) * 26;
          if (p.y > H - 56 && p.y < H - 8 && Math.abs(x - state.basketX) < state.basketW / 2) {
            state.petals.splice(i, 1);
            state.score += 10;
            scoreEl.textContent = state.score;
            continue;
          }
          if (p.y > H + 20) {
            state.petals.splice(i, 1);
            state.lives -= 1;
            livesEl.textContent = state.lives;
            if (state.lives <= 0) endGame();
          }
        }
      }

      function loop(now) {
        const dt = Math.min(now - state.lastNow, 100) || 16;
        state.lastNow = now;
        update(dt);
        draw();
        if (!state.over) rafId = requestAnimationFrame(loop);
      }

      function startGame() {
        Object.assign(state, {
          score: 0, lives: 3, timeLeft: 60, running: true, over: false,
          basketX: W / 2, petals: [], spawnTimer: 400,
        });
        scoreEl.textContent = '0';
        livesEl.textContent = '3';
        timeEl.textContent = '60';
        state.lastNow = performance.now();
        rafId = requestAnimationFrame(loop);
        timerId = setInterval(() => {
          if (!state.running) return;
          state.timeLeft -= 1;
          timeEl.textContent = state.timeLeft;
          if (state.timeLeft <= 0) endGame();
        }, 1000);
      }

      function endGame() {
        if (state.over) return;
        state.over = true;
        state.running = false;
        cancelAnimationFrame(rafId);
        clearInterval(timerId);

        let best = 0;
        try { best = Number(localStorage.getItem('sky_petal_best') || 0); } catch (e) { /* noop */ }
        const isBest = state.score > best;
        if (isBest) {
          try { localStorage.setItem('sky_petal_best', String(state.score)); } catch (e) { /* noop */ }
        }

        // 结算遮罩
        ctx.fillStyle = 'rgba(122,52,72,0.72)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 30px "Microsoft YaHei", sans-serif';
        ctx.fillText(isBest ? '🌸 新纪录！' : '🍃 时间到', W / 2, H / 2 - 34);
        ctx.font = '22px "Microsoft YaHei", sans-serif';
        ctx.fillText('得分 ' + state.score + ' · 最高 ' + Math.max(best, state.score), W / 2, H / 2 + 12);
        ctx.font = '16px "Microsoft YaHei", sans-serif';
        ctx.fillText('点击画布再来一局', W / 2, H / 2 + 52);
      }

      canvas.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scale = W / rect.width;
        state.basketX = Math.min(Math.max((e.clientX - rect.left) * scale, state.basketW / 2), W - state.basketW / 2);
      });

      canvas.addEventListener('click', () => {
        if (state.over || !state.running) startGame();
      });

      window.addEventListener('keydown', onKey);
      function onKey(e) {
        if (e.key === 'ArrowLeft') state.basketX = Math.max(state.basketX - 26, state.basketW / 2);
        if (e.key === 'ArrowRight') state.basketX = Math.min(state.basketX + 26, W - state.basketW / 2);
      }

      startGame();

      return () => {
        cancelAnimationFrame(rafId);
        clearInterval(timerId);
        window.removeEventListener('keydown', onKey);
      };
    },

    /* ---------- 5. 樱花连连看 ---------- */
    'sakura-match': function (root) {
      const EMOJIS = ['🌸', '🌺', '💮', '🏵️', '🌷', '🍡', '🎐', '🍃'];

      root.innerHTML =
        '<div class="game-hud" style="justify-content:center;gap:26px;">' +
        '  <span><i class="fas fa-shoe-prints"></i>步数 <b id="cm-moves">0</b></span>' +
        '  <span><i class="fas fa-clock"></i>用时 <b id="cm-time">0</b>s</span>' +
        '</div>' +
        '<div class="match-grid" id="cm-grid"></div>' +
        '<p class="game-tip" style="text-align:center;">翻开两张一样的樱花卡片，用最少的步数完成配对</p>';

      const mGrid = root.querySelector('#cm-grid');
      const movesEl = root.querySelector('#cm-moves');
      const timeEl = root.querySelector('#cm-time');

      let cards = [];
      let first = null;
      let lock = false;
      let moves = 0;
      let matched = 0;
      let seconds = 0;
      let started = false;
      let timerId = 0;

      function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      }

      function build() {
        cards = shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
          id: i, emoji, flipped: false, matched: false,
        }));
        first = null;
        lock = false;
        moves = 0;
        matched = 0;
        seconds = 0;
        started = false;
        movesEl.textContent = '0';
        timeEl.textContent = '0';
        clearInterval(timerId);
        render();
      }

      function render() {
        mGrid.innerHTML = cards.map((c) =>
          '<button type="button" class="match-card' + (c.flipped || c.matched ? ' flipped' : '') + (c.matched ? ' matched' : '') + '" data-id="' + c.id + '">' +
          '  <span class="match-face match-back">🌸</span>' +
          '  <span class="match-face match-front">' + c.emoji + '</span>' +
          '</button>'
        ).join('');
      }

      mGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.match-card');
        if (!btn || lock) return;
        const card = cards[Number(btn.dataset.id)];
        if (card.flipped || card.matched) return;

        if (!started) {
          started = true;
          timerId = setInterval(() => {
            seconds += 1;
            timeEl.textContent = seconds;
          }, 1000);
        }

        card.flipped = true;
        render();

        if (!first) {
          first = card;
          return;
        }

        moves += 1;
        movesEl.textContent = moves;
        lock = true;

        if (first.emoji === card.emoji) {
          first.matched = true;
          card.matched = true;
          matched += 2;
          first = null;
          lock = false;
          render();
          if (matched === cards.length) {
            clearInterval(timerId);
            setTimeout(() => {
              toast('🌸 完成配对！' + moves + ' 步 · ' + seconds + ' 秒');
            }, 350);
          }
        } else {
          setTimeout(() => {
            first.flipped = false;
            card.flipped = false;
            first = null;
            lock = false;
            render();
          }, 750);
        }
      });

      build();

      return () => { clearInterval(timerId); };
    },
  };

  renderGrid();
});
