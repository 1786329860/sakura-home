/* ============================================================
   RadarHub.js — 资讯雷达展示组件
   功能：日期维度聚合（默认最新一天）、四大专区折叠卡片、
        往期回顾手风琴、容器级滚动 + content-visibility 性能优化
   依赖：src/data/radarData.js（window.SkyRadarData）
   挂载：index.html 中 #radar-page 内的 #radar-hub 容器
   ============================================================ */

(function () {
  'use strict';

  var data = window.SkyRadarData;
  if (!data) return;

  /* ---------------- 工具函数 ---------------- */

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* 统一外链渲染：必须带 target=_blank + rel=noopener noreferrer */
  function renderLinks(links) {
    if (!links || !links.length) return '';
    return '<div class="radar-links">' + links.map(function (l) {
      return '<a class="radar-link" href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener noreferrer">' +
        '<i class="fas fa-external-link-alt"></i>' + escapeHtml(l.label) + '</a>';
    }).join('') + '</div>';
  }

  function renderBadges(badges) {
    if (!badges || !badges.length) return '';
    return '<div class="radar-badges">' + badges.map(function (b) {
      return '<span class="radar-badge">' + escapeHtml(b) + '</span>';
    }).join('') + '</div>';
  }

  /* ---------------- 福利条目 ---------------- */

  function renderFreebie(item) {
    var html = '<article class="radar-item">';

    html += '<header class="radar-item__head">' +
      '<span class="radar-item__rank">' + escapeHtml(item.rank) + '</span>' +
      '<div class="radar-item__title">' +
      '<h4>' + escapeHtml(item.name) + '</h4>' +
      '<div class="radar-item__meta">' +
      '<span class="radar-item__platform"><i class="fas fa-desktop"></i>' + escapeHtml(item.platform) + '</span>' +
      '<span class="radar-item__price">' +
      (item.priceWas && item.priceWas !== '—' ? '<s>' + escapeHtml(item.priceWas) + '</s><i class="fas fa-arrow-right"></i>' : '') +
      '<strong>' + escapeHtml(item.priceNow) + '</strong>' +
      '</span>' +
      '</div>' +
      '</div>' +
      renderBadges(item.badges) +
      '</header>';

    html += '<div class="radar-item__body">';

    if (item.details && item.details.length) {
      html += '<dl class="radar-item__details">' + item.details.map(function (d) {
        return '<div class="radar-item__detail-row">' +
          '<dt>' + escapeHtml(d.label) + '</dt>' +
          '<dd>' + escapeHtml(d.text) + '</dd>' +
          '</div>';
      }).join('') + '</dl>';
    }

    if (item.subItems && item.subItems.length) {
      html += '<ul class="radar-item__sublist">' + item.subItems.map(function (s) {
        return '<li><span class="radar-sub__name">' + escapeHtml(s.name) + '</span>' +
          '<span class="radar-sub__price">' + escapeHtml(s.price) + '</span></li>';
      }).join('') + '</ul>';
    }

    html += renderLinks(item.links);

    if (item.warning) {
      html += '<p class="radar-item__warning"><i class="fas fa-triangle-exclamation"></i>' + escapeHtml(item.warning) + '</p>';
    }

    html += '</div></article>';
    return html;
  }

  function renderFreebies(section) {
    var html = '';
    if (section.intro) {
      html += '<div class="radar-note radar-note--intro"><i class="fas fa-bolt"></i>' + escapeHtml(section.intro) + '</div>';
    }

    section.groups.forEach(function (group) {
      html += '<div class="radar-group radar-group--' + group.grade.toLowerCase() + '">' +
        '<h4 class="radar-group__title">' + escapeHtml(group.label) +
        '<span class="radar-group__count">' + group.items.length + ' 项</span></h4>' +
        group.items.map(renderFreebie).join('') +
        '</div>';
    });

    if (section.dedupNote) {
      html += '<div class="radar-note"><i class="fas fa-filter"></i>' + escapeHtml(section.dedupNote) + '</div>';
    }
    if (section.orderNote) {
      html += '<div class="radar-note radar-note--order"><i class="fas fa-list-ol"></i>' + escapeHtml(section.orderNote) + '</div>';
    }
    return html;
  }

  /* ---------------- AI 情报 ---------------- */

  function renderAi(section) {
    var html = '';

    if (section.scope) {
      html += '<div class="radar-note"><i class="fas fa-ruler"></i>' + escapeHtml(section.scope) + '</div>';
    }

    if (section.china && section.china.length) {
      html += '<h4 class="radar-group__title radar-group__title--cn">' + escapeHtml(section.chinaTitle || '中国 AI 福利') + '</h4>';
      html += section.china.map(function (item, i) {
        return '<article class="radar-ai-item">' +
          '<h5><span class="radar-ai-item__no">' + (i + 1) + '</span>' + escapeHtml(item.name) + '</h5>' +
          '<div class="radar-ai-item__lines">' + item.lines.map(function (line) {
            return '<p>' + escapeHtml(line) + '</p>';
          }).join('') + '</div>' +
          '</article>';
      }).join('');
    }

    if (section.global && section.global.length) {
      html += '<h4 class="radar-group__title radar-group__title--global">' + escapeHtml(section.globalTitle || '全球动态') + '</h4>';
      html += section.global.map(function (g) {
        return '<article class="radar-ai-item radar-ai-item--global"><p>' + escapeHtml(g) + '</p></article>';
      }).join('');
    }

    if (section.conclusion) {
      html += '<div class="radar-note radar-note--conclusion"><i class="fas fa-thumbtack"></i><span><strong>' +
        escapeHtml(section.conclusionTitle || '结论') + '：</strong>' + escapeHtml(section.conclusion) + '</span></div>';
    }
    if (section.orderNote) {
      html += '<div class="radar-note radar-note--order"><i class="fas fa-list-ol"></i>' + escapeHtml(section.orderNote) + '</div>';
    }
    if (section.sourcesNote) {
      html += '<div class="radar-note radar-note--sources"><i class="fas fa-book-open"></i>' + escapeHtml(section.sourcesNote) + '</div>';
    }
    return html;
  }

  /* ---------------- 互联网情报 ---------------- */

  function renderWeb(section) {
    var html = '';

    if (section.conclusion) {
      html += '<div class="radar-note radar-note--conclusion"><i class="fas fa-magnifying-glass"></i>' + escapeHtml(section.conclusion) + '</div>';
    }

    if (section.excluded && section.excluded.length) {
      html += '<h4 class="radar-group__title">' + escapeHtml(section.excludedTitle || '主动排除项') + '</h4>' +
        '<ul class="radar-excluded-list">' + section.excluded.map(function (e) {
          return '<li><i class="fas fa-circle-xmark"></i>' + escapeHtml(e) + '</li>';
        }).join('') + '</ul>';
    }

    if (section.structural && section.structural.length) {
      html += '<h4 class="radar-group__title">' + escapeHtml(section.structuralTitle || '结构性长期观察') + '</h4>' +
        '<ul class="radar-structural-list">' + section.structural.map(function (s) {
          return '<li><i class="fas fa-satellite-dish"></i>' + escapeHtml(s) + '</li>';
        }).join('') + '</ul>';
    }
    return html;
  }

  /* ---------------- 每日阅读 ---------------- */

  function renderReadingBlock(block) {
    switch (block.type) {
      case 'label':
        return '<h5 class="radar-entry__label"><span></span>' + escapeHtml(block.text) + '</h5>';
      case 'prose':
        return '<div class="radar-entry__prose">' + block.html + '</div>';
      case 'quote':
        return '<blockquote class="radar-entry__quote">' + block.html + '</blockquote>';
      case 'poem':
        return '<div class="radar-entry__poem">' + block.lines.map(function (l) {
          return '<p>' + escapeHtml(l) + '</p>';
        }).join('') + '</div>';
      case 'question':
        return '<div class="radar-entry__question"><i class="fas fa-circle-question"></i><span>' + escapeHtml(block.text) + '</span></div>';
      case 'source':
        return '<p class="radar-entry__source"><i class="fas fa-quote-left"></i>' + escapeHtml(block.text) + '</p>';
      default:
        return '';
    }
  }

  function renderReading(section) {
    var html = '<div class="radar-reading-keyword"><i class="fas fa-feather-pointed"></i>' +
      '<span>今日关键词：<strong>' + escapeHtml(section.keyword) + '</strong></span></div>';

    html += section.entries.map(function (entry) {
      return '<article class="radar-entry">' +
        '<header class="radar-entry__head">' +
        '<span class="radar-entry__no">' + escapeHtml(entry.no) + '</span>' +
        '<h4>' + escapeHtml(entry.title) + '</h4>' +
        '</header>' +
        '<div class="radar-entry__body">' +
        entry.blocks.map(renderReadingBlock).join('') +
        '</div>' +
        '</article>';
    }).join('');

    return html;
  }

  /* ---------------- 专区卡片 ---------------- */

  var SECTION_RENDERERS = {
    freebies: renderFreebies,
    ai: renderAi,
    web: renderWeb,
    reading: renderReading
  };

  function sectionCount(meta, day) {
    var s = day[meta.key];
    if (!s) return 0;
    if (meta.key === 'freebies') {
      return s.groups.reduce(function (n, g) { return n + g.items.length; }, 0);
    }
    if (meta.key === 'ai') {
      return (s.china ? s.china.length : 0) + (s.global ? s.global.length : 0);
    }
    if (meta.key === 'web') {
      return (s.excluded ? s.excluded.length : 0) + (s.structural ? s.structural.length : 0) + 1;
    }
    if (meta.key === 'reading') {
      return s.entries.length;
    }
    return 0;
  }

  function renderSectionCard(meta, day, opts) {
    opts = opts || {};
    var body = SECTION_RENDERERS[meta.key](day[meta.key]);
    var collapsed = opts.collapsed ? ' is-collapsed' : '';
    var id = (opts.idPrefix || 'radar') + '-section-' + meta.key;

    return '<section class="radar-section' + collapsed + '" id="' + id + '">' +
      '<button class="radar-section__head" type="button" aria-expanded="' + (!opts.collapsed) + '" aria-controls="' + id + '-body">' +
      '<span class="radar-section__icon">' + meta.icon + '</span>' +
      '<span class="radar-section__heading">' +
      '<span class="radar-section__title">' + escapeHtml(meta.title) +
      '<em class="radar-section__subtitle">' + escapeHtml(meta.subtitle) + '</em></span>' +
      '<span class="radar-section__desc">' + escapeHtml(meta.desc) + '</span>' +
      '</span>' +
      '<span class="radar-section__count">' + sectionCount(meta, day) + ' 条</span>' +
      '<i class="fas fa-chevron-down radar-section__chevron" aria-hidden="true"></i>' +
      '</button>' +
      '<div class="radar-section__body" id="' + id + '-body">' + body + '</div>' +
      '</section>';
  }

  function renderDayReport(date) {
    var day = data.get(date);
    if (!day) return '';
    return data.sections.map(function (meta) {
      return renderSectionCard(meta, day, { idPrefix: 'radar-' + date });
    }).join('');
  }

  /* ---------------- 主组件 ---------------- */

  var state = {
    activeDate: null,
    archiveOpen: false
  };

  function renderDatePills() {
    return data.dates.map(function (d, i) {
      var active = d === state.activeDate;
      return '<button class="radar-date-pill' + (active ? ' is-active' : '') + '" type="button" data-radar-date="' + d + '"' +
        (active ? ' aria-current="true"' : '') + '>' +
        (i === 0 ? '<span class="radar-date-pill__latest">最新</span>' : '') +
        '<i class="fas fa-calendar-day"></i>' + d +
        '</button>';
    }).join('');
  }

  function renderArchive() {
    var past = data.dates.filter(function (d) { return d !== state.activeDate; });
    if (!past.length) return '';

    var items = past.map(function (d) {
      var day = data.get(d);
      var counts = data.sections.map(function (meta) {
        return meta.icon + ' ' + meta.title + ' ' + sectionCount(meta, day) + ' 条';
      }).join(' · ');

      return '<div class="radar-archive-item" data-radar-archive-date="' + d + '">' +
        '<button class="radar-archive-item__head" type="button" aria-expanded="false" aria-controls="radar-archive-body-' + d + '">' +
        '<span class="radar-archive-item__date"><i class="fas fa-clock-rotate-left"></i>' + d + '</span>' +
        '<span class="radar-archive-item__summary">' + escapeHtml(counts) + '</span>' +
        '<i class="fas fa-chevron-down radar-archive-item__chevron" aria-hidden="true"></i>' +
        '</button>' +
        '<div class="radar-archive-item__body" id="radar-archive-body-' + d + '" hidden>' +
        data.sections.map(function (meta) {
          return renderSectionCard(meta, day, { collapsed: true, idPrefix: 'radar-archive-' + d });
        }).join('') +
        '</div>' +
        '</div>';
    }).join('');

    return '<section class="radar-archive glass-panel" id="radar-archive">' +
      '<button class="radar-archive__head" type="button" aria-expanded="' + state.archiveOpen + '" aria-controls="radar-archive-body">' +
      '<span class="radar-archive__heading">' +
      '<span class="radar-archive__eyebrow">ARCHIVE</span>' +
      '<span class="radar-archive__title">往期回顾</span>' +
      '<span class="radar-archive__desc">点击展开历史日期的完整四区报告，各专区可再单独展开</span>' +
      '</span>' +
      '<i class="fas fa-chevron-down radar-archive__chevron" aria-hidden="true"></i>' +
      '</button>' +
      '<div class="radar-archive__body" id="radar-archive-body"' + (state.archiveOpen ? '' : ' hidden') + '>' +
      items +
      '</div>' +
      '</section>';
  }

  function render() {
    var root = document.getElementById('radar-hub');
    if (!root) return;

    root.innerHTML =
      '<header class="radar-hub__header">' +
      '<div class="radar-hub__heading">' +
      '<span class="radar-hub__eyebrow">INFO RADAR · 资讯与内容聚合</span>' +
      '<h2>情报雷达</h2>' +
      '<p>四大专区按日期聚合：🎁 免费福利 · 🤖 AI 情报 · 🌐 互联网情报 · 📚 每日阅读。默认展示最新一天，往期报告在底部「往期回顾」中折叠展开。</p>' +
      '</div>' +
      '<div class="radar-hub__dates" role="group" aria-label="报告日期切换">' + renderDatePills() + '</div>' +
      '</header>' +
      '<div class="radar-hub__report" id="radar-report">' + renderDayReport(state.activeDate) + '</div>' +
      renderArchive();

    bindEvents(root);
  }

  /* ---------------- 交互 ---------------- */

  function bindEvents(root) {
    /* 日期切换（Tabs/Pills） */
    root.querySelectorAll('[data-radar-date]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var d = btn.getAttribute('data-radar-date');
        if (d === state.activeDate) return;
        state.activeDate = d;
        render();
        var report = document.getElementById('radar-report');
        if (report) report.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    /* 专区卡片折叠 */
    root.querySelectorAll('.radar-section__head').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.radar-section');
        var collapsed = card.classList.toggle('is-collapsed');
        btn.setAttribute('aria-expanded', String(!collapsed));
      });
    });

    /* 往期回顾手风琴 */
    var archiveHead = root.querySelector('.radar-archive__head');
    if (archiveHead) {
      archiveHead.addEventListener('click', function () {
        state.archiveOpen = !state.archiveOpen;
        var body = root.querySelector('#radar-archive-body');
        if (body) body.hidden = !state.archiveOpen;
        archiveHead.setAttribute('aria-expanded', String(state.archiveOpen));
        archiveHead.classList.toggle('is-open', state.archiveOpen);
      });
    }

    /* 单个往期日期展开 */
    root.querySelectorAll('.radar-archive-item__head').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.radar-archive-item');
        var body = item.querySelector('.radar-archive-item__body');
        var open = !body.hidden;
        body.hidden = open;
        btn.setAttribute('aria-expanded', String(!open));
        item.classList.toggle('is-open', !open);
      });
    });
  }

  /* ---------------- 启动 ---------------- */

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('radar-hub')) return;
    state.activeDate = data.latestDate();
    render();
  });
})();

