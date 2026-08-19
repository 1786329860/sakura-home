/* ============================================================
   scene-registry.js — 场景注册表
   每个页面绑定一个"樱花场景"：标题 / 诗句 / 表情 / 氛围
   ============================================================ */

(function () {
  'use strict';

  const scenes = {
    home: {
      title: '樱晴 · 微风',
      verse: '樱花满开，去留无意。欢迎来到我的樱华小屋。',
      emoji: '🌸',
    },
    logs: {
      title: '樱吹雪 · 晨光',
      verse: '生活如樱，落笔成雪，记下来就成了自己的花季。',
      emoji: '🌬️',
    },
    acg: {
      title: '花见 · 晴昼',
      verse: '有些故事会开花，开过整个青春，落进心里。',
      emoji: '🎐',
    },
    notes: {
      title: '夕樱 · 书笺',
      verse: '风来听风，雨来赏雨，随手写下今日。',
      emoji: '🌇',
    },
    guest: {
      title: '夜樱 · 信箱',
      verse: '晚风经过樱树，替远方的人捎来一句话。',
      emoji: '📮',
    },
    radar: {
      title: '花信 · 雷达',
      verse: '把每天的风吹草动，折成一页可以回看的情报。',
      emoji: '📡',
    },
    game: {
      title: '樱游园',
      verse: '樱树下有一座游园，门票是一点童心。',
      emoji: '🎈',
    },
  };

  window.SkySceneRegistry = {
    scenes,
    get(page) {
      return scenes[page] || scenes.home;
    },
    pages() {
      return Object.keys(scenes);
    },
  };
})();
