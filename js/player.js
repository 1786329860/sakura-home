/* ============================================================
   player.js — 黑胶唱片机
   曲目来自 data/settings.json 的 music 数组
   播放时黑胶旋转、唱针落下；支持进度条点击定位
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const widget = document.querySelector('.music-player-widget');
  const audio = new Audio();
  audio.preload = 'none';

  const titleEl = document.getElementById('song-title');
  const artistEl = document.getElementById('song-artist');
  const playBtn = document.getElementById('play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const progressTrack = document.getElementById('progress-track');
  const progressFill = document.getElementById('progress-fill');

  if (!widget || !audio) return;

  const playlist = [];
  let index = -1;
  let playing = false;

  // 双击打开（file://）时浏览器拦截 fetch 读不了 settings.json，用内置兜底曲目
  const FALLBACK_MUSIC = [
    { title: '越来越不懂', artist: '蔡健雅', url: 'assets/audio/yue-lai-yue-bu-dong.mp3', cover: 'assets/avatar/daniya.png' },
  ];

  async function loadPlaylist() {
    try {
      const res = await fetch('data/settings.json', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.music) && data.music.length) {
        playlist.push(...data.music);
        return;
      }
    } catch (e) { /* file:// 下 fetch 被拦截，走兜底 */ }
    playlist.push(...FALLBACK_MUSIC);
  }

  function setMeta() {
    const track = playlist[index];
    if (titleEl) titleEl.textContent = track ? track.title : '樱之电台 · 暂无曲目';
    if (artistEl) artistEl.textContent = track ? track.artist : '在 settings.json 的 music 里添加音乐吧';
    const label = document.getElementById('vinyl-label');
    if (label) {
      label.innerHTML = track && track.cover
        ? '<img src="' + track.cover + '" alt="曲目封面">'
        : '🌸';
    }
  }

  function setPlaying(on) {
    playing = on;
    if (widget) widget.classList.toggle('playing', on);
    if (playBtn) playBtn.innerHTML = on ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    if (playBtn) playBtn.setAttribute('aria-label', on ? '暂停' : '播放');
  }

  function updateProgress() {
    if (!progressFill || !audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
  }

  function loadTrack(i) {
    if (!playlist.length) return;
    index = (i + playlist.length) % playlist.length;
    const track = playlist[index];
    audio.src = track.url;
    audio.load();
    setMeta();
    if (progressFill) progressFill.style.width = '0%';
  }

  function playTrack() {
    if (!playlist.length) {
      if (window.SkyToast) window.SkyToast.show('还没有曲目：在 data/settings.json 里添加 music');
      return;
    }
    if (index < 0) loadTrack(0);
    audio.play().then(() => setPlaying(true)).catch(() => {
      if (window.SkyToast) window.SkyToast.show('播放被浏览器拦截，请再点一次播放');
    });
  }

  function pauseTrack() {
    audio.pause();
    setPlaying(false);
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (playing) pauseTrack(); else playTrack();
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { loadTrack(index - 1); if (playing) audio.play(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { loadTrack(index + 1); if (playing) audio.play(); });

  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', () => { loadTrack(index + 1); audio.play(); });
  audio.addEventListener('error', () => {
    if (window.SkyToast) window.SkyToast.show('曲目加载失败，试试下一首');
  });

  if (progressTrack) {
    progressTrack.addEventListener('click', (e) => {
      if (!audio.duration || !playlist.length) return;
      const rect = progressTrack.getBoundingClientRect();
      const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      audio.currentTime = ratio * audio.duration;
      updateProgress();
    });
  }

  // 页面隐藏时不中断（后台播放由浏览器决定），保持状态一致
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing && audio.paused) setPlaying(false);
  });

  loadPlaylist().then(() => {
    if (playlist.length) { loadTrack(0); } else { setMeta(); }
  });
});
