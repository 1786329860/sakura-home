/* 数据完整性校验：核对雷达数据集的链接、条目与结构 */
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('src/data/radarData.js', 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const data = sandbox.window.SkyRadarData;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name + (extra ? '  -> ' + extra : '')); }
}

/* 日期维度 */
check('dates 默认最新为 2026-08-20', data.dates[0] === '2026-08-20');
check('dates 含五天且新到旧', JSON.stringify(data.dates) === JSON.stringify(['2026-08-20', '2026-08-19', '2026-08-18', '2026-08-17', '2026-08-16']));

/* 期望链接全集 */
const EXPECT_LINKS = {
  '2026-08-19': [
    'https://apps.apple.com/us/app/toodl-timer/id6757822808',
    'https://www.giveawayoftheday.com/anymp4-4k-converter/',
    'https://rtila.com/downloads/free-lifetime-license/',
    'https://seedesktop.com/',
    'https://game.giveawayoftheday.com/arcanoid-voxel-arcade/'
  ],
  '2026-08-20': [
    'https://www.giveawayoftheday.com/tipard-fixmp4-video-repair-1-0-36/',
    'https://winningpc.com/ashampoo-privacy-inspector-free-license-code/',
    'https://game.giveawayoftheday.com/top-down-3d-pixel-sandbox/',
    'https://play.google.com/store/apps/details?id=com.eggies.logoguesschallenge'
  ],
  '2026-08-18': [
    'https://www.softorbits.net/actions/getfreekey.html?pid=2&a_aid=70',
    'https://winningpc.com/multcloud-premium-giveaway-free-account/',
    'https://www.acdsee.com/en/courses/alec-watson/',
    'https://play.google.com/store/apps/details?id=tv.remote.control.universal.smart.plus.tcl',
    'https://play.google.com/store/apps/details?id=spy.camera.network.scanner.pro',
    'https://play.google.com/store/apps/details?id=com.starblaster.athree.epl.gp'
  ],
  '2026-08-16': [
    'https://www.giveawayoftheday.com/2026/08/16/',
    'https://game.giveawayoftheday.com/incredible-dracula-academy-of-shadows/',
    'https://store.steampowered.com/app/3344950/Incredible_Dracula_Academy_of_Shadows/',
    'https://itunes.apple.com/us/app/id6476618917?mt=8',
    'https://iphone.giveawayoftheday.com/currency/',
    'https://itunes.apple.com/us/app/id1487340415?mt=8',
    'https://iphone.giveawayoftheday.com/you-record-pro-2/',
    'https://www.amd.com/en/developer/resources/technical-articles/2026/how-to-claim-amd-cloud-credits.html',
    'https://www.amd.com/en/developer/ai-dev-program.html',
    'https://game.giveawayoftheday.com/'
  ],
  '2026-08-17': [
    'https://www.giveawayoftheday.com/neat-projects-3/',
    'https://iphone.giveawayoftheday.com/i-ching/',
    'https://vovsoft.com/giveaway/free-blur-multiple-images-2026/',
    'https://vovsoft.com/giveaway/free-batch-image-converter-2026/',
    'https://game.giveawayoftheday.com/vector-knot-engine/',
    'https://bailian.console.aliyun.com/',
    'https://www.aliyun.com/solution/free',
    'https://free.aliyun.com/product/ai'
  ]
};

function collectLinks(day) {
  const urls = [];
  day.freebies.groups.forEach(g => g.items.forEach(it => (it.links || []).forEach(l => urls.push(l.url))));
  return urls;
}

