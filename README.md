# 🌸 乐享星期日的樱华小屋

一个**樱花**主题的个人空间网站，复刻自 [ztorch.fun](https://ztorch.fun)（ZTorch の 樱华小屋）的交互骨架：
纯静态、零框架、零构建、零数据库，部署即上线。

## ✨ 功能一览

- **樱花铁路开场动画**（复刻原站）：海报兜底 → 视频淡入 → 樱花花瓣画布 → 标题浮现，约 2.4 秒自动退场；可跳过、Esc 退出、页脚重放，每日轮换一句樱花诗句
- **动态樱花背景**：原创樱花插画（`assets/bg/sakura-sky.jpg`，角部樱枝框景 + 远山 + 留白天空）+ 场景柔光染色 + Canvas 花瓣飘落/光斑/风痕粒子
- **场景系统**：六个页面各绑定一种樱花情绪（樱晴/樱吹雪/花见/夕樱/夜樱/樱游园），切换页面时花色平滑过渡
- **拟物小组件**：模拟时钟（CSS 指针）、实时天气（open-meteo，失败自动回退）、黑胶唱片机（播放/切歌/进度条拖点）
- **六个页面**：首页（最近更新）、生活志（时间线）、ACG 收藏（评分卡）、随笔、留言板（本地贴纸墙）、小工具&小游戏
- **小工具中心**：樱花色卡（复制 CSS）、花瓣画板（保存 PNG）、花签、接樱花瓣、樱花连连看
- **生日彩蛋**：`data/settings.json` 里设置 `birthday`（MM-DD），当天自动放气球
- **文章弹窗**：点任意卡片弹窗阅读全文，本地记录阅读次数

## 🚀 运行

由于页面会 `fetch` 本地 JSON，**不建议直接双击 index.html**：file:// 下浏览器会拦截 fetch，生活志/随笔/留言板等数据回退到内置示例，但唱片机有内置兜底曲目可正常播放。完整体验请用本地服务器，任选一种：

```bash
# Python
python -m http.server 8000        # 打开 http://localhost:8000

# Node
npx serve .                       # 打开终端提示的地址

# VS Code：装 Live Server 插件后右键 index.html → Open with Live Server
```

## 📦 部署到 GitHub Pages

1. 把整个目录推到 GitHub 仓库
2. 仓库 Settings → Pages → Source 选 `main` 分支根目录 → Save
3. 打开 `https://<你的用户名>.github.io/<仓库名>`

（本仓库无任何服务端依赖，JSON 会被当作静态文件直接提供。）

## 🎨 自定义

| 想改什么 | 去哪里改 |
|---|---|
| 站名 / 昵称 / 签名 / 头像 / 社交链接 | `data/settings.json` |
| 生日彩蛋日期 | `data/settings.json` → `birthday`（MM-DD） |
| 天气城市 / 关闭天气接口 | `data/settings.json` → `weather`（`provider` 设为 `mock` 即用静态文案） |
| 唱片机曲目 | `data/settings.json` → `music`（本地音乐可放 `assets/audio/` 后填相对路径；`cover` 字段可指定黑胶封面图） |
| 开场视频 / 海报 | `assets/video/`（替换同名文件即可换自己的开场） |
| 开场每日诗句 | `js/intro.js` → `verses` 数组 |
| 生活日志 | `data/posts-life.json` |
| ACG 收藏 | `data/posts-acg.json`（`emoji` 是卡片横幅图，也可换成图片路径 + 修改 `js/main.js` 的 renderAcg） |
| 随笔 | `data/posts-notes.json` |
| 留言板初始内容 | `data/comments.json`（访客新留言存浏览器 localStorage） |
| 主题配色（六个场景的樱花色） | `css/variables.css` 底部 `body[data-scene=...]` |
| 各页面的场景标题/诗句 | `js/scene-registry.js` |
| 花签签文 | `js/tool-hub.js` 里 `sakura-fortune` 的 `QUOTES` |
| 站点标题 / 导航文案 | `index.html` |

> 文章 `content_html` 支持 h1/h2/p/blockquote/img 等常见标签，直接用 HTML 字符串写在 JSON 里即可。

## 🗂️ 目录结构

```
├── index.html            # 单页应用骨架（hash 路由）
├── css/
│   ├── variables.css     # 设计令牌 + 六场景樱花配色
│   ├── main.css          # 布局 / 卡片 / 弹窗 / 响应式
│   ├── intro.css         # 开场动画（樱花铁路）
│   ├── widgets.css       # 时钟 / 天气 / 唱片机 / 便签
│   ├── sky-canvas.css    # 动态背景层
│   ├── scenes.css        # 场景系统微调
│   └── tools.css         # 小工具中心
├── js/
│   ├── sky-bg.js         # Canvas 樱花粒子
│   ├── intro.js          # 开场动画
│   ├── birthday-special.js
│   ├── scene-registry.js # 场景注册表
│   ├── scene-sidebar.js  # 场景侧边栏
│   ├── main.js           # 路由/时钟/天气/内容/弹窗/留言板
│   ├── player.js         # 唱片机
│   ├── tool-catalog.js   # 工具注册表
│   └── tool-hub.js       # 五个工具的实现
├── data/                 # 全部内容数据（JSON）
└── assets/               # 图标 / 头像 / 开场视频（SVG、webp、webm、mp4）
```

## 📝 与原站（ztorch.fun）的对应关系

原站是 nginx + PHP + MySQL 自建 CMS；本复刻版把 `api/posts.php`、`api/comments.php`、`api/settings.php`
改成了 `data/` 下的 JSON 文件，视觉主题与原站同样走樱花风，交互骨架（开场/场景/时钟/唱片机/留言板/工具中心）全部保留。

---

🌸 风来听风，雨来赏雨，风遇山止，船到岸停。
