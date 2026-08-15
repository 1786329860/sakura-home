/* ============================================================
   scene-sidebar.js — 场景侧边栏
   切换页面时：更新 body[data-scene]（天空换色）、
   渲染侧边栏场景卡、驱动小屏场景托盘
   ============================================================ */

(function () {
  'use strict';

  const registry = window.SkySceneRegistry;
  const contentEl = document.querySelector('[data-scene-content]');
  const contextEl = document.querySelector('.scene-context');
  const toggleBtn = document.getElementById('mobile-scene-toggle');
  const sidebar = document.getElementById('scene-sidebar');

  function apply(page) {
    // 1) 天空换色
    document.body.setAttribute('data-scene', page);

    // 2) 场景卡内容
    const scene = registry.get(page);
    if (contentEl) {
      contentEl.innerHTML =
        '<div class="scene-context__title">' + scene.title + '</div>' +
        '<div class="scene-context__verse">' + scene.verse + '</div>';
    }
    if (contextEl) {
      contextEl.setAttribute('data-emoji', scene.emoji);
      contextEl.hidden = false;
    }

    // 3) 小屏托盘按钮状态
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.innerHTML = '<i class="fas fa-tree"></i> 展开场景托盘';
      if (sidebar) sidebar.classList.remove('open');
    }
  }

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', String(open));
      toggleBtn.innerHTML = open
        ? '<i class="fas fa-tree"></i> 收起场景托盘'
        : '<i class="fas fa-tree"></i> 展开场景托盘';
    });
  }

  window.SkySceneSidebar = { apply };
})();
