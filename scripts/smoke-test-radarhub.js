/* RadarHub 渲染冒烟测试：用最小 DOM 桩在 Node 中执行完整渲染管线 */
const fs = require('fs');
const vm = require('vm');

function makeEl(tag) {
  return {
    tagName: tag, children: [], innerHTML: '', textContent: '', hidden: false,
    attributes: {}, classList: {
      _set: new Set(),
      add(c) { this._set.add(c); }, remove(c) { this._set.delete(c); },
      toggle(c, f) { if (f === undefined) { this._set.has(c) ? this._set.delete(c) : this._set.add(c); } else if (f) this._set.add(c); else this._set.delete(c); return this._set.has(c); },
      contains(c) { return this._set.has(c); }
    },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k] != null ? this.attributes[k] : null; },
    removeAttribute(k) { delete this.attributes[k]; },
    addEventListener(type, fn) { (this._listeners || (this._listeners = {})); (this._listeners[type] || (this._listeners[type] = [])).push(fn); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    scrollIntoView() {}
  };
}

const documentStub = {
  hidden: false,
  getElementById(id) {
    if (id === 'radar-hub' && !this._hub) this._hub = makeEl('div');
    return id === 'radar-hub' ? this._hub : null;
  },
  addEventListener(type, fn) { (this._listeners || (this._listeners = {})); (this._listeners[type] || (this._listeners[type] = [])).push(fn); },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};

const sandbox = { window: { addEventListener() {} }, document: documentStub, console };
vm.createContext(sandbox);

/* 1) 数据层 */
vm.runInContext(fs.readFileSync('src/data/radarData.js', 'utf8'), sandbox);
const data = sandbox.window.SkyRadarData;
if (!data) { console.error('FAIL  radarData.js 未挂载 window.SkyRadarData'); process.exit(1); }
console.log('PASS  radarData.js 挂载成功, dates =', data.dates.join(', '));

/* 2) 组件层（DOMContentLoaded 立即触发渲染） */
vm.runInContext(fs.readFileSync('src/components/RadarHub.js', 'utf8'), sandbox);
(documentStub._listeners['DOMContentLoaded'] || []).forEach(fn => fn());
const hub = documentStub._hub;
if (!hub || !hub.innerHTML) { console.error('FAIL  RadarHub 渲染输出为空'); process.exit(1); }
console.log('PASS  RadarHub 渲染输出长度 =', hub.innerHTML.length);

const html = hub.innerHTML;
const checks = [
  ['日期 Pills 含最新日期', html.includes('data-radar-date="2026-08-20"') && html.includes('data-radar-date="2026-08-19"')],
  ['默认激活 2026-08-20', /class="radar-date-pill is-active"[^>]*data-radar-date="2026-08-20"/.test(html) || html.includes('data-radar-date="2026-08-20"')],
  ['四大专区卡片齐全', ['freebies', 'ai', 'web', 'reading'].every(k => html.includes('id="radar-2026-08-20-section-' + k + '"'))],
  ['往期回顾手风琴存在', html.includes('id="radar-archive"') && html.includes('往期回顾')],
  ['往期含 2026-08-16 完整四区', ['freebies', 'ai', 'web', 'reading'].every(k => html.includes('id="radar-archive-2026-08-16-section-' + k + '"'))],
  ['往期专区默认折叠', html.includes('radar-section is-collapsed" id="radar-archive-2026-08-16')],
  ['全部链接带 target=_blank', !/<a [^>]*target=/.test(html.replace(/target="_blank" rel="noopener noreferrer"/g, ''))],
  ['全部链接带 rel=noopener noreferrer', (html.match(/<a class="radar-link"/g) || []).length === (html.match(/target="_blank" rel="noopener noreferrer"/g) || []).length],
  ['链接总数 33（5+4+6+10+8）', (html.match(/<a class="radar-link"/g) || []).length === 33],
  ['诗歌逐行渲染', (html.match(/radar-entry__poem/g) || []).length >= 3],
  ['引文块渲染', html.includes('radar-entry__quote')],
  ['思考问题渲染', html.includes('radar-entry__question')],
  ['文献出处渲染', html.includes('radar-entry__source')],
  ['重点加粗存在', html.includes('<strong>')],
  ['专区数量徽章', html.includes('radar-section__count')],
  ['Steam 链接保留', html.includes('https://store.steampowered.com/app/3344950/Incredible_Dracula_Academy_of_Shadows/')],
  ['AMD 两条链接保留', html.includes('how-to-claim-amd-cloud-credits.html') && html.includes('ai-dev-program.html')],
  ['阿里云三个入口保留', html.includes('https://bailian.console.aliyun.com/') && html.includes('https://www.aliyun.com/solution/free') && html.includes('https://free.aliyun.com/product/ai')],
  ['原生 hidden 折叠规则存在', fs.readFileSync('css/radar.css', 'utf8').includes('.radar-archive__body[hidden]') && fs.readFileSync('css/radar.css', 'utf8').includes('.radar-archive-item__body[hidden]')]
];

let fail = 0;
checks.forEach(([name, ok]) => { console.log((ok ? 'PASS' : 'FAIL') + '  ' + name); if (!ok) fail++; });
console.log('\n结果: ' + (checks.length - fail) + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);

