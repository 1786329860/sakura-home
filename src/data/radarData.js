/* ============================================================
   radarData.js — 资讯雷达数据层（全互联网羊毛雷达 + 情报聚合）
   数据结构接口约定（JSDoc 强类型描述）：

   @typedef {Object} RadarLink            链接对象
   @property {string} label               链接文案
   @property {string} url                 链接地址（渲染为 target=_blank + rel=noopener noreferrer）

   @typedef {Object} RadarDetail          福利条目明细行
   @property {string} label               字段名（用途 / 状态 / 系统要求 等）
   @property {string} text                字段内容

   @typedef {Object} RadarFreebie         单条福利
   @property {number} rank                序号
   @property {string} name                名称
   @property {string} platform            平台
   @property {string} priceWas            原价
   @property {string} priceNow            现价 / 免费说明
   @property {string[]} badges            等级与状态徽章
   @property {RadarDetail[]} [details]    明细字段
   @property {Array<{name:string, price:string}>} [subItems] 子条目（B 级汇总）
   @property {RadarLink[]} [links]        领取入口
   @property {string} [warning]           避坑提示

   @typedef {Object} RadarFreebieGroup    福利分组
   @property {string} grade               S / A / B
   @property {string} label               分组标题
   @property {RadarFreebie[]} items       福利列表

   @typedef {Object} RadarAiItem          AI 情报条目
   @property {string} name                条目名
   @property {string[]} lines             条目内容（每行渲染为一段）

   @typedef {Object} RadarReadingBlock    阅读块
   @property {'label'|'prose'|'quote'|'poem'|'question'|'source'} type 块类型
   @property {string} [text]              纯文本（label / source / question）
   @property {string} [html]              富文本（prose / quote，可含 <strong>）
   @property {string[]} [lines]           诗歌逐行（poem）

   @typedef {Object} RadarReadingEntry    每日阅读条目
   @property {string} no                  序号（01–06）
   @property {string} title               标题
   @property {RadarReadingBlock[]} blocks 内容块

   @typedef {Object} RadarDayReport       单日全量报告
   @property {Object} freebies            免费福利
   @property {Object} ai                  AI 情报
   @property {Object} web                 互联网情报
   @property {Object} reading             每日阅读
   ============================================================ */

