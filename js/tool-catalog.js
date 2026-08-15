/* ============================================================
   tool-catalog.js — 小工具注册表
   每个工具：id / 名称 / 描述 / 图标 / 分类
   具体实现在 tool-hub.js 中按 id 挂载
   ============================================================ */

(function () {
  'use strict';

  const tools = [
    {
      id: 'sakura-palette',
      name: '樱花色卡',
      desc: '生成樱花渐变色卡，一键复制 CSS 渐变代码。',
      icon: '🎨',
      category: 'tool',
      tag: '创作工具',
    },
    {
      id: 'petal-sketchpad',
      name: '花瓣画板',
      desc: '在樱色画布上随手涂鸦，可保存为 PNG。',
      icon: '✏️',
      category: 'tool',
      tag: '创作工具',
    },
    {
      id: 'sakura-fortune',
      name: '花签',
      desc: '抽一支今日的花签，看看樱花捎来哪句话。',
      icon: '🍀',
      category: 'tool',
      tag: '创作工具',
    },
    {
      id: 'petal-catch',
      name: '接樱花瓣',
      desc: '移动花篮接住飘落的樱花瓣，60 秒挑战。',
      icon: '🌸',
      category: 'game',
      tag: '小游戏',
    },
    {
      id: 'sakura-match',
      name: '樱花连连看',
      desc: '翻开樱花卡片，用最少的步数找出所有配对。',
      icon: '💮',
      category: 'game',
      tag: '小游戏',
    },
  ];

  window.SkyToolCatalog = {
    tools,
    get(id) {
      return tools.find((t) => t.id === id) || null;
    },
    byCategory(category) {
      return category === 'all' ? tools : tools.filter((t) => t.category === category);
    },
  };
})();
