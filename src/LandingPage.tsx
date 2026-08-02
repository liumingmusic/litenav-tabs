import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Download, LayoutGrid, Shield, Zap, Sparkles, ArrowRight, Cloud, Palette, Globe, Sun, Moon, Link as LinkIcon, Chrome, MousePointerClick, FolderPlus, Search, Settings, Command, Tags, Trash2, Layers, Lock, RefreshCw } from 'lucide-react';

const dict = {
  zh: {
    title1: "重塑你的",
    title2: "新标签页",
    subtitle: "告别臃肿的导航站。这是一款专注于隐私、极速、与高效组织的离线新标签页拓展。",
    online: "在线体验",
    features: "核心特性",
    download: "获取拓展",
    heroBtn1: "体验网页版",
    heroBtn2: "安装指南",
    release: "Release 2.0.0 is out",
    featureTitle: "回归工具本质",
    featureSubtitle: "强大的底层搭配克制的交互，满足您的高阶定制需求。",
    guide: "使用指南",
    guideTitle: "核心操作全图解",
    guideSubtitle: "只需两分钟的图文说明，掌握 LiteNav Tabs 的进阶玩法与技巧",
    guideInstallTitle: "1. 部署与极速安装",
    guideInstallDesc: "为了获得纯粹的沉浸式体验，我们强烈推荐使用离线插件包。以下是 10 秒钟快速安装指南：",
    guideInstallSteps: [
      "请先下载「获取与安装」处提供的离线插件包 (ZIP文件) 并将其解压。",
      "在浏览器地址栏输入 chrome://extensions 打开扩展程序管理页。",
      "在页面右上角找到「开发者模式」并将其开关打开。",
      "最后点击「加载已解压的扩展程序」，选择你刚才解压出来的文件夹大功告成！"
    ],
    guideGroupTitle: "2. 书签分组与无限嵌套文件夹",
    guideGroupDesc: "告别杂乱无章的平铺，LiteNav 支持极其强大的层级整理与收纳功能：",
    guideGroupSteps: [
      "添加大分类：点击左侧边栏底部的 '+'，建立如“工作”、“设计”、“日常”等主分组。",
      "创建收纳盒：在任意分组内，随时点击顶部的“新增文件夹”按钮建立专属收纳夹。",
      "沉浸式嵌套：点击文件夹即可全屏展开进入，你可以在文件夹内毫无限制地继续嵌套子文件夹。",
      "色彩与命名：选中文件夹点击右键，你可以快速修改颜色、重命名或添加好看的 Emoji 标识。"
    ],
    guideAddTitle: "3. 快速收集与高自由度排版",
    guideAddDesc: "收录新网站从未如此快速自然，高度自由的排版体验让整理成为一种纯粹的享受：",
    guideAddSteps: [
      "自动获取：在任意空白区域点击引人注目的 '+'，粘贴网址即可自动为你解析出网站名称与图标。",
      "Markdown：这里不仅是一个空洞的书签，你还能为每个卡片单独撰写格式丰富的备注。",
      "随心拖拽：长按想要移动的书签或文件夹即可激活拖动，尽情改变排列顺序或让它们跨分类组移动。",
      "快捷菜单：在主页的任意角落右键点击书签卡片，你可以立即进行二次编辑与快速分享操作。"
    ],
    guideSettingsTitle: "4. 全局个性化定制与安全漫游",
    guideSettingsDesc: "克制的功能与强大的视觉设置体系，搭配原生云同步协议以保障你的数据真正属于你自己：",
    guideSettingsSteps: [
      "布局调节：进入左下角的「设置」中心，将侧边栏置顶，并无极调整全局卡片的圆角与间距大小。",
      "专属渐变：随心修改你喜爱的极光渐变壁纸、背景色、文字颜色，打造贴合你的极简美学空间。",
      "自定引擎：除了内置丰富的聚合搜索外，还可在设置内添加诸如你公司内部代码或文档的检索服务。",
      "数据自由：启用 WebDAV 同步，仅需填入部分免认证网盘（如坚果云）的账号就能跨设备端对端同步。"
    ],
    f1Title: "极速与零侵扰",
    f1Desc: "没有广告、没有新闻瀑布流、没有任何无用的一言或天气小组件。去除臃肿请求，实现毫秒级打开新标签页。",
    f2Title: "数据绝对安全 (本地核心)",
    f2Desc: "您的数据将100%安全。所有书签与配置均基于设备浏览器的 LocalStorage 存储。完全无需担心您的任何私密数据会被擅自上传到任何后端服务器。",
    f3Title: "原生 WebDAV 支持",
    f3Desc: "不想只限于单机？内置 WebDAV 协议同步支持。结合坚果云、Nextcloud 等服务，安全且独立地实现跨电脑书签漫游。",
    f4Title: "极致的布局定制能力",
    f4Desc: "全局间距、容器宽度、图标尺寸全部可无极调节。侧边或顶部导航栏、无限级嵌套文件夹、甚至字体排版，全部交由您掌控。",
    dlTitle: "获取与安装",
    dlWebTitle: "网页免装体验版",
    dlWebDesc: "无需安装任何插件，直接在浏览器中打开即可作为导航主页使用。得益于本地化存储，依然可以完美保存您的数据。",
    dlExtTitle: "插件离线安装包",
    dlExtDesc: "为了获得最好的原生和沉浸式体验，我们推荐下载 zip 包，在浏览器的扩展程序(需开启开发者模式)中“加载已解压的扩展程序”进行使用。",
    dlStoreTitle: "Chrome 应用商店",
    dlStoreDesc: "即将在 Chrome Web Store 上进行安全审核和上架，届时可提供官方的一键安装与更新升级服务。敬请期待。",
    dlBtnOnline: "立即打开网页版",
    dlBtnExt: "下载离线插件包 (.zip)",
    dlBtnStore: "即将上架 / Coming Soon",
    footerText: "P R I V A T E  &  P O W E R F U L",
    startApp: "开启应用",
    privacyTitle: "零知识 · 数据只属于你",
    privacySubtitle: "我们把隐私当成架构底线，而不是一句口号。以下是我们永远不会做的事：",
    p1: "完全免费，永不收费",
    p1d: "没有订阅、没有内购、没有广告，也不做任何诱导付费。",
    p2: "没有后端服务器",
    p2d: "我们不运营任何云端服务，你的书签不会经过我们的服务器。",
    p3: "数据 100% 存你本机",
    p3d: "书签与配置只保存在你浏览器的本地存储，断网也能用。",
    p4: "同步只走你自己的 WebDAV",
    p4d: "跨设备漫游由你自己的网盘（坚果云/Nextcloud 等）完成，密钥与数据都在你手里。",
    p5: "不埋点、不追踪、不加账号",
    p5d: "没有任何分析统计上报，也不需要注册登录——打开即用。",
    whatsnewEyebrow: "VERSION 2.0",
    whatsnewTitle: "2.0 全新升级",
    whatsnewSubtitle: "从导航面板进化为你的私人信息中枢——更聪明、更私密、更强大。",
    n1Title: "⌘K 命令面板",
    n1Desc: "键盘党福音：一键搜索、跳转、新建，双手不离键盘。",
    n2Title: "本地即时搜索",
    n2Desc: "标题 / 网址 / 备注 / 标签名毫秒级过滤，离线也能用。",
    n3Title: "标签体系",
    n3Desc: "跨分组弱关联归类，让同一书签在多个维度被轻松找到。",
    n4Title: "回收站",
    n4Desc: "误删不再可怕，软删除可恢复，保留期由你设定。",
    n5Title: "多空间",
    n5Desc: "工作 / 生活 / 项目完全隔离，每个空间独立数据与同步。",
    n6Title: "端到端加密",
    n6Desc: "AES-GCM 加密同步与备份，连网盘服务商也无法读取。",
    n7Title: "浏览器书签导入",
    n7Desc: "一键导入 Chrome / Edge / Firefox 书签，自动去重合并。",
    n8Title: "WebDAV 自动同步",
    n8Desc: "数据变动自动落盘到你的网盘，多端始终一致。",
    trust1: "100% 本地存储",
    trust2: "0 追踪上报",
    trust3: "永久免费",
    navHistory: "发展史",
    changelogEyebrow: "VERSION HISTORY",
    changelogTitle: "产品演进之路",
    changelogSubtitle: "从 1.0.0 基石到 2.0.0 跃迁——每一次迭代，都让工具更私密、更强大、更懂你。",
    changelogV1Tag: "基石版本",
    changelogV1Title: "本地优先的新标签页",
    changelogV1Desc: "一切的起点：把数据真正交还给用户。",
    changelogV1Items: [
      "本地优先架构：书签 100% 存浏览器，断网也能用",
      "无限嵌套文件夹：层级化收纳，告别平铺杂乱",
      "快速收集：粘贴网址自动解析标题与图标",
      "Markdown 备注：为每个书签撰写富文本说明",
      "拖拽排版：长按自由排序与跨组移动",
      "布局无极定制：间距 / 宽度 / 图标尺寸全可调",
      "WebDAV 同步：把书签备份到你自己的网盘",
      "隐私红线：免费 / 无后端 / 不埋点 / 不加账号",
    ],
    changelogV2Tag: "当前版本",
    changelogV2Title: "能力跃迁与产品化",
    changelogV2Desc: "从导航面板，进化为你的私人信息中枢。",
    changelogV2Items: [
      "⌘K 命令面板：双手不离键盘，搜索 / 跳转 / 新建一气呵成",
      "本地即时搜索：标题 / 网址 / 备注 / 标签毫秒级过滤",
      "标签体系：跨分组弱关联归类，多维度检索",
      "回收站：误删可恢复，保留期自定义",
      "多空间：工作 / 生活 / 项目数据完全隔离",
      "端到端加密：AES-GCM 加密同步与备份",
      "浏览器书签导入：Chrome / Edge / Firefox 一键去重",
      "WebDAV 自动同步：变更自动落盘到你的网盘",
      "官方介绍页与关于页上线，版本体系统一",
    ],
  },
  en: {
    title1: "Reimagine Your",
    title2: "New Tab",
    subtitle: "Say goodbye to bloated navigation boards. A fast, privacy-first, offline-capable new tab extension for efficiency.",
    online: "Try Online",
    features: "Features",
    download: "Get Extension",
    heroBtn1: "Try Web Version",
    heroBtn2: "Install Guide",
    release: "Release 2.0.0 is out",
    featureTitle: "Back to Basics",
    featureSubtitle: "Powerful foundations with restrained interactions to meet your advanced customization needs.",
    guide: "Guide",
    guideTitle: "Step-by-Step Guide",
    guideSubtitle: "Master LiteNav Tabs' core workflows with detailed illustrated steps",
    guideInstallTitle: "1. Quick Installation",
    guideInstallDesc: "For the absolute purest immersive experience, we highly recommend the offline extension. Here's a 10-second guide:",
    guideInstallSteps: [
      "Download the Offline ZIP package from the 'Download & Install' section below and extract it.",
      "Type 'chrome://extensions' manually into your browser address bar to open the Extensions tab.",
      "Toggle on the 'Developer mode' switch found in the top right corner.",
      "Click 'Load unpacked' on the left side and select the folder you just extracted. All done!"
    ],
    guideGroupTitle: "2. Master Groups & Nested Folders",
    guideGroupDesc: "Say goodbye to chaotic layouts. LiteNav supports incredibly powerful hierarchical organization features:",
    guideGroupSteps: [
      "Add Main Groups: Click the '+' at the bottom of the sidebar to create major groups like 'Work' or 'Leisure'.",
      "Create Folders: Inside any group, simply click the 'New Folder' button at the top to tidy up related bookmarks.",
      "Immersive Nesting: Click a folder to expand it full-screen. You can continue nesting sub-folders endlessly.",
      "Color Tags: Right-click on a folder to change its accent color, rename it, or assign an Emoji for fast recognition."
    ],
    guideAddTitle: "3. Quick Collection & Drag Layout",
    guideAddDesc: "Collecting new sites is insanely fast, and our drag-and-drop mechanism gives you complete arrangement control:",
    guideAddSteps: [
      "Smart Auto-fetch: Click the prominent '+' in any empty area, paste a URL, and we automatically resolve its title.",
      "Markdown Notes: Make your bookmarks richer. Write detailed Markdown descriptions for every important link.",
      "Freeform Drag & Drop: Long-press any bookmark card or folder to freely drag it, or drop it deeply into nested folders.",
      "Context Menus: Right-click any card anywhere to instantly edit, duplicate the link or safely delete it from the dashboard."
    ],
    guideSettingsTitle: "4. Personalization & WebDAV Sync",
    guideSettingsDesc: "Restrained interactions but overwhelming customizability. Plus, native syncing guarantees 100% data privacy:",
    guideSettingsSteps: [
      "Layout Tuning: Access 'Settings' from the bottom right to pin the sidebar top, or tweak card radius and scaling.",
      "Custom Theming: Configure the glowy aurora wallpaper gradient, custom palette, and pop-up overlay transparencies.",
      "Search Config: Use our standard aggregated unified search or easily add custom queries native to your daily workflow.",
      "Absolute Sync: Safely enable the native WebDAV protocol. Plug in your private cloud credentials for end-to-end sync."
    ],
    f1Title: "Lightning Fast & Clean",
    f1Desc: "No ads, no news feeds, no useless widgets. Stripped of bloated requests to achieve millisecond opening speed.",
    f2Title: "Absolute Data Security",
    f2Desc: "Your data is 100% secure. Everything is stored locally on your device via LocalStorage. Never worry about your bookmarks or privacy being uploaded to any backend service.",
    f3Title: "Native WebDAV Support",
    f3Desc: "Need sync? Built-in WebDAV protocol support. Integrate with Nextcloud or other services to safely sync your bookmarks across devices on your own terms.",
    f4Title: "Ultimate Customization",
    f4Desc: "Stepless adjustment for global spacing, container widths, and icon sizes. Sidebar or top navigation, infinite nested folders—everything is strictly under your control.",
    dlTitle: "Download & Install",
    dlWebTitle: "Online Web Version",
    dlWebDesc: "No installation required. Just open it directly in your browser. Thanks to local storage, it perfectly saves your data right there.",
    dlExtTitle: "Offline Extension Package",
    dlExtDesc: "For the best native experience, we recommend downloading the zip package and loading it as an unpacked extension in Developer Mode.",
    dlStoreTitle: "Chrome Web Store",
    dlStoreDesc: "Undergoing security review and will be available on the Chrome Web Store soon for 1-click installation.",
    dlBtnOnline: "Open Web Version",
    dlBtnExt: "Download Extension (.zip)",
    dlBtnStore: "Coming Soon",
    footerText: "P R I V A T E  &  P O W E R F U L",
    startApp: "Start App",
    privacyTitle: "Zero-Knowledge · Your Data Stays Yours",
    privacySubtitle: "We treat privacy as an architectural principle, not a slogan. Here is what we will never do:",
    p1: "Free forever, no charges",
    p1d: "No subscriptions, no in-app purchases, no ads, and no paywall tricks.",
    p2: "No backend servers",
    p2d: "We run no cloud service — your bookmarks never pass through our servers.",
    p3: "100% stored on your device",
    p3d: "Bookmarks and settings live only in your browser's local storage. Works fully offline.",
    p4: "Sync only via your own WebDAV",
    p4d: "Cross-device sync runs on your own drive (Nutstore / Nextcloud). Keys and data stay with you.",
    p5: "No analytics, no tracking, no accounts",
    p5d: "Zero telemetry reporting, and no sign-up needed — just open and use.",
    whatsnewEyebrow: "VERSION 2.0",
    whatsnewTitle: "2.0 — A Major Upgrade",
    whatsnewSubtitle: "From a new-tab panel to your private information hub — smarter, more private, more powerful.",
    n1Title: "⌘K Command Palette",
    n1Desc: "For keyboard lovers: jump, search and create instantly without leaving the keys.",
    n2Title: "Instant Local Search",
    n2Desc: "Filter by title, URL, note or tag in milliseconds, fully offline.",
    n3Title: "Tag System",
    n3Desc: "Weak-linked tags across groups let one bookmark live in many dimensions.",
    n4Title: "Recycle Bin",
    n4Desc: "Soft-delete with recovery and a retention window you control.",
    n5Title: "Multi-Profile",
    n5Desc: "Separate Work / Life / Project spaces, each with isolated data and sync.",
    n6Title: "End-to-End Encryption",
    n6Desc: "AES-GCM encrypted sync & backups; even your drive can't read them.",
    n7Title: "Browser Bookmark Import",
    n7Desc: "One-click import from Chrome / Edge / Firefox, auto-deduped.",
    n8Title: "WebDAV Auto-Sync",
    n8Desc: "Changes auto-push to your own drive — every device stays consistent.",
    trust1: "100% Local Storage",
    trust2: "0 Tracking",
    trust3: "Free Forever",
    navHistory: "History",
    changelogEyebrow: "VERSION HISTORY",
    changelogTitle: "Product Evolution",
    changelogSubtitle: "From the 1.0.0 foundation to the 2.0.0 leap — every iteration makes the tool more private, more powerful, more yours.",
    changelogV1Tag: "Foundation",
    changelogV1Title: "A Privacy-First New Tab",
    changelogV1Desc: "Where it all began: handing your data back to you.",
    changelogV1Items: [
      "Local-first architecture: bookmarks live 100% in your browser, works offline",
      "Infinite nested folders: hierarchical organization, no more flat mess",
      "Quick capture: paste a URL to auto-resolve its title & icon",
      "Markdown notes: rich-text descriptions for every bookmark",
      "Drag layout: long-press to freely reorder and move across groups",
      "Stepless theming: spacing / width / icon size all adjustable",
      "WebDAV sync: back up your bookmarks to your own drive",
      "Privacy red lines: free / no backend / no tracking / no accounts",
    ],
    changelogV2Tag: "Current",
    changelogV2Title: "Power Leap & Productization",
    changelogV2Desc: "From a new-tab panel into your private information hub.",
    changelogV2Items: [
      "⌘K Command Palette: jump, search and create without leaving the keys",
      "Instant local search: filter by title, URL, note or tag in milliseconds",
      "Tag system: weak-linked cross-group tagging for multi-dimensional find",
      "Recycle Bin: recover soft-deleted items with a retention window you set",
      "Multi-Profile: Work / Life / Project data fully isolated",
      "End-to-End Encryption: AES-GCM encrypted sync & backups",
      "Browser import: one-click dedup import from Chrome / Edge / Firefox",
      "WebDAV auto-sync: changes auto-push to your own drive",
      "Official landing & about pages shipped; version system unified",
    ],
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [isDark, setIsDark] = useState(true);

  // Load preferences
  useEffect(() => {
    const savedLang = localStorage.getItem('promo-lang');
    if (savedLang === 'en' || savedLang === 'zh') setLang(savedLang);
    
    const savedTheme = localStorage.getItem('promo-theme');
    if (savedTheme === 'light') setIsDark(false);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'zh' ? 'en' : 'zh';
    setLang(newLang);
    localStorage.setItem('promo-lang', newLang);
  };

  const toggleTheme = () => {
    const newThemeMode = !isDark;
    setIsDark(newThemeMode);
    localStorage.setItem('promo-theme', newThemeMode ? 'dark' : 'light');
  };

  const t = dict[lang];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#050505] text-white selection:bg-blue-500/30' : 'bg-slate-50 text-slate-900 selection:bg-blue-500/20'} font-sans overflow-x-hidden scroll-smooth transition-colors duration-500`}>
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full ${isDark ? 'bg-blue-600/10' : 'bg-blue-300/30'} blur-[120px]`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-300/30'} blur-[120px]`} />
        {isDark && <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[60%] h-[40%] rounded-full bg-violet-600/5 blur-[150px]" />}
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shadow-inner">
            <Compass className="text-white" size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight">LiteNav Tabs</span>
        </div>
        <div className="flex gap-4 sm:gap-6 items-center">
          <a href="#/app" className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors hidden sm:block`}>{t.online}</a>
          <a href="#features" className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors hidden sm:block`}>{t.features}</a>
          <a href="#guide" className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors hidden sm:block`}>{t.guide}</a>
          <a href="#changelog" className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors hidden sm:block`}>{t.navHistory}</a>
          
          <div className="flex items-center gap-2 border-l border-gray-500/20 pl-4 sm:pl-6 ml-2 sm:ml-0">
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-full ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'} transition-colors`}
              title="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={toggleLang} 
              className={`p-2 rounded-full ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'} transition-colors font-medium text-xs`}
              title="Toggle Language"
            >
              {lang === 'zh' ? 'EN' : '中'}
            </button>
          </div>
          
          <a href="#download" className={`px-5 py-2.5 text-sm font-medium ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'} rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.1)] hidden sm:flex`}>
            <Download size={16} /> <span>{t.download}</span>
          </a>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* Hero Section */}
        <section className="text-center max-w-5xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDark ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-200 bg-blue-50'} text-blue-500 text-xs font-medium tracking-wide uppercase mb-10`}
          >
            <Sparkles size={14} /> {t.release}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-6xl sm:text-7xl md:text-[100px] font-bold tracking-[-0.04em] leading-[1.05] sm:leading-[0.9]"
          >
            {t.title1}<br/>
            <span className={`text-transparent bg-clip-text bg-gradient-to-br ${isDark ? 'from-blue-400 via-indigo-300 to-white' : 'from-blue-600 via-indigo-500 to-slate-800'} pb-2 inline-block`}>
              {t.title2}
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`mt-10 text-lg md:text-2xl max-w-2xl font-light ${isDark ? 'text-gray-400' : 'text-slate-600'} leading-relaxed`}
          >
            {t.subtitle}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-14 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <a href="#/app" className={`px-8 py-4 ${isDark ? 'bg-white text-black hover:bg-gray-100 shadow-[0_0_40px_rgba(255,255,255,0.1)]' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.1)]'} rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-colors`}>
              {t.heroBtn1} <ArrowRight size={20} />
            </a>
            <a href="#download" className={`px-8 py-4 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'} border rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-colors backdrop-blur-sm`}>
              {t.heroBtn2} <Download size={20} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm"
          >
            {[
              { label: t.trust1, icon: Shield },
              { label: t.trust2, icon: Sparkles },
              { label: t.trust3, icon: Cloud },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                <s.icon size={16} className="text-blue-500" />
                <span className="font-medium">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Browser Mockup Section (Visual Anchor) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className={`mt-24 w-full h-[300px] sm:h-[500px] md:h-[600px] rounded-[2rem] border ${isDark ? 'border-white/10 bg-black' : 'border-slate-200 bg-white'} shadow-2xl relative overflow-hidden`}
          style={{ backgroundImage: isDark ? 'linear-gradient(to bottom, rgba(30,40,60,0.5), rgba(0,0,0,1))' : 'linear-gradient(to bottom, rgba(240,244,250,0.5), rgba(255,255,255,1))'}}
        >
          {/* Mock Browser Header */}
          <div className={`h-12 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100/50 border-slate-200'} border-b flex items-center px-4 gap-4 backdrop-blur-md`}>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className={`w-1/2 max-w-sm h-6 ${isDark ? 'bg-white/5' : 'bg-white'} rounded-md flex items-center px-3 mx-auto shadow-sm`}>
              <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-slate-400'} truncate`}>chrome://newtab</span>
            </div>
          </div>
          {/* Mock App Interface representation */}
          <div className={`p-8 flex items-center justify-center h-full ${isDark ? 'opacity-60' : 'opacity-80'}`}>
             <div className="w-full max-w-4xl opacity-50 pointer-events-none">
                <div className="flex justify-center mb-8 sm:mb-10"><div className={`text-4xl sm:text-6xl font-mono font-bold ${isDark ? 'text-white' : 'text-slate-800'} tracking-widest blur-[1px]`}>10:24</div></div>
                <div className={`flex justify-center h-10 sm:h-12 w-full max-w-xl mx-auto rounded-xl border ${isDark ? 'border-white/20 bg-white/5' : 'border-slate-200 bg-white shadow-sm'} mb-12 sm:mb-16 backdrop-blur-sm`}></div>
                <div className={`grid grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6 w-full ${isDark ? 'opacity-80' : 'opacity-100'}`}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`aspect-square rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'} border flex items-center justify-center`}>
                       <div className={`w-1/2 h-1/2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}></div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
          {/* Gradient Overlay for blend */}
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#050505]' : 'from-slate-50'} via-transparent border-none`}></div>
        </motion.div>

        {/* What's New in 2.0 */}
        <section className="mt-40">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDark ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-200 bg-blue-50'} text-blue-500 text-xs font-medium tracking-wide uppercase mb-6`}
            >
              <Sparkles size={14} /> {t.whatsnewEyebrow}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            >
              {t.whatsnewTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}
            >
              {t.whatsnewSubtitle}
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Command, title: t.n1Title, desc: t.n1Desc },
              { icon: Search, title: t.n2Title, desc: t.n2Desc },
              { icon: Tags, title: t.n3Title, desc: t.n3Desc },
              { icon: Trash2, title: t.n4Title, desc: t.n4Desc },
              { icon: Layers, title: t.n5Title, desc: t.n5Desc },
              { icon: Lock, title: t.n6Title, desc: t.n6Desc },
              { icon: Download, title: t.n7Title, desc: t.n7Desc },
              { icon: RefreshCw, title: t.n8Title, desc: t.n8Desc },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className={`p-6 rounded-[1.75rem] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]' : 'bg-white border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]'} border flex flex-col gap-3 transition-all`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <item.icon size={22} />
                </div>
                <h3 className="text-base font-bold leading-snug">{item.title}</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Version History / Changelog Timeline */}
        <section id="changelog" className="mt-40">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDark ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-200 bg-blue-50'} text-blue-500 text-xs font-medium tracking-wide uppercase mb-6`}
            >
              <Sparkles size={14} /> {t.changelogEyebrow}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            >
              {t.changelogTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}
            >
              {t.changelogSubtitle}
            </motion.p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Vertical spine */}
            <div className={`absolute left-[18px] sm:left-1/2 top-2 bottom-2 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'} sm:-translate-x-1/2`} />

            {[
              { version: '1.0.0', tag: t.changelogV1Tag, title: t.changelogV1Title, desc: t.changelogV1Desc, items: t.changelogV1Items, current: false },
              { version: '2.0.0', tag: t.changelogV2Tag, title: t.changelogV2Title, desc: t.changelogV2Desc, items: t.changelogV2Items, current: true },
            ].map((v, i) => (
              <motion.div
                key={v.version}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-12 items-start mb-14 last:mb-0"
              >
                {/* Node dot */}
                <div className={`absolute left-[18px] sm:left-1/2 top-2 w-3.5 h-3.5 rounded-full -translate-x-1/2 ring-4 z-10 ${v.current ? 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-blue-500/30' : isDark ? 'bg-white/40 ring-[#050505]' : 'bg-slate-400 ring-slate-50'}`} />

                {/* Version label side */}
                <div className={`${i % 2 === 0 ? 'sm:text-right sm:pr-6' : 'sm:col-start-2 sm:pl-6'}`}>
                  <div className={`inline-flex items-center gap-2 mb-2 ${i % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
                    <span className={`text-3xl font-bold tracking-tight ${v.current ? 'text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-300' : isDark ? 'text-white/80' : 'text-slate-700'}`}>v{v.version}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.current ? 'bg-blue-500/15 text-blue-500' : isDark ? 'bg-white/10 text-gray-400' : 'bg-slate-100 text-slate-500'}`}>{v.tag}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{v.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{v.desc}</p>
                </div>

                {/* Highlights side */}
                <div className={`mt-4 sm:mt-0 ${i % 2 === 0 ? 'sm:col-start-2 sm:pl-6' : 'sm:pr-6'}`}>
                  <ul className={`space-y-2.5 ${i % 2 === 0 ? '' : 'sm:text-right'}`}>
                    {v.items.map((it: string, j: number) => (
                      <li key={j} className={`flex items-start gap-2.5 ${i % 2 === 0 ? '' : 'sm:flex-row-reverse sm:text-right'}`}>
                        <div className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${v.current ? 'bg-blue-500' : isDark ? 'bg-white/40' : 'bg-slate-400'}`} />
                        <span className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <p className={`text-center text-xs mt-12 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
            {lang === 'zh' ? '想要更早的版本记录？完整发布说明可在仓库 Release 中查看。' : 'Looking for earlier releases? Full release notes live in the repository Releases.'}
          </p>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="mt-32">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{t.featureTitle}</h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{t.featureSubtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 auto-rows-[minmax(240px,auto)]">
            <div className={`md:col-span-2 p-8 md:p-10 rounded-[2rem] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]' : 'bg-white border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]'} border flex flex-col justify-between group transition-all`}>
              <div>
                <Zap className="text-amber-500 mb-6 w-10 h-10" />
                <h3 className="text-2xl font-bold mb-3">{t.f1Title}</h3>
                <p className={`text-base leading-relaxed max-w-md ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  {t.f1Desc}
                </p>
              </div>
            </div>
            
            <div className={`p-8 md:p-10 rounded-[2rem] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]' : 'bg-white border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]'} border flex flex-col justify-between group transition-all relative overflow-hidden`}>
              <div className={`absolute -right-4 -top-4 w-32 h-32 ${isDark ? 'bg-green-500/20' : 'bg-green-100'} blur-3xl rounded-full`}></div>
              <div>
                <Shield className="text-green-500 mb-6 w-10 h-10 relative z-10" />
                <h3 className="text-2xl font-bold mb-3 relative z-10">{t.f2Title}</h3>
                <p className={`text-base leading-relaxed relative z-10 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  {t.f2Desc}
                </p>
              </div>
            </div>

            <div className={`p-8 md:p-10 rounded-[2rem] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]' : 'bg-white border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]'} border flex flex-col justify-between group transition-all`}>
              <div>
                <Cloud className="text-blue-500 mb-6 w-10 h-10" />
                <h3 className="text-2xl font-bold mb-3">{t.f3Title}</h3>
                <p className={`text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  {t.f3Desc}
                </p>
              </div>
            </div>

            <div className={`md:col-span-2 p-8 md:p-10 rounded-[2rem] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]' : 'bg-white border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]'} border flex flex-col justify-between group transition-all relative overflow-hidden`}>
              <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-32 flex gap-4 opacity-20 pointer-events-none rotate-12 scale-150">
                <div className={`w-16 h-16 rounded-xl ${isDark ? 'bg-white/20 border-white/40' : 'bg-slate-300 border-slate-400'} border-2 border-dashed`}></div>
                <div className={`w-16 h-16 rounded-xl ${isDark ? 'bg-white/30 border-white/50' : 'bg-slate-200 border-slate-300'} backdrop-blur-sm border`}></div>
                <div className={`w-16 h-16 rounded-xl ${isDark ? 'bg-indigo-500/40' : 'bg-indigo-300/80'}`}></div>
              </div>
              <div className="relative z-10 w-full md:w-3/5">
                <Palette className="text-indigo-500 mb-6 w-10 h-10" />
                <h3 className="text-2xl font-bold mb-3">{t.f4Title}</h3>
                <p className={`text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  {t.f4Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-Step Guide Section */}
        <section id="guide" className="mt-40">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{t.guideTitle}</h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{t.guideSubtitle}</p>
          </div>

          <div className="space-y-32">
            
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6 order-2 md:order-1">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'} font-bold text-xl`}>1</div>
                <h3 className="text-3xl font-bold leading-tight">{t.guideInstallTitle}</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-slate-600'} text-lg leading-relaxed`}>{t.guideInstallDesc}</p>
                <ul className="space-y-4 mt-6">
                  {t.guideInstallSteps.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                       <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>0{idx + 1}</div>
                       <p className={`${isDark ? 'text-gray-300' : 'text-slate-700'} leading-relaxed`}>{step}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full md:w-auto order-1 md:order-2">
                <div className={`w-full aspect-[4/3] rounded-[2rem] p-6 lg:p-8 flex items-center justify-center relative overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'}`}>
                   {/* Abstract Chrome Extension Mockup */}
                   <div className={`w-full max-w-sm rounded-xl overflow-hidden shadow-2xl ${isDark ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-slate-300'}`}>
                      <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="text-xs font-semibold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Extensions</div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] uppercase font-bold text-gray-500">Dev Mode</span>
                           <div className="w-8 h-4 rounded-full bg-blue-500 relative"><div className="absolute right-1 top-1 w-2 h-2 rounded-full bg-white"></div></div>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className={`flex items-center justify-center py-2 px-3 rounded text-xs font-bold border ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-800 hover:bg-slate-100'}`}>Load unpacked...</div>
                        <div className={`p-3 rounded-lg border flex gap-3 ${isDark ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-300 bg-blue-50'}`}>
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-inner ${isDark ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}`}>
                              <Compass className="text-white w-5 h-5" />
                           </div>
                           <div>
                             <div className="text-sm font-bold flex items-center gap-2">LiteNav Tabs <span className="text-[9px] bg-blue-500 text-white px-1 py-0.5 rounded">v2.0</span></div>
                             <div className={`text-[10px] mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>A clean, privacy-first new tab for everyone.</div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 w-full md:w-auto">
                <div className={`w-full aspect-[4/3] rounded-[2rem] p-6 lg:p-8 flex items-center justify-center relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-white/10' : 'bg-gradient-to-br from-green-50 to-emerald-100/50 border border-slate-200'}`}>
                   {/* Abstract Sidebar Mockup */}
                   <div className={`w-64 h-full max-h-[300px] rounded-2xl flex flex-col shadow-2xl relative ${isDark ? 'bg-[#111] border border-white/10' : 'bg-white border border-slate-200'}`}>
                      <div className={`h-12 border-b flex items-center px-4 font-bold text-sm ${isDark ? 'border-white/10 text-white' : 'border-slate-100 text-slate-800'}`}>
                        My Sidebar
                      </div>
                      <div className="flex-1 p-3 space-y-2">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-800'}`}>
                          <LayoutGrid size={16} className="text-green-500" /> Work Stuff
                        </div>
                        <div className="pl-6 space-y-2 border-l ml-5 border-green-500/30">
                           <div className={`flex items-center gap-2 text-xs font-medium py-1 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                              <FolderPlus size={14} className="text-yellow-500" /> Projects
                           </div>
                           <div className={`flex items-center gap-2 text-xs py-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Tools
                           </div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                          <LayoutGrid size={16} /> Reading
                        </div>
                      </div>
                      <div className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 cursor-pointer ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
                        <div className="text-xl">+</div>
                      </div>
                   </div>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'} font-bold text-xl`}>2</div>
                <h3 className="text-3xl font-bold leading-tight">{t.guideGroupTitle}</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-slate-600'} text-lg leading-relaxed`}>{t.guideGroupDesc}</p>
                <ul className="space-y-4 mt-6">
                  {t.guideGroupSteps.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                       <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isDark ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-700 border border-green-200'}`}>0{idx + 1}</div>
                       <p className={`${isDark ? 'text-gray-300' : 'text-slate-700'} leading-relaxed`}>{step}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6 order-2 md:order-1">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-600'} font-bold text-xl`}>3</div>
                <h3 className="text-3xl font-bold leading-tight">{t.guideAddTitle}</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-slate-600'} text-lg leading-relaxed`}>{t.guideAddDesc}</p>
                <ul className="space-y-4 mt-6">
                  {t.guideAddSteps.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                       <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isDark ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-violet-100 text-violet-700 border border-violet-200'}`}>0{idx + 1}</div>
                       <p className={`${isDark ? 'text-gray-300' : 'text-slate-700'} leading-relaxed`}>{step}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full md:w-auto order-1 md:order-2">
                <div className={`w-full aspect-[4/3] rounded-[2rem] p-6 lg:p-10 flex flex-col justify-center relative overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'}`}>
                   {/* Abstract Grid Mockup */}
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-sm mx-auto relative perspective-1000">
                     <div className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-4 shadow-sm ${isDark ? 'bg-white/10 border border-white/10' : 'bg-white border border-slate-200'}`}>
                       <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"><div className="w-5 h-5 bg-red-500 rounded-md"></div></div>
                       <div className={`h-2 w-16 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-200'}`}></div>
                     </div>
                     <div className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-4 z-20 shadow-2xl scale-110 rotate-3 transition-transform ${isDark ? 'bg-white/15 border border-white/30 backdrop-blur-md' : 'bg-white border border-slate-300'}`}>
                       <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center"><div className="w-5 h-5 bg-indigo-500 rounded-md"></div></div>
                       <div className={`h-2 w-16 rounded-full ${isDark ? 'bg-white/30' : 'bg-slate-300'}`}></div>
                       {/* Simulate Drag Cursor */}
                       <MousePointerClick className="absolute -bottom-4 -right-4 w-8 h-8 text-black fill-white" />
                     </div>
                     <div className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed ${isDark ? 'border-white/20 hover:border-white/50 hover:bg-white/5' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}>
                       <div className={`text-3xl font-light ${isDark ? 'text-white/40' : 'text-slate-400'}`}>+</div>
                     </div>
                     <div className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-4 shadow-sm ${isDark ? 'bg-white/10 border border-white/10' : 'bg-white border border-slate-200'}`}>
                       <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center"><div className="w-5 h-5 bg-yellow-500 rounded-md"></div></div>
                       <div className={`h-2 w-16 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-200'}`}></div>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 w-full md:w-auto">
                <div className={`w-full aspect-[4/3] rounded-[2rem] p-6 lg:p-8 flex items-center justify-center relative overflow-hidden ${isDark ? 'bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 border border-white/10' : 'bg-gradient-to-tr from-purple-50 to-indigo-50 border border-slate-200'}`}>
                   {/* Abstract Settings Mockup */}
                   <div className={`w-full max-w-sm rounded-[1.5rem] shadow-2xl p-6 ${isDark ? 'bg-[#111]/90 border border-white/20 backdrop-blur-xl' : 'bg-white/90 border border-slate-300 backdrop-blur-xl'}`}>
                      <div className="flex items-center gap-3 mb-6">
                        <Settings className="text-purple-500" size={24} />
                        <h4 className="font-bold text-lg">Settings</h4>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className={`text-xs font-semibold mb-3 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Appearance</div>
                          <div className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-[#0F172A] border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                             <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300"></div>
                             <div className="w-8 h-8 rounded-full bg-emerald-950 border border-slate-700"></div>
                          </div>
                        </div>
                        <div>
                          <div className={`text-xs font-semibold mb-3 flex items-center justify-between uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            <span>WebDAV Sync</span>
                            <div className="w-10 h-5 rounded-full bg-purple-500 relative"><div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white shadow-sm"></div></div>
                          </div>
                          <div className={`h-8 rounded flex items-center px-3 text-xs opacity-50 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'}`}>
                             https://cloud.example.com/dav
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${isDark ? 'bg-amber-500/20 text-amber-500' : 'bg-amber-100 text-amber-600'} font-bold text-xl`}>4</div>
                <h3 className="text-3xl font-bold leading-tight">{t.guideSettingsTitle}</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-slate-600'} text-lg leading-relaxed`}>{t.guideSettingsDesc}</p>
                <ul className="space-y-4 mt-6">
                  {t.guideSettingsSteps.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                       <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isDark ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>0{idx + 1}</div>
                       <p className={`${isDark ? 'text-gray-300' : 'text-slate-700'} leading-relaxed`}>{step}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* Privacy Promise Section */}
        <section id="privacy" className="mt-40">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDark ? 'border-green-500/30 bg-green-500/10' : 'border-green-200 bg-green-50'} text-green-600 text-xs font-medium tracking-wide uppercase mb-6`}>
              <Shield size={14} /> Privacy Promise
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{t.privacyTitle}</h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{t.privacySubtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: t.p1, desc: t.p1d },
              { icon: Cloud, title: t.p2, desc: t.p2d },
              { icon: Shield, title: t.p3, desc: t.p3d },
              { icon: LinkIcon, title: t.p4, desc: t.p4d },
              { icon: MousePointerClick, title: t.p5, desc: t.p5d },
            ].map((item, idx) => (
              <div key={idx} className={`p-7 rounded-[2rem] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]' : 'bg-white border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} border flex flex-col gap-3 transition-all`}>
                <item.icon className="text-green-500 w-8 h-8" />
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{item.desc}</p>
              </div>
            ))}
            <div className={`p-7 rounded-[2rem] ${isDark ? 'bg-gradient-to-br from-green-500/10 to-blue-500/5 border-white/10' : 'bg-gradient-to-br from-green-50 to-blue-50 border-slate-200'} border flex flex-col justify-center items-center text-center gap-2`}>
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>LiteNav Tabs</div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>本地优先 · 隐私优先 · 永远免费</p>
            </div>
          </div>
        </section>

        {/* Download & Installation Guide */}
        <section id="download" className="mt-40">
          <div className={`p-10 md:p-16 border rounded-[2.5rem] ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white shadow-xl'} backdrop-blur-xl relative overflow-hidden`}>
            {/* Inner atmospheric glow */}
            {isDark && <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none transform translate-x-1/3 -translate-y-1/3" />}
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">{t.dlTitle}</h2>
              
              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Method 1: Web Interface */}
                <div className={`p-8 rounded-3xl ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-slate-50 border-slate-100'} border flex flex-col h-full`}>
                  <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'} flex items-center justify-center mb-6`}>
                    <Globe size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t.dlWebTitle}</h3>
                  <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t.dlWebDesc}</p>
                  
                  <div className="mt-auto">
                    <a href="#/app" className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors`}>
                      {t.dlBtnOnline} <ArrowRight size={16} />
                    </a>
                  </div>
                </div>

                {/* Method 2: Offline Zip */}
                <div className={`p-8 rounded-3xl ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-slate-50 border-slate-100'} border flex flex-col h-full relative overflow-hidden`}>
                   {isDark && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>}
                  <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'} flex items-center justify-center mb-6 relative z-10`}>
                    <LayoutGrid size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 relative z-10">{t.dlExtTitle}</h3>
                  <p className={`text-sm mb-8 leading-relaxed relative z-10 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t.dlExtDesc}</p>
                  
                  <div className="mt-auto relative z-10">
                    <a href="https://github.com" target="_blank" rel="noreferrer" className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'} transition-colors`}>
                      <Download size={16} /> {t.dlBtnExt}
                    </a>
                  </div>
                </div>

                {/* Method 3: Web Store */}
                <div className={`p-8 rounded-3xl ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-slate-50 border-slate-100'} border flex flex-col h-full opacity-70`}>
                  <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'} flex items-center justify-center mb-6`}>
                    <Chrome size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t.dlStoreTitle}</h3>
                  <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t.dlStoreDesc}</p>
                  
                  <div className="mt-auto cursor-not-allowed">
                    <button disabled className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 ${isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400'} border ${isDark ? 'border-dashed border-white/20' : 'border-dashed border-slate-300'}`}>
                      {t.dlBtnStore}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDark ? 'border-white/5' : 'border-slate-200'} mt-20 relative z-10 w-full px-6 py-10`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-400'} flex items-center gap-2 font-medium`}>
            <Compass size={16} /> LiteNav Tabs
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-600' : 'text-slate-300'} uppercase tracking-widest text-center`}>
            {t.footerText}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-400'} flex gap-4 font-medium`}>
            <a href="#/app" className={`${isDark ? 'hover:text-white' : 'hover:text-slate-800'} transition-colors`}>{t.startApp}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