(function () {
  'use strict';

  var REPORTS = {

    /* ==================== 2026-08-19 ==================== */
    '2026-08-19': {
      freebies: {
        intro: '严格历史去重后保留 5 项此前未推送、目前仍有效或值得立即检查的福利，优先处理 TOODL Timer、AnyMP4 4K Converter 与 RTILA Studio。',
        groups: [
          { grade: 'S', label: 'S级｜立即薅', items: [
            { rank: 1, name: 'TOODL Timer', platform: 'iPhone', priceWas: '约 US$0.99', priceNow: '当前限时免费', badges: ['🚨 S级', '⏳ 限时免费', '✅ App Store 确认'], details: [{ label: '用途', text: '基于实时交通与 GPS 反推出发时间，支持 ETA、交通提醒、倒计时和 Apple Maps 跳转。' }, { label: '状态', text: 'App Store 显示 Free，版本说明写明 Free for a limited time；无需信用卡，当前未显示订阅要求。' }], links: [{ label: 'App Store 领取入口', url: 'https://apps.apple.com/us/app/toodl-timer/id6757822808' }] }
          ] },
          { grade: 'A', label: 'A级｜高价值软件', items: [
            { rank: 2, name: 'AnyMP4 4K Converter 7.2.50', platform: 'Windows', priceWas: 'US$15.60/月', priceNow: '今日免费活动版本', badges: ['🔥 A级', '⏳ 仅今日窗口', '✅ Giveaway 页面确认'], details: [{ label: '用途', text: '4K/1080p/720p 视频格式转换、压缩、编辑及音视频转换。' }, { label: '授权说明', text: '活动页确认今日免费，但未清楚确认永久许可证；不要与官方 US$49.96 Lifetime License 混同。' }], links: [{ label: '活动领取入口', url: 'https://www.giveawayoftheday.com/anymp4-4k-converter/' }] }
          ] },
          { grade: 'B', label: 'B级｜长期福利与小型限免', items: [
            { rank: 3, name: 'RTILA Studio｜Free Lifetime License', platform: 'Windows/macOS/Linux', priceWas: '—', priceNow: '免费终身许可', badges: ['💡 B级', '♾️ Lifetime'], details: [{ label: '包含', text: '1 台设备、1 个活跃自动化项目，无限运行、AI Assistant、终身更新与 Bug 修复。' }, { label: '限制', text: '不含 Bot 编译、Cloud Run、多线程 Workers、Remote Execution/API、邮件工单支持；每账号限 1 个。' }], links: [{ label: '官方领取入口', url: 'https://rtila.com/downloads/free-lifetime-license/' }] },
            { rank: 4, name: 'SeeDesktop｜免费终身远程桌面许可证', platform: 'Windows/macOS/Linux', priceWas: '—', priceNow: 'Free Lifetime License', badges: ['💡 B级', '♾️ Lifetime'], details: [{ label: '免费版', text: '1 个并发连接，适合个人运维与轻量 IT；高级远程打印、完整文件传输等 Pro 能力需付费。' }], links: [{ label: '官方入口', url: 'https://seedesktop.com/' }] },
            { rank: 5, name: 'Arcanoid Voxel Arcade', platform: 'Windows 游戏', priceWas: 'US$5', priceNow: '今日免费', badges: ['💡 B级', '⏳ 仅今日窗口'], details: [{ label: '类型', text: '街机/打砖块式小游戏，控制挡板反弹投射物。' }], links: [{ label: '活动领取入口', url: 'https://game.giveawayoftheday.com/arcanoid-voxel-arcade/' }] }
          ] }
        ],
        dedupNote: '主动排除 Walkout Song DJ、Backblaze B2 Explorer、Yellow Note 等价格状态矛盾项目；Epic Caravan SandWitch、Vovsoft Batch Image Converter、阿里云百炼、AMD AI Developer Program、Microsoft for Startups 等已推送项目今日无实质变化，不重复推送。',
        orderNote: '建议领取顺序：TOODL Timer → AnyMP4 4K Converter → RTILA Studio；SeeDesktop 按需领取，Arcanoid Voxel Arcade 优先级较低。'
      },
      ai: {
        scope: '统计口径：北京时间 2026-08-19，当天新增优先；严格去重，不把前几天事件重新包装。',
        chinaTitle: '🇨🇳 中国 AI 福利', china: [{ name: '今日无新增中国 AI 高价值福利', lines: ['阿里云百炼、腾讯混元、火山方舟/豆包、智谱 GLM、AMD×ModelScope 等此前福利没有额度增加、延期或新增权益。MiniMax 免费用户速率限制属于账户政策，不等同于今日新 Credits。'] }],
        globalTitle: '🌍 今日重大 AI 情报', global: ['中国外交部反对在全球 AI 竞争中人为划分排他性阵营，主张各国自主选择 AI 合作伙伴；这显示竞争正扩展到数字主权、云、数据治理、模型标准和 API 生态。来源：Reuters，2026-08-19。', 'Reuters Breakingviews 将 Z.ai（智谱）视为中国前沿模型竞争中的潜在逆袭者，反映独立模型公司的研发、融资与商业化压力；这不是新的模型发布。'],
        conclusionTitle: '📌 今日判断', conclusion: '8 月 19 日不是旗舰模型发布日；更值得注意的是 AI 竞争向国际规则、技术阵营与长期资本能力扩展。OpenAI 今日无新旗舰模型、核心功能、价格变化或高价值免费活动。', orderNote: '福利栏宁可留空，也不重复昨日及此前已核验项目。', sourcesNote: '核验来源：Reuters、Reuters Breakingviews、各厂商官方文档。'
      },
      web: {
        conclusion: '2026-08-19 截至检索时点没有达到“当天首次发生/公布/实质进展 + 影响面足够大”门槛的可靠全球互联网重大事件，宁可短报也不以旧闻补数。',
        excludedTitle: '重点核验但主动排除', excluded: ['Cisco PSIRT 8 月 19 日安全公告预告尚未出现正式漏洞详情，暂不计为已发生事件。', '欧盟 AWS/Azure DMA gatekeeper 初步意见（6-25）与 Cloud and AI Development Act（6-3）均非今日新进展。', 'Cloudflare/Chrome/Firefox/Edge PACT 人机证明协议（6-22）与 Google Chrome AI 漏洞计划（7-30）均为既有趋势。'],
        structuralTitle: '接下来关注', structural: ['Cisco 后续正式披露是否出现高危/关键级远程利用或大范围在网设备影响。']
      },
      reading: {
        keyword: '世界越大，判断越轻：我们看到的是世界，还是自己熟悉的那一小块世界？',
        entries: [
          { no: '01', title: '《庄子·秋水》：真正危险的不是无知，而是不知道自己的尺度', blocks: [{ type: 'quote', html: '<p>“井蛙不可以语于海者，拘于虚也；夏虫不可以语于冰者，笃于时也；曲士不可以语于道者，束于教也。”</p>' }, { type: 'prose', html: '<p>庄子列出空间、时间与教育观念三种认知牢笼。算法也能把论文、数据、专家和同温层围成一口豪华的井，真正重要的是察觉井壁在哪里。</p>' }, { type: 'question', text: '你最近有没有因接触另一种生活或知识而改变判断？' }, { type: 'source', text: '来源：中国哲学书电子化计划《庄子·秋水》。' }] },
          { no: '02', title: '《论语·先进》“侍坐”：孔子为什么赞成看似没有事业心的人？', blocks: [{ type: 'quote', html: '<p>“莫春者，春服既成……浴乎沂，风乎舞雩，咏而归。”孔子曰：“吾与点也。”</p>' }, { type: 'prose', html: '<p>曾皙回答的不是要做成什么，而是希望世界最终呈现怎样的生活图景：政治与事业最后应抵达普通人能安心生活的暮春下午。</p>' }, { type: 'question', text: '如果拿掉职位、收入与成就，你会用什么具体场景描述想过的生活？' }, { type: 'source', text: '来源：中国哲学书电子化计划《论语·先进》及《四书章句集注》。' }] },
          { no: '03', title: '塞万提斯《堂吉诃德》：风车为什么四百年后仍然没有倒下？', blocks: [{ type: 'prose', html: '<p>堂吉诃德把风车认作巨人，失败后又以魔法师解释事实。人最难放弃的不是错误事实，而是让事实有意义的自我故事；桑丘与堂吉诃德则互相改变。</p>' }, { type: 'question', text: '如果一个事实会摧毁关于自己的整个故事，你会选择相信事实吗？' }, { type: 'source', text: '原作：Project Gutenberg；讲解：Yale Open Courses，Roberto González Echevarría。' }] },
          { no: '04', title: 'Robert Frost《After Apple-Picking》：得到一切以后为什么反而疲倦？', blocks: [{ type: 'quote', html: '<p>“For I have had too much / Of apple-picking: I am overtired / Of the great harvest I myself desired.”</p>' }, { type: 'prose', html: '<p>诗写的不是梦想破灭，而是愿望实现后仍可能疲惫；丰收制造价值标准，苹果太多后每一只都更容易被判定为不够好。</p>' }, { type: 'question', text: '如果真的得到现在拼命想要的东西，然后呢？' }, { type: 'source', text: '文本：Robert Frost《After Apple-Picking》；参考 Poetry Foundation。' }] },
          { no: '05', title: '李白《玉阶怨》：一句抱怨都没有，为什么整首诗都是怨？', blocks: [{ type: 'poem', lines: ['玉阶生白露，', '夜久侵罗袜。', '却下水晶帘，', '玲珑望秋月。'] }, { type: 'prose', html: '<p>诗删掉了谁未到、为何未到和她为何不说，只留下露水、罗袜、帘与月。阅读时也要问：作者故意没有写什么？</p>' }, { type: 'question', text: '你喜欢的作品里，有没有未说出口却比台词更强烈的情感？' }, { type: 'source', text: '原诗为公版；参考 Ezra Pound 英译附注及 Poetry Foundation。' }] },
          { no: '06', title: '今日收束｜世界越大，判断越轻', blocks: [{ type: 'prose', html: '<p>河伯见海后不再把自己的尺度当天下尺度；曾皙描述权力最终应保护的普通生活；堂吉诃德拒绝让现实修改故事；Frost 站在愿望实现之后。成熟也许是见过的世界越大，越知道答案应该有多轻。</p>' }, { type: 'source', text: '延伸来源：Chinese Text Project、Stanford Encyclopedia of Philosophy、Project Gutenberg、Open Yale Courses、Poetry Foundation。' }] }
        ]
      }
    },

    /* ==================== 2026-08-20 ==================== */
    '2026-08-20': {
      freebies: {
        intro: '严格按历史日报去重并二次核验官方/活动页面后，本期保留 4 项此前未正式推送、当前仍值得领取的福利，其中 3 项建议优先处理。',
        groups: [
          { grade: 'S', label: 'S级｜立即薅', items: [{ rank: 1, name: 'Tipard FixMP4 – Video Repair', platform: 'Windows', priceWas: 'US$24/月', priceNow: '今日免费活动授权', badges: ['🚨 S级', '⏳ 仅今日窗口'], details: [{ label: '用途', text: '修复损坏或无法播放的视频文件。' }, { label: '状态', text: 'Giveaway 活动页确认今日免费，需在活动窗口内完成领取。' }], links: [{ label: '活动领取入口', url: 'https://www.giveawayoftheday.com/tipard-fixmp4-video-repair-1-0-36/' }] }] },
          { grade: 'A', label: 'A级｜高价值软件', items: [{ rank: 2, name: 'Ashampoo Privacy Inspector 2', platform: 'Windows', priceWas: 'US$40 Lifetime', priceNow: '免费 Lifetime Giveaway', badges: ['🔥 A级', '♾️ Lifetime', '✅ 当前活动页确认'], details: [{ label: '用途', text: '分析 Windows 使用记录、浏览器活动、搜索和登录痕迹，并提供隐私清理、DNS Cache、Internet Cleaner、File Wiper。' }, { label: '限制', text: '1 台 Windows 10/11 设备；非商业用途，不含未来升级与技术支持；需要 Ashampoo 账号激活。' }], links: [{ label: '活动领取入口', url: 'https://winningpc.com/ashampoo-privacy-inspector-free-license-code/' }] }] },
          { grade: 'B', label: 'B级｜其它限免', items: [
            { rank: 3, name: 'Top Down 3D Pixel Sandbox', platform: 'Windows 游戏', priceWas: 'US$5', priceNow: '今日免费', badges: ['💡 B级', '⏳ 2026-08-20 当天'], details: [{ label: '类型', text: '3D 像素沙盒，可使用不同方块构建和破坏世界。' }], links: [{ label: '活动领取入口', url: 'https://game.giveawayoftheday.com/top-down-3d-pixel-sandbox/' }] },
            { rank: 4, name: 'Logo Guess Challenge', platform: 'Android', priceWas: 'US$2.49', priceNow: '可能免费（请结算前确认）', badges: ['⚪ C级', '⚠️ 地区/缓存状态差异'], details: [{ label: '用途', text: '品牌 Logo 猜谜游戏，包含广告和应用内购买。Google Play 聚合页显示 0 元，但详情页可能仍显示 US$2.49。' }], links: [{ label: 'Google Play 入口', url: 'https://play.google.com/store/apps/details?id=com.eggies.logoguesschallenge' }], warning: '请打开自己的 Google Play 页面，结算前确认价格为 0 元；若显示收费请不要领取。' }
          ] }
        ],
        dedupNote: '未重复推送阿里云百炼、火山方舟/豆包、智谱 GLM、AMD×ModelScope 等已报告福利；价格或授权状态不清晰的项目不纳入。',
        orderNote: '建议领取顺序：Tipard FixMP4 → Ashampoo Privacy Inspector 2 → Top Down 3D Pixel Sandbox；最后再检查 Logo Guess Challenge 是否在所在地区显示 0 元。'
      },
      ai: {
        scope: '统计口径：北京时间 2026-08-20，当天新增优先，严格历史去重。',
        chinaTitle: '🇨🇳 中国 AI 福利', china: [{ name: '今日无新增高价值免费福利', lines: ['复查百炼、百度千帆、腾讯混元、火山方舟/豆包、智谱 GLM、Kimi、MiniMax、ModelScope；现有额度此前已提醒，MiniMax 速率限制与智谱新用户 Tokens 均非今日新增。'] }],
        globalTitle: '🌍 今日重大 AI 情报', global: ['阿里巴巴公布季度数据：营收同比增长约 9% 至 2689.5 亿元，AI 云与计算服务收入同比增长 45% 至 484.4 亿元，资本开支同比增 75% 至 676.8 亿元。AI 进入规模化商业化阶段。来源：Reuters，2026-08-20。', 'Guidelight AI Standards 评估 OpenAI、Anthropic、Google、xAI、Meta 的模型控制能力，最高仅 C+，显示 Agent 隔离、监控、权限与第三方审查仍不成熟。来源：Reuters / Guidelight。', '宇树 CEO 王兴兴称具身智能正走向机器人的 ChatGPT 时刻，但软件能力跃迁可能仍需 2–3 年甚至 5–10 年，反映 AI 竞争向世界模型、机器人和真实世界数据迁移。来源：Reuters，2026-08-20。'],
        conclusionTitle: '📌 今日判断', conclusion: '今天最重要的不是新增模型，而是 AI 商业化接受财报检验、Agent 安全从内容安全升级为系统安全，以及具身智能可能成为下一主战场。OpenAI 今日无新旗舰模型或高价值活动。', orderNote: '福利栏宁可留空，也不重复旧活动。', sourcesNote: '核验来源：Reuters、Guidelight AI Standards、厂商官方页面。'
      },
      web: {
        conclusion: '2026-08-20 没有发现同时满足当天新增、影响范围足够大且非普通更新/营销的全球互联网重大事件。',
        excludedTitle: '重点核验但主动排除', excluded: ['欧盟 DMA 近期重大动态仍停留在 7 月；AWS/Azure gatekeeper 初步立场公布于 6 月 25 日，非今日决定。', '未核验到今日首次披露且达到全球影响门槛的高危网络安全事件；Cisco 安全活动属于研讨会。', '云服务维护、API 升级、企业软件版本节点等常规商业变化不纳入。'],
        structuralTitle: '接下来关注', structural: ['Google 是否在 8 月底完成 DMA Search 数据共享节点。', '欧盟是否推进 AWS/Azure gatekeeper 指定。', '浏览器、CDN 与网站围绕 Agent 流量身份和隐私访问控制的新标准。', 'CISA/厂商确认正在大规模利用的关键基础设施漏洞。']
      },
      reading: {
        keyword: '朋友、人格与希望：什么值得依靠，什么不值得？',
        entries: [
          { no: '01', title: '亚里士多德《尼各马可伦理学》：朋友不是生活的装饰', blocks: [{ type: 'prose', html: '<p>亚里士多德区分因有用、因愉快与因认可对方品格而形成的友谊。最高形态需要时间、共同生活与相互关照，真正的朋友希望对方得好，不只把对方当资源。</p>' }, { type: 'question', text: '拿掉“对我有用”和“让我开心”，你还有哪些关系是因为真正欣赏并关心这个人本身？' }, { type: 'source', text: '来源：Stanford Encyclopedia of Philosophy，Aristotle’s Ethics / Friendship。' }] },
          { no: '02', title: '孟子与苏辙：“浩然之气”不是情绪高涨', blocks: [{ type: 'prose', html: '<p>浩然之气来自长期正直选择形成的内在秩序，不是热血或强势表演。苏辙以水为喻：顺地势而行，众水汇集后自然有不可阻挡的力量。</p>' }, { type: 'question', text: '如果职位、收入和他人评价暂时消失，你还有什么标准判断今天该做或不该做？' }, { type: 'source', text: '来源：中国哲学书电子化计划所收苏辙《吴氏浩然堂记》，并参照《孟子》。' }] },
          { no: '03', title: '陶渊明：我们读到的陶渊明也是后世共同塑造的陶渊明', blocks: [{ type: 'prose', html: '<p>《归园田居》不只是辞官归隐，也是在重新校准感官。田晓菲关于手稿文化的研究提醒我们：经典形象由抄写者、编者、读者与评论家共同塑造。</p>' }, { type: 'question', text: '读《归园田居》时，先圈出空间、声音、植物和动物词语，看看身体怎样从樊笼重新安放到世界。' }, { type: 'source', text: '参考：田晓菲《Tao Yuanming and Manuscript Culture》。' }] },
          { no: '04', title: 'James Joyce《The Dead》：一句没有发生过的爱情，怎样改变一场婚姻', blocks: [{ type: 'prose', html: '<p>Gabriel 得知妻子 Gretta 仍被已故少年 Michael Furey 的记忆触动，自我感开始坍缩。雪覆盖生者与死者，亲密也不意味着拥有另一个人的全部历史。</p>' }, { type: 'question', text: '你是否允许最亲近的人拥有一部分与你无关、你也无法进入的过去？' }, { type: 'source', text: '文本：James Joyce《Dubliners》“The Dead”，Project Gutenberg 公版文本。' }] },
          { no: '05', title: 'Emily Dickinson《“Hope” is the thing with feathers》：希望为什么是一只不索取报酬的鸟', blocks: [{ type: 'prose', html: '<p>希望不是“明天一定更好”的预测，而是在风暴中仍唱着无歌词曲调的持续性；它不保证结果，也不向人索取回报。</p>' }, { type: 'question', text: '有没有一种东西在没有证据证明会成功时，仍让你继续往前？' }, { type: 'source', text: '参考：Poetry Foundation 权威页面与朗读资料。' }] },
          { no: '06', title: '《世说新语》：真正高级的人物描写，有时只需要一个动作', blocks: [{ type: 'prose', html: '<p>古典叙事常用一句话、一个动作或一次应答完成人物摄影。阅读时先观察压力来到那一秒身体怎么动、话怎么说，而不是急着总结寓意。</p>' }, { type: 'source', text: '—— 每日阅读 · 2026-08-20' }] }
        ]
      }
    },

    /* ==================== 2026-08-16 ==================== */
    '2026-08-16': {

      freebies: {
        intro: '今日必薅结论：保留 6 项当前仍有效、未重复推送的福利，前 4 项建议优先领取。',
        groups: [
          {
            grade: 'S',
            label: 'S级福利',
            items: [
              {
                rank: 1,
                name: 'vTubeGo 视频下载器 2.1.12',
                platform: 'Windows',
                priceWas: 'US$36',
                priceNow: '今日免费',
                badges: ['🚨 S级', '⏳ 仅今日窗口', '✅ 活动页确认'],
                details: [
                  { label: '用途', text: '从主流视频/音乐流媒体站点下载内容。' },
                  { label: '状态', text: 'Giveaway of the Day 在 2026-08-16 明确标注 US$36、今天免费，需在活动窗口内完成下载/安装/注册。' }
                ],
                links: [
                  { label: '领取入口', url: 'https://www.giveawayoftheday.com/2026/08/16/' }
                ],
                warning: 'Giveaway 版常见规则通常与厂商常规商业许可证不同，升级、重装、技术支持等可能受限；请在活动页实际安装流程中再次确认授权细则。'
              },
              {
                rank: 2,
                name: '不可思议的德古拉：暗影学院',
                platform: 'Windows 游戏',
                priceWas: '6.99美元',
                priceNow: '今日免费',
                badges: ['🚨 S级', '⏳ 今日限时', '✅ Giveaway 官方活动页确认'],
                details: [
                  { label: '授权状态', text: '活动页明确要求在有限时间内下载、安装并注册；属于限时免费取得的正版游戏授权。' },
                  { label: '系统要求', text: 'Windows 7 或更高版本；2GB RAM；DirectX 11；约 1GB 空间。' }
                ],
                links: [
                  { label: '活动入口', url: 'https://game.giveawayoftheday.com/incredible-dracula-academy-of-shadows/' },
                  { label: 'Steam 产品页', url: 'https://store.steampowered.com/app/3344950/Incredible_Dracula_Academy_of_Shadows/' }
                ]
              },
              {
                rank: 3,
                name: 'Currency++',
                platform: 'iPhone/iPad',
                priceWas: 'US$3.99',
                priceNow: '今日免费',
                badges: ['🚨 S级', '♾️ 应用描述明确“一次购买，Lifetime access”', '✅ 当前活动页确认'],
                details: [
                  { label: '功能', text: '汇率、天气、翻译、旅行安全信息、空气质量、AI 地点安全分析等，AI 部分由 Google Gemini 驱动。' },
                  { label: '重要', text: '活动页明确写“无订阅。没有广告。没有隐藏费用。一次购买。终身访问权。”' },
                  { label: '地区说明', text: 'App Store 价格/可用性可能因 Apple ID 地区不同而变化；下单前确认显示为 0 元。' }
                ],
                links: [
                  { label: '领取入口（App Store）', url: 'https://itunes.apple.com/us/app/id6476618917?mt=8' },
                  { label: '活动说明', url: 'https://iphone.giveawayoftheday.com/currency/' }
                ]
              },
              {
                rank: 4,
                name: '你录制 Pro',
                platform: 'iPhone / Mac Catalyst',
                priceWas: '11美元',
                priceNow: '今日免费',
                badges: ['🚨 S级', '⏳ 今日限免', '✅ 当前活动页确认'],
                details: [
                  { label: '用途', text: '高质量 AAC/M4A、无损 Linear PCM/CAF 录音，支持快捷键、Siri、URL 自动化等。' },
                  { label: '注意', text: '应用本体今天免费，但存在“Tip Jar”可选自动续费月订阅，只用于额外界面主题；并非领取本体的必要条件。不要误开订阅。' }
                ],
                links: [
                  { label: '应用商店', url: 'https://itunes.apple.com/us/app/id1487340415?mt=8' },
                  { label: '活动说明', url: 'https://iphone.giveawayoftheday.com/you-record-pro-2/' }
                ]
              }
            ]
          },
          {
            grade: 'A',
            label: 'A级福利（高价值、仍可申请）',
            items: [
              {
                rank: 5,
                name: 'AMD AI 开发者项目',
                platform: '免费 GPU 云算力 / Fireworks AI Credits',
                priceWas: '—',
                priceNow: '免费申请',
                badges: ['🔥 A级', '✅ AMD 官方确认', '面向开发者'],
                details: [
                  { label: '权益说明', text: '官方 AI Developer Program 允许成员申请免费云 GPU credits，无需先购买基础设施。' },
                  { label: '申请流程', text: '加入 AMD AI 开发者计划 → 登录开发者门户 → 会员特权 → 请求云端积分 → 填写身份、用途及公开资料（如 GitHub/LinkedIn）→ 通常 2–3 个工作日审核。' },
                  { label: '可选权益 · AMD 开发者云', text: 'AMD Instinct GPU 裸金属云算力；激活后 credits 有效 30 天。' },
                  { label: '可选权益 · Fireworks AI', text: '官方明确写明成员可获得 50 美元信用点，有效 90 天，可调用多种 LLM 推理服务。' }
                ],
                links: [
                  { label: '官方说明', url: 'https://www.amd.com/en/developer/resources/technical-articles/2026/how-to-claim-amd-cloud-credits.html' },
                  { label: '加入入口', url: 'https://www.amd.com/en/developer/ai-dev-program.html' }
                ],
                warning: 'AMD Developer Cloud 具体 credit 金额随审批/项目而定，官方页面无统一承诺固定美元数。'
              }
            ]
          },
          {
            grade: 'B',
            label: 'B级福利（有需要再领）',
            items: [
              {
                rank: 6,
                name: '今日其它小型限免',
                platform: 'iOS / Android',
                priceWas: '—',
                priceNow: '限免',
                badges: ['💡 B级'],
                subItems: [
                  { name: 'CheckMy！盒子', price: '0.99美元 → 免费' },
                  { name: '箭头出局：猫咪逃脱谜题', price: '3.99美元 → 免费' },
                  { name: 'QRCode++', price: 'US$3.99 → 免费' },
                  { name: 'Android：Sirocco 图标包、OTO 图标包、Dots Live Wallpaper 等', price: 'US$0.49–1.49 限免' }
                ],
                links: [
                  { label: '入口汇总', url: 'https://game.giveawayoftheday.com/' }
                ]
              }
            ]
          }
        ],
        dedupNote: '去重与排除说明：未重复推送 Caravan SandWitch、Beholder: Conductor、Microsoft for Startups、Claude for Startups、Google GEAR、Databricks、Deponia 等；排除 Free Fire 当日未核验兑换码。',
        orderNote: '建议领取顺序：vTubeGo → Incredible Dracula → Currency++ → You Record Pro → 有 AI/GPU 开发需求再申请 AMD AI 开发者项目。'
      },

      ai: {
        scope: '统计口径：北京时间 2026-08-16，当天新增优先；今天重大新发布较少，不拿旧闻凑数。',
        chinaTitle: '🇨🇳 中国 AI 福利',
        china: [
          {
            name: '阿里云百炼',
            lines: [
              '首次开通发放各模型独立免费额度（多数通常为 100 万 Token，部分更多，有效 90 天；试用页展示“领 1 亿+ tokens”）。需实名认证，建议开启“免费额度用完即停”。'
            ]
          },
          {
            name: '百度千帆',
            lines: [
              '首次开通可获 ERNIE、DeepSeek-R1/V3.1、Kimi-K2、Qwen3、Qwen3-Coder 等多款模型各 100 万 Token（有效期 3 个月）；百度搜索工具约 1500 次/月。'
            ]
          },
          {
            name: '腾讯混元',
            lines: [
              '首次开通获一次性免费包：混元生文 100 万 Token（1年）+ Embedding 100 万 Token；混元生视频 50 积分；混元生图 50 次；混元生 3D 200 积分。'
            ]
          },
          {
            name: 'UOS AI / DeepSeek 免费账号',
            lines: [
              '官方 deepin/UOS 活动有效至 2026-12-31（账号有效期至 2027-06-30），每月 200 次对话，用完可补领 200 次。'
            ]
          }
        ],
        globalTitle: '🌍 全球福利提醒',
        global: [
          'Anthropic Claude Sonnet 5 引导期价格（输入 $2/M Token、输出 $10/M Token 持续至 2026-08-31，之后恢复 $3/$15）。'
        ],
        conclusionTitle: '📌 今日重大 AI 事件结论',
        conclusion: '未核验到 OpenAI、Anthropic、Google DeepMind、Meta、xAI 等在 8 月 16 日发布新旗舰模型或核心调价，不拿旧闻补数。',
        orderNote: '今日优先领取顺序：1）阿里云百炼；2）百度千帆；3）腾讯混元；4）UOS AI / DeepSeek。',
        sourcesNote: '核验来源：OpenAI News、Anthropic Newsroom、阿里云百炼帮助中心、百度千帆文档、腾讯云混元文档、deepin/UOS 社区。'
      },

      web: {
        conclusion: '结论：截至 2026-08-16 检索时点，无满足“今天首次发生/首次公布/实质进展 + 影响面足够大”的全球重大事件。宁缺毋滥。',
        excludedTitle: '主动排除项',
        excluded: [
          '欧盟 AWS/Azure DMA 初步意见（6-25）',
          '欧盟 Cloud and AI Development Act 提案（6月）',
          '日本关键基础设施网安标准（7-31）',
          'FedRAMP 2026 规则已有节点'
        ]
      },

      reading: {
        keyword: '怎样不把自己的一生完全交给“有用”',
        entries: [
          {
            no: '01',
            title: '庄子：当“有用”成为唯一尺度',
            blocks: [
              { type: 'label', text: '今日片段' },
              { type: 'quote', html: '<p>《庄子·山木》：庄子行于山中，见大木枝叶盛茂。伐木者止其旁而不取也。问其故，曰：“无所可用。”庄子曰：“此木以不材得终其天年。”</p><p>后来庄子投宿朋友家。主人高兴，命童仆杀雁待客。童仆问：“一只能鸣，一只不能鸣，杀哪一只？”主人答：“杀不能鸣的。”</p><p>第二天弟子便问庄子：昨天山里的树，因为“不材”而活；今天主人家的雁，却因为“不材”而死。那么究竟应该有用，还是无用？庄子的回答不是给出另一条简单规则。他说自己要处在“材与不材之间”，但紧接着又指出，这个“之间”仍未必真正能够免除牵累。</p>' },
              { type: 'label', text: '为什么值得读' },
              { type: 'prose', html: '<p>《山木》故意在同一故事里安排因无用而生的树与因无用而死的雁，拆毁“无用之用方为大用”的万能生存格言。庄子逼问的是：<strong>我们为什么如此渴望找到一套永远正确的处世公式？</strong></p>' },
              { type: 'question', text: '你现在生活里，有没有一件事因为无法写进简历、无法变现、无法量化，被误判为“不值得做”？' },
              { type: 'source', text: '来源：Chinese Text Project《庄子·山木》；斯坦福哲学百科全书（SEP）“Zhuangzi”。' }
            ]
          },
          {
            no: '02',
            title: '蒙田《论经验》：不要等到彻底理解人生，才开始生活',
            blocks: [
              { type: 'label', text: '思想精要' },
              { type: 'prose', html: '<p>晚年蒙田不相信抽象理论能替我们生活。他把哲学拉回身体、胃口、睡眠与疾病。与其追问高悬的真理，不如接纳人的有限性与当下经验。<strong>“essay”即尝试，允许今天的自己修正昨天的自己。</strong></p>' },
              { type: 'question', text: '你最近一次改变长期坚持的观点，是因为真正观察到了自己的经验，还是因为读到了一套更有说服力的理论？' },
              { type: 'source', text: '来源：Michel de Montaigne, Essays, Book III, Chap 13; Project Gutenberg Charles Cotton 译本。' }
            ]
          },
          {
            no: '03',
            title: '陶渊明《归园田居·其一》：真正厉害的不是“归隐”，而是重新训练感官',
            blocks: [
              { type: 'label', text: '完整诗文' },
              { type: 'poem', lines: [
                '少无适俗韵，性本爱丘山。',
                '误落尘网中，一去三十年。',
                '羁鸟恋旧林，池鱼思故渊。',
                '开荒南野际，守拙归园田。',
                '方宅十余亩，草屋八九间。',
                '榆柳荫后檐，桃李罗堂前。',
                '暧暧远人村，依依墟里烟。',
                '狗吠深巷中，鸡鸣桑树颠。',
                '户庭无尘杂，虚室有余闲。',
                '久在樊笼里，复得返自然。'
              ] },
              { type: 'label', text: '细读' },
              { type: 'prose', html: '<p>前半段抽象比喻（尘网、羁鸟），后半段具象感官（草屋、榆柳、鸡鸣狗吠）。<strong>“返自然”是感官的恢复</strong>；“守拙”是保护自己身上“不适合钻营规则”的那部分。</p>' },
              { type: 'source', text: '来源：中国哲学书电子化计划《陶渊明集》卷二。' }
            ]
          },
          {
            no: '04',
            title: '《红楼梦》：为什么一部家族衰败小说可以成为“中国文明的入口”',
            blocks: [
              { type: 'label', text: '文本切入' },
              { type: 'prose', html: '<p>女娲炼石补天剩下的第 <strong>36501 块石头</strong>（青埂峰下无材补天的剩余物）。</p>' },
              { type: 'label', text: '学者视角' },
              { type: 'prose', html: '<p>哈佛大学李惠仪（Wai-yee Li）教授指出《红楼梦》探讨神话、哲学、欲望与超越的辩证。小说从一开始就将宏大的“补天大业”与个体的“红尘爱恨与审美记忆”并置。</p>' },
              { type: 'question', text: '如果一个人无法完成社会认可的“补天大业”，他经历过的爱、痛苦与记忆，是否足以构成一生的价值？' },
              { type: 'source', text: '来源：Harvard EALC, Wai-yee Li "The Greatest Chinese Novel"; Harvard Gazette 访谈。' }
            ]
          },
          {
            no: '05',
            title: '卡夫卡《变形记》：最恐怖的不是变成虫，而是变得“没有生产价值”',
            blocks: [
              { type: 'label', text: '细读切入' },
              { type: 'prose', html: '<p>格里高尔醒来变成甲虫后，首要忧虑竟然是<strong>上班迟到与债务</strong>。异化在于肉体已非人，但工作纪律依然完全支配意识；丧失劳动能力后，家庭关系随之崩解。</p>' },
              { type: 'source', text: '来源：Cambridge MMLL Kafka Reading Guide; Project Gutenberg。' }
            ]
          },
          {
            no: '06',
            title: '今晚的余味',
            blocks: [
              { type: 'prose', html: '<p>世界必须判断什么有用，但危险在于“有用”成为唯一的尺度。<strong>文学替无法用效率与产出证明自身的经验保存了位置。</strong></p>' }
            ]
          }
        ]
      }
    },

    /* ==================== 2026-08-17 ==================== */
    '2026-08-17': {

      freebies: {
        intro: '今日必薅结论：严格去重后保留 8 项此前未推送、规则清晰的福利，前 5 项优先领取。',
        groups: [
          {
            grade: 'S',
            label: 'S级福利（立即薅）',
            items: [
              {
                rank: 1,
                name: 'NEAT 项目 3 Pro',
                platform: 'Windows',
                priceWas: '$99',
                priceNow: '今日免费',
                badges: ['🚨 S级', '✅ 今日 Giveaway 确认'],
                details: [
                  { label: '用途', text: '通过多张照片/视频序列移除景点照片中的游客与移动物体；支持 500 张序列、90+ 效果、Lightroom 插件。' },
                  { label: '活动窗口', text: '2026-08-17 当天，需在窗口内下载激活。' }
                ],
                links: [
                  { label: '活动入口', url: 'https://www.giveawayoftheday.com/neat-projects-3/' }
                ]
              },
              {
                rank: 2,
                name: '易经',
                platform: 'iPhone/iPad',
                priceWas: 'US$14.99',
                priceNow: '今日免费',
                badges: ['🚨 S级', '♾️ 一次性 Full Access 解锁，无订阅'],
                details: [
                  { label: '说明', text: '包含完整 64 卦、投币起卦、变卦、离线日志，无需账号。' }
                ],
                links: [
                  { label: '活动入口', url: 'https://iphone.giveawayoftheday.com/i-ching/' }
                ]
              },
              {
                rank: 3,
                name: 'Vovsoft 模糊多重图像 (Blur Multiple Images)',
                platform: 'Windows',
                priceWas: '$19',
                priceNow: '免费终身许可',
                badges: ['🚨 S级', '⏳ 2026-08-18 截止'],
                details: [
                  { label: '用途', text: '批量给 PNG/JPEG/TIFF/GIF/BMP 加模糊效果。' }
                ],
                links: [
                  { label: '官方入口', url: 'https://vovsoft.com/giveaway/free-blur-multiple-images-2026/' }
                ]
              },
              {
                rank: 4,
                name: 'Vovsoft 批处理图像转换器 (Batch Image Converter)',
                platform: 'Windows 64位',
                priceWas: '$19',
                priceNow: '免费终身许可',
                badges: ['🚨 S级', '⏳ 2026-08-23 截止'],
                details: [
                  { label: '用途', text: '批量转换 PNG、WEBP、JPEG、JFIF、TIFF、BMP、GIF、ICO、WMP。' }
                ],
                links: [
                  { label: '官方入口', url: 'https://vovsoft.com/giveaway/free-batch-image-converter-2026/' }
                ]
              },
              {
                rank: 5,
                name: '矢量结发动机 (Vector Knot Engine)',
                platform: 'Windows 游戏',
                priceWas: '$5',
                priceNow: '今日免费',
                badges: ['🚨 S级', '⏳ 2026-08-17 当天'],
                details: [
                  { label: '类型', text: '旋转同心环与能量节点的解谜游戏。' }
                ],
                links: [
                  { label: '活动入口', url: 'https://game.giveawayoftheday.com/vector-knot-engine/' }
                ]
              }
            ]
          },
          {
            grade: 'A',
            label: 'A级福利（中国 AI / 开发者高价值）',
            items: [
              {
                rank: 6,
                name: '阿里云百炼｜新人模型免费额度',
                platform: '中国 AI · 大模型平台',
                priceWas: '—',
                priceNow: '免费额度',
                badges: ['🔥 A级', '✅ 官方活动页确认'],
                details: [
                  { label: '额度说明', text: '主要适用华北 2（北京），开通后多模型各 100 万 Token（90天有效），无需实名即可使用新人额度（建议开启用完即停）；OAuth 体系另有每日 2000 次独立调用额度。' }
                ],
                links: [
                  { label: '入口', url: 'https://bailian.console.aliyun.com/' }
                ]
              },
              {
                rank: 7,
                name: '阿里云解决方案免费试用',
                platform: '中国 AI · 云平台',
                priceWas: '—',
                priceNow: '免费试用点',
                badges: ['🔥 A级', '✅ 官方活动页确认'],
                details: [
                  { label: '额度说明', text: '实名用户领 100 试用点（有效期 1 年），完成方案试用每次+10点，最高 200 点（覆盖 Qwen-Image、DeepSeek、Claude Code+GStack 等）。' }
                ],
                links: [
                  { label: '活动入口', url: 'https://www.aliyun.com/solution/free' }
                ]
              },
              {
                rank: 8,
                name: '阿里云 AI 产品免费试用',
                platform: '中国 AI · 云平台',
                priceWas: '—',
                priceNow: '免费试用',
                badges: ['🔥 A级', '✅ 官方活动页确认'],
                details: [
                  { label: '额度说明', text: '30+ AI 产品与 1 亿+ Tokens 体验包。' }
                ],
                links: [
                  { label: '入口', url: 'https://free.aliyun.com/product/ai' }
                ]
              }
            ]
          },
          {
            grade: 'B',
            label: 'B级福利（其它限免）',
            items: [
              {
                rank: 9,
                name: '其它小型限免',
                platform: 'iOS',
                priceWas: '—',
                priceNow: '限免',
                badges: ['💡 B级'],
                subItems: [
                  { name: 'Flick Home Run 2', price: '$0.99 → 免费' },
                  { name: '弱视-懒惰眼', price: '$9.99 → 免费，辅助类' },
                  { name: '面纱白噪音', price: '$1.99 → 免费' },
                  { name: '每小时新闻、Japa Mala Pro、生死存亡生存专业版、Circle Dash 等', price: '限免' }
                ]
              }
            ]
          }
        ],
        dedupNote: '排除项：排除了已推过的 vTubeGo、Deponia、硅基流动已结束的返券、火山方舟付费 9.9 活动及未经核实的 Free Fire 兑换码。',
        orderNote: '建议领取顺序：NEAT 项目 3 Pro → 易经 → Blur Multiple Images（8/18截止） → Batch Image Converter → 阿里云百炼。'
      },

      ai: {
        scope: '统计口径：当天新增优先，福利优先，已核验项目不重复包装。',
        chinaTitle: '🇨🇳 中国 AI 福利',
        china: [
          {
            name: '火山方舟 / 豆包多模态免费额度（此前未提醒）',
            lines: [
              '额度：豆包 2.1-pro 50万 Token、2.1-turbo 50万 Token、Seed 角色与进化各 50万 Token；Seedance 视频多版本各 200 万 Token；Seedream 图像各 200 张；语音合成与复刻各 5000 字符；流式语音/录音识别各 20 小时；视觉向量 50 万 Token；联网配额 2 万次/月。',
              '边缘网关：每个通用网关密钥含 200 万 Token、200 次文生图、1200 分钟语音对话等。',
              '官方依据：火山方舟产品页、火山引擎边缘大模型网关文档。'
            ]
          },
          {
            name: '智谱 GLM 开放平台（此前未提醒）',
            lines: [
              'GLM-4.7-Flash：30B 级、200K 上下文、最大输出 128K、支持思考模式/Function Calling/MCP/上下文缓存，针对 Agentic Coding 优化，官方永久免费提供。',
              '其它免费：GLM-4.6V-Flash（视觉）、GLM-4.1V-Thinking-Flash（视觉推理）、GLM-4V-Flash、1GB 知识库存储。',
              '适用：Claude Code、Cline、Roo Code、TRAE 零成本接入。'
            ]
          }
        ],
        globalTitle: '🌍 全球 AI 重大动态',
        global: [
          '中国 AI 模型全球分发与美国政策张力：路透社 8-17 报道特朗普家族支持的 World Liberty Financial 与香港平台 WorldClaw 合作，聚合分发包含 Alibaba、Baidu、Z.ai 在内的约 90 个模型并支持加密结算，凸显模型原产地与全球可访问性的边界博弈。',
          '资本市场转向算力现金流转化率：投资者从担忧 Big Tech 资本支出转向评估谁能将基础设施转化为真实营收，资金向具平台生态的巨头集中。'
        ],
        conclusionTitle: '专项排查',
        conclusion: 'OpenAI、Anthropic、Google DeepMind、Meta 当日均无破坏性新模型发布。',
        orderNote: '优先行动：1）火山方舟多模态资源包；2）智谱 GLM-4.7-Flash 免费 API 接入。',
        sourcesNote: ''
      },

      web: {
        conclusion: '结论：全球互联网领域重大新增事件偏少，报告主动留白，拒绝旧闻充数。',
        excludedTitle: '主动排除项',
        excluded: [
          'LinkedIn Marketing API 202508 版本 8-17 迁移节点（例行生命周期）',
          'Microsoft Dynamics 365 Preview 节点'
        ],
        structuralTitle: '结构性长期观察',
        structural: [
          'AI Agent 普及下的真人/Bot 识别体系（如 PACT 隐私认证）',
          '欧洲边缘计算网安标准推进',
          'AI 数据中心电力与算力融资整合'
        ]
      },

      reading: {
        keyword: '当我们以为在看世界时，看见的是世界还是欲望与恐惧？',
        entries: [
          {
            no: '01',
            title: '爱比克泰德：真正属于你的东西，究竟有多少？',
            blocks: [
              { type: 'label', text: '核心观点' },
              { type: 'prose', html: '<p>古罗马斯多葛派区分“取决于我们”（判断、选择、态度）与“不取决于我们”（身体、声誉、回报、他人）。自由是拒绝把自我价值抵押给外部结果。<strong>区分控制范围不是为了冷漠，而是让行动更诚实、清醒。</strong></p>' },
              { type: 'question', text: '最近哪件事在消耗你而它其实不受你控制？如果把“必须成功”改为“行动必须诚实充分”，你会如何？' },
              { type: 'source', text: '来源：Stanford Encyclopedia of Philosophy, "Epictetus".' }
            ]
          },
          {
            no: '02',
            title: '托尔斯泰《伊凡·伊里奇之死》：一个“正确的人生”为什么会在死亡面前突然显得错误？',
            blocks: [
              { type: 'label', text: '细读切入' },
              { type: 'prose', html: '<p>伊凡一生每一步都符合社会体面与规范，但在死亡前夕发出质问：<strong>“如果我整个一生都过得不对呢？”</strong>虚荣的“正常”遮蔽了真实的自我追问。</p>' },
              { type: 'source', text: '来源：MIT Introduction to Fiction 课程大纲；Project Gutenberg。' }
            ]
          },
          {
            no: '03',
            title: '杜甫《春望》：八句诗里，国家怎样进入一个人的头发？',
            blocks: [
              { type: 'label', text: '完整诗文' },
              { type: 'poem', lines: [
                '国破山河在，城春草木深。',
                '感时花溅泪，恨别鸟惊心。',
                '烽火连三月，家书抵万金。',
                '白头搔更短，浑欲不胜簪。'
              ] },
              { type: 'label', text: '细读' },
              { type: 'prose', html: '<p>空间尺度的急剧压缩：国（政治破碎与山河永恒的错位）→ 城（荒芜复苏）→ 花鸟（感官心理化）→ 烽火与家书（宏大历史转为个人焦虑）→ <strong>白发（历史灾难最终烙印进肉体）</strong>。</p>' },
              { type: 'source', text: '来源：哈佛 Library of Chinese Humanities 宇文所安（Stephen Owen）杜甫全译本；全唐诗。' }
            ]
          },
          {
            no: '04',
            title: '《了不起的盖茨比》：为什么草坪会“跑”，房子会像活物？',
            blocks: [
              { type: 'label', text: '学者视角' },
              { type: 'prose', html: '<p>耶鲁大学 Wai Chee Dimock 教授解析菲茨杰拉德的<strong>“反现实主义”拟人化动词</strong>：草坪在奔跑、汽车拥有意志、电话侵入生活。物质世界反客为主，支配了自以为拥有财富的人。</p>' },
              { type: 'source', text: '来源：Yale Open Courses AMST 246 第四讲。' }
            ]
          },
          {
            no: '05',
            title: 'Emily Dickinson《Because I could stop for Death》：死亡为什么如此有礼貌？',
            blocks: [
              { type: 'label', text: '细读切入' },
              { type: 'prose', html: '<p>死亡不是暴力袭击，而是一位从容礼貌的绅士，驾着马车带着“我”与“永恒”缓缓前行。<strong>越平静越震撼：死亡拥有无限的耐心，颠覆了忙碌凡人的时间尺度。</strong></p>' },
              { type: 'source', text: '来源：Poetry Foundation 诗作档案。' }
            ]
          },
          {
            no: '06',
            title: '今晚的尾声',
            blocks: [
              { type: 'prose', html: '<p>把习以为常的事物重新变得陌生。<strong>阅读是恢复重新看见世界的能力。</strong></p>' }
            ]
          }
        ]
      }
    }
  };

  /* 专区元信息（顺序即渲染顺序） */
  var SECTIONS = [
    {
      key: 'freebies',
      icon: '🎁',
      title: '免费福利',
      subtitle: 'Internet Freebies Radar · 全互联网羊毛雷达',
      desc: 'S级/A级/B级分级、原价现价对比、系统要求、领取链接与避坑指南。'
    },
    {
      key: 'ai',
      icon: '🤖',
      title: 'AI 情报',
      subtitle: 'AI Intelligence',
      desc: '中国 AI 福利、全球大模型动态、算力额度与产业结论。'
    },
    {
      key: 'web',
      icon: '🌐',
      title: '互联网情报',
      subtitle: 'Web Intelligence',
      desc: '全球重大互联网事件、政策规范、基础设施演进与宁缺毋滥的观察记录。'
    },
    {
      key: 'reading',
      icon: '📚',
      title: '每日阅读',
      subtitle: 'Daily Reading',
      desc: '深度思想与文学细读：完整原文选段、学者视角解析、反思问题与文献出处。'
    }
  ];

  window.SkyRadarData = {
    /** 所有报告日期，新 → 旧（默认展示最新一天） */
    dates: ['2026-08-20', '2026-08-19', '2026-08-17', '2026-08-16'],
    /** 专区定义 */
    sections: SECTIONS,
    /** 日期 → 全量报告 */
    reports: REPORTS,
    get(date) {
      return REPORTS[date] || null;
    },
    latestDate() {
      return this.dates[0];
    }
  };
})();