for (const date of Object.keys(EXPECT_LINKS)) {
  const day = data.get(date);
  check(date + ' 报告存在', !!day);
  const actual = collectLinks(day);
  const expected = EXPECT_LINKS[date];
  check(date + ' 链接数量 = ' + expected.length + '（实际 ' + actual.length + '）', actual.length === expected.length);
  const missing = expected.filter(u => !actual.includes(u));
  check(date + ' 链接 URL 100% 匹配', missing.length === 0, '缺失: ' + missing.join(', '));
  const badShape = [];
  day.freebies.groups.forEach(g => g.items.forEach(it => (it.links || []).forEach(l => {
    if (!/^https:\/\//.test(l.url) || !l.label) badShape.push(l.url);
  })));
  check(date + ' 链接均为 https 且带标签', badShape.length === 0, badShape.join(', '));
}

/* 条目数量 */
const d16 = data.get('2026-08-16'), d17 = data.get('2026-08-17');
const d18 = data.get('2026-08-18'), d19 = data.get('2026-08-19'), d20 = data.get('2026-08-20');
check('08-18 报告四区齐全', !!d18 && d18.freebies && d18.ai && d18.web && d18.reading);
check('08-19 报告四区齐全', !!d19 && d19.freebies && d19.ai && d19.web && d19.reading);
check('08-20 报告四区齐全', !!d20 && d20.freebies && d20.ai && d20.web && d20.reading);
check('08-19 福利共 5 项', d19.freebies.groups.reduce((n,g)=>n+g.items.length,0) === 5);
check('08-20 福利共 4 项', d20.freebies.groups.reduce((n,g)=>n+g.items.length,0) === 4);
check('08-18 福利共 6 项', d18.freebies.groups.reduce((n,g)=>n+g.items.length,0) === 6);
check('08-19 阅读共 6 篇', d19.reading.entries.length === 6);
check('08-20 阅读共 6 篇', d20.reading.entries.length === 6);
check('08-18 阅读共 6 篇', d18.reading.entries.length === 6);
check('08-18 AMD×魔搭 1000 小时以上算力', JSON.stringify(d18.ai.china).includes('1000 小时以上'));
check('08-20 Tipard 活动链接', d20.freebies.groups[0].items[0].links[0].url.includes('tipard-fixmp4-video-repair-1-0-36'));
check('08-20 Logo Guess 地区风险提示', d20.freebies.groups[2].items[1].warning.includes('结算前确认'));
check('08-20 阿里 AI 云营收 45%', JSON.stringify(d20.ai.global).includes('45%'));
check('08-20 互联网情报结论存在', d20.web.conclusion.includes('没有发现'));
check('08-16 福利共 6 项（4S+1A+1B）', d16.freebies.groups.reduce((n,g)=>n+g.items.length,0) === 6);
check('08-17 福利共 9 项（5S+3A+1B）', d17.freebies.groups.reduce((n,g)=>n+g.items.length,0) === 9);
check('08-16 阅读共 6 篇', d16.reading.entries.length === 6);
check('08-17 阅读共 6 篇', d17.reading.entries.length === 6);

/* 关键内容抽查 */
check('08-16 vTubeGo 原价 US$36', d16.freebies.groups[0].items[0].priceWas === 'US$36');
check('08-16 德古拉系统要求含 DirectX 11', d16.freebies.groups[0].items[1].details.some(d => d.text.includes('DirectX 11')));
check('08-16 AMD Fireworks 50 美元 90 天', JSON.stringify(d16.freebies.groups[1].items[0].details).includes('50 美元信用点，有效 90 天'));
check('08-16 腾讯混元 3D 200 积分', JSON.stringify(d16.ai.china).includes('混元生 3D 200 积分'));
check('08-16 Claude Sonnet 5 价格提醒', d16.ai.global[0].includes('$2/M Token'));
check('08-16 互联网情报宁缺毋滥', d16.web.conclusion.includes('宁缺毋滥'));
const tao = d16.reading.entries.find(e => e.title.includes('归园田居'));
check('归园田居 10 行', tao && tao.blocks.find(b => b.type === 'poem').lines.length === 10);
const du = d17.reading.entries.find(e => e.title.includes('春望'));
check('春望 8 句', du && du.blocks.find(b => b.type === 'poem').lines.length === 4 && du.blocks.find(b => b.type === 'poem').lines[0] === '国破山河在，城春草木深。');
check('08-17 火山方舟 Seedance 200 万 Token', JSON.stringify(d17.ai.china).includes('Seedance 视频多版本各 200 万 Token'));
check('08-17 GLM-4.7-Flash 永久免费', JSON.stringify(d17.ai.china).includes('官方永久免费提供'));
check('08-17 NEAT $99→免费', d17.freebies.groups[0].items[0].priceWas === '$99');
check('08-17 Vovsoft 模糊 8/18 截止', d17.freebies.groups[0].items[2].badges.some(b => b.includes('2026-08-18')));
check('08-17 去重说明含火山方舟付费 9.9', d17.freebies.dedupNote.includes('火山方舟付费 9.9'));
check('08-17 红楼梦 36501 块石头', JSON.stringify(d16.reading.entries).includes('36501 块石头'));

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);

