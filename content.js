console.log('🚀 PICKCAT Plus 已启动');

// ==========================================
// 1. 鼠标指针注入（单箭头与自定义）
// ==========================================
function injectCursorStyle(cursorStyle, customBase64) {
    let cursorStyleTag = document.getElementById('pickcat-cursor-style');
    
    if (!cursorStyle || cursorStyle === 'default') {
        if (cursorStyleTag) cursorStyleTag.remove();
        return;
    }

    if (!cursorStyleTag) {
        cursorStyleTag = document.createElement('style');
        cursorStyleTag.id = 'pickcat-cursor-style';
        document.head.appendChild(cursorStyleTag);
    }

    // 获取指针路径
    let normal = '';
    if (cursorStyle === 'custom' && customBase64 && customBase64.startsWith('data:image')) {
        normal = customBase64;
    } else {
        // style1, style2, style3, style6 默认读取 styleX.png
        normal = chrome.runtime.getURL(`cursors/${cursorStyle}.png`);
    }

    // 统一映射：因为没有全套，所有交互点都使用同一个指针，但保留 pointer/text 的语义
    let cssText = `
        html, body, div, span, p, h1, h2, h3, h4, h5, h6, li, ul, ol, table, tr, td, th, main, header, footer, section, article, textarea, input, a, button, [role="button"], select, option, summary, img, canvas, svg, video {
            cursor: url('${normal}'), auto !important;
        }
        a, a *, button, button *, [role="button"], .cursor-pointer, select, option, summary, [onclick], .btn {
            cursor: url('${normal}'), pointer !important;
        }
        input, textarea, [contenteditable="true"], p, span, .prose, .markdown-body {
            cursor: url('${normal}'), text !important;
        }
    `;

    cursorStyleTag.textContent = cssText;
    console.log(`✅ 鼠标指针注入成功:`, cursorStyle);
}

// ==========================================
// 2. 背景与遮罩
// ==========================================
function applyBackground(bgUrl, maskEnabled) {
    if (!bgUrl || bgUrl.length < 5) {
        document.documentElement.style.removeProperty('background-image');
    } else {
        let finalBgImage = `url('${bgUrl}')`;
        if (maskEnabled) {
            const isDarkMode = document.documentElement.classList.contains('dark');
            const maskColor = isDarkMode ? 'rgba(15, 15, 15, 0.85)' : 'rgba(255, 255, 255, 0.85)';
            finalBgImage = `linear-gradient(${maskColor}, ${maskColor}), url('${bgUrl}')`;
        }
        document.documentElement.style.setProperty('background-image', finalBgImage, 'important');
        document.documentElement.style.setProperty('background-size', 'cover', 'important');
        document.documentElement.style.setProperty('background-position', 'center', 'important');
        document.documentElement.style.setProperty('background-attachment', 'fixed', 'important');
        document.documentElement.style.setProperty('background-repeat', 'no-repeat', 'important');
    }
    
    let style = document.getElementById('pickcat-custom-theme-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'pickcat-custom-theme-style';
        document.head.appendChild(style);
    }
    style.textContent = `
        body, #__next, #root, .bg-canvas, .min-h-dvh { 
            background-color: transparent !important; 
            background-image: none !important; 
        } 
        img[src*="home-decoration"], img[src*="search-decoration"] { 
            display: none !important; 
        }
    `;
}

// ==========================================
// 3. 注入 Kitten4 (不覆盖KN)
// ==========================================
function injectKitten4() {
    if (document.getElementById('pickcat-custom-kitten4')) return;
    const links = document.querySelectorAll('a');
    for (let link of links) {
        if (link.id !== 'pickcat-custom-kitten4' && link.textContent.includes('KittenN')) {
            const clone = link.cloneNode(true);
            clone.id = 'pickcat-custom-kitten4';
            clone.href = 'https://kitten4.codemao.cn/';
            clone.target = '_blank';
            
            const img = clone.querySelector('img');
            if (img) {
                img.src = 'https://pic1.imgdb.cn/i/034hpkyOpuw8Chd1mYXPav.png';
                img.style.objectFit = 'contain';
            }
            
            const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
            let textNode;
            while ((textNode = walker.nextNode())) {
                if (textNode.nodeValue.includes('KittenN')) {
                    textNode.nodeValue = textNode.nodeValue.replace('KittenN', 'Kitten4');
                    break;
                }
            }
            
            link.parentNode.insertBefore(clone, link.nextSibling);
            break; 
        }
    }
}

// ==========================================
// 4. 帖子外链
// ==========================================
function processLinks() {
    const currentHost = window.location.hostname;
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.includes('/forum/category/')) return;
        const isExternal = !href.startsWith('#') && !href.includes(currentHost) && !href.startsWith('javascript:') && !href.startsWith('/');
        if (isExternal) {
            link.setAttribute('target', '_blank');
            if (!link.dataset.externalHooked) {
                link.dataset.externalHooked = 'true';
                link.addEventListener('click', function(e) {
                    if (e.button === 0) { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        window.open(href, '_blank'); 
                    }
                });
            }
        }
    });
}

// ==========================================
// 5. 🎃 万圣节主题
// ==========================================
// 覆盖 Nuxt UI 的 --ui-* 主题变量，同时补充针对性样式
const HALLOWEEN_CSS = `
html.pickcat-halloween,
html.pickcat-halloween.dark {
    color-scheme: dark;
    --ui-bg: #160a26;
    --ui-bg-shell: #12071e;
    --ui-bg-elevated: #25103e;
    --ui-bg-accented: #2c1246;
    --ui-bg-muted: #1f0f34;
    --ui-bg-inset: #1a0b2e;
    --ui-bg-input: color-mix(in srgb, #2a1446 60%, transparent);
    --ui-bg-inverted: #241003;
    --ui-card-translucent: color-mix(in srgb, #1c0d30 88%, transparent);
    --ui-card-interactive: color-mix(in srgb, #2f1353 86%, transparent);

    --ui-primary: #ff8c1a;
    --ui-primary-hover: #ffa13c;
    --ui-color-primary-50: #33154d;
    --ui-color-primary-100: #4a2a73;
    --ui-color-primary-200: #8b5cf6;
    --ui-color-primary-300: #ffc078;
    --ui-color-primary-400: #ffa94d;
    --ui-color-primary-500: #ff8c1a;
    --ui-color-primary-600: #e67300;
    --ui-color-primary-700: #c96200;
    --ui-color-primary-800: #a34f00;
    --ui-color-primary-900: #7a3b00;
    --ui-color-primary-950: #572900;

    --ui-secondary: #8b5cf6;
    --ui-color-secondary-400: #a78bfa;
    --ui-color-secondary-500: #8b5cf6;
    --ui-color-secondary-600: #7c3aed;
    --ui-color-secondary-700: #6d28d9;

    --ui-text: #f3e8ff;
    --ui-text-muted: #c4a6e6;
    --ui-text-dimmed: #9e7fc6;
    --ui-text-highlighted: #ffffff;
    --ui-text-toned: #ffffff;
    --ui-text-on-primary: #241003;
    --ui-text-inverted: #241003;

    --ui-border: #3a1f5c;
    --ui-border-muted: #2e174a;
    --ui-border-inverted: #a78bfa;
    --ui-border-accented: #4a2a73;

    --ui-success: #4ade80;
    --ui-warning: #facc15;
    --ui-error: #fb7185;
    --ui-info: #a78bfa;
}

/* ---- 页面大背景：万圣夜——明月 + 南瓜/蝙蝠/幽灵剪影 + 幽光 ---- */
html.pickcat-halloween body {
    background-color: #12071e !important;
    background-image:
        radial-gradient(760px 520px at 84% 10%, rgba(255, 208, 130, 0.16), transparent 62%),
        radial-gradient(280px 280px at 85% 11%, rgba(255, 233, 189, 0.9) 0%, rgba(255, 217, 143, 0.55) 36%, rgba(255, 217, 143, 0.18) 56%, transparent 68%),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cg fill='%23c9adf0' opacity='0.5'%3E%3Cg transform='translate(38 46) scale(1.1)'%3E%3Crect x='-1.6' y='-9' width='3.2' height='4.5' rx='1.6'/%3E%3Cellipse cx='0' cy='0' rx='10' ry='8.5'/%3E%3Cellipse cx='-5.5' cy='0' rx='4' ry='7.5'/%3E%3Cellipse cx='5.5' cy='0' rx='4' ry='7.5'/%3E%3C/g%3E%3Cg transform='translate(150 192) scale(1.7)'%3E%3Crect x='-1.6' y='-9' width='3.2' height='4.5' rx='1.6'/%3E%3Cellipse cx='0' cy='0' rx='10' ry='8.5'/%3E%3Cellipse cx='-5.5' cy='0' rx='4' ry='7.5'/%3E%3Cellipse cx='5.5' cy='0' rx='4' ry='7.5'/%3E%3C/g%3E%3Cg transform='translate(26 168) scale(0.75)'%3E%3Crect x='-1.6' y='-9' width='3.2' height='4.5' rx='1.6'/%3E%3Cellipse cx='0' cy='0' rx='10' ry='8.5'/%3E%3Cellipse cx='-5.5' cy='0' rx='4' ry='7.5'/%3E%3Cellipse cx='5.5' cy='0' rx='4' ry='7.5'/%3E%3C/g%3E%3Cg transform='translate(100 26) scale(1.1)'%3E%3Cpath d='M12 2 C8 2 3 5 1 10 C1 12 2 13 4 13 L5 11 L6 13 C8 14 16 14 18 13 L19 11 L20 13 C22 13 23 12 23 10 C21 5 16 2 12 2 Z'/%3E%3C/g%3E%3Cg transform='translate(202 112) scale(1.3) rotate(-15)'%3E%3Cpath d='M12 2 C8 2 3 5 1 10 C1 12 2 13 4 13 L5 11 L6 13 C8 14 16 14 18 13 L19 11 L20 13 C22 13 23 12 23 10 C21 5 16 2 12 2 Z'/%3E%3C/g%3E%3Cg transform='translate(72 130) scale(0.8) rotate(12)'%3E%3Cpath d='M12 2 C8 2 3 5 1 10 C1 12 2 13 4 13 L5 11 L6 13 C8 14 16 14 18 13 L19 11 L20 13 C22 13 23 12 23 10 C21 5 16 2 12 2 Z'/%3E%3C/g%3E%3Cg transform='translate(198 196) scale(1.1)'%3E%3Cpath d='M0 -10 C-9 -10 -10 -3 -10 2 L-10 12 C-7 10 -5 13 -2 11 C1 13 3 10 6 12 C8 11 9 12 10 12 L10 2 C10 -3 9 -10 0 -10 Z'/%3E%3C/g%3E%3Cg transform='translate(40 106) scale(0.7)'%3E%3Cpath d='M0 -10 C-9 -10 -10 -3 -10 2 L-10 12 C-7 10 -5 13 -2 11 C1 13 3 10 6 12 C8 11 9 12 10 12 L10 2 C10 -3 9 -10 0 -10 Z'/%3E%3C/g%3E%3Cpath transform='translate(130 80) scale(1)' d='M0 -7 Q1.2 -1.2 7 0 Q1.2 1.2 0 7 Q-1.2 1.2 -7 0 Q-1.2 -1.2 0 -7 Z'/%3E%3Cpath transform='translate(10 10) scale(0.8)' d='M0 -7 Q1.2 -1.2 7 0 Q1.2 1.2 0 7 Q-1.2 1.2 -7 0 Q-1.2 -1.2 0 -7 Z'/%3E%3Cpath transform='translate(225 38) scale(0.7)' d='M0 -7 Q1.2 -1.2 7 0 Q1.2 1.2 0 7 Q-1.2 1.2 -7 0 Q-1.2 -1.2 0 -7 Z'/%3E%3Cpath transform='translate(58 220) scale(0.9)' d='M0 -7 Q1.2 -1.2 7 0 Q1.2 1.2 0 7 Q-1.2 1.2 -7 0 Q-1.2 -1.2 0 -7 Z'/%3E%3Cpath transform='translate(190 60) scale(0.6)' d='M0 -7 Q1.2 -1.2 7 0 Q1.2 1.2 0 7 Q-1.2 1.2 -7 0 Q-1.2 -1.2 0 -7 Z'/%3E%3C/g%3E%3C/svg%3E"),
        radial-gradient(1100px 620px at 82% -12%, rgba(124, 58, 237, .30), transparent 62%),
        radial-gradient(900px 520px at 8% 108%, rgba(255, 140, 26, .18), transparent 60%),
        radial-gradient(560px 320px at 10% 94%, rgba(110, 231, 183, 0.10), transparent 60%),
        radial-gradient(700px 420px at 100% 55%, rgba(74, 42, 115, .42), transparent 55%) !important;
    background-attachment: fixed !important;
    color: var(--ui-text);
}

/* 页面根容器透明化，露出 body 上的明月与剪影背景（html 的底色也放开） */
html.pickcat-halloween,
html.pickcat-halloween #__nuxt,
html.pickcat-halloween #__next,
html.pickcat-halloween #root,
html.pickcat-halloween [class*="min-h-dvh"][class*="bg-muted"],
html.pickcat-halloween [class*="min-h-dvh"][class*="bg-shell"] {
    background-color: transparent !important;
    background-image: none !important;
}

/* ---- 页头 ---- */
html.pickcat-halloween header {
    background: color-mix(in srgb, #170b29 72%, transparent) !important;
    border-bottom: 1px solid var(--ui-border-muted);
    backdrop-filter: blur(10px);
}

/* ---- 链接 ---- */
html.pickcat-halloween a:not([class*="text-primary"]):hover { color: var(--ui-primary); }

/* ---- 帖子卡片：南瓜橙描边 + 幽光 ---- */
html.pickcat-halloween article {
    border: 1px solid color-mix(in srgb, #4a2a73 45%, transparent);
    background: color-mix(in srgb, #1c0d30 86%, transparent) !important;
    backdrop-filter: blur(6px);
    transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}
html.pickcat-halloween article:hover {
    border-color: var(--ui-primary) !important;
    background: color-mix(in srgb, #2a1246 88%, transparent) !important;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary) 55%, transparent),
                0 14px 34px -14px rgba(255, 140, 26, .5) !important;
}

/* ---- 帖子卡片装饰：右上角一只小南瓜（不挡点击） ---- */
html.pickcat-halloween article::before {
    content: "🎃";
    position: absolute;
    top: 8px;
    right: 10px;
    font-size: 14px;
    line-height: 1;
    z-index: 25;
    opacity: .9;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, .45));
}

/* ---- 帖子标签：紫药丸（仅帖子卡片内，自适应高度，圆角正好包住文字） ---- */
html.pickcat-halloween article a[href*="/forum/category/"] {
    display: inline-flex !important;
    align-items: center;
    height: auto !important;
    line-height: 1.5;
    padding: 2px 10px;
    box-sizing: border-box;
    white-space: nowrap;
    border: 1px solid #4a2a73;
    border-radius: 999px;
    background: color-mix(in srgb, #3a1f5c 55%, transparent);
    color: #e2d0f8;
    transition: border-color .15s ease, color .15s ease, background .15s ease;
}
html.pickcat-halloween article a[href*="/forum/category/"]:hover {
    border-color: var(--ui-primary);
    color: var(--ui-primary);
    background: color-mix(in srgb, #4a2a73 62%, transparent);
}

/* ---- 侧栏板块卡片（创作与作品等方形分区） ---- */
html.pickcat-halloween aside section a[href*="/forum/category/"] {
    position: relative;
    background:
        linear-gradient(160deg, color-mix(in srgb, #2c1246 86%, transparent),
                        color-mix(in srgb, #1c0d30 92%, transparent)) !important;
    border: 1px solid color-mix(in srgb, #4a2a73 55%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .04);
    backdrop-filter: blur(6px);
    transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}
html.pickcat-halloween aside section a[href*="/forum/category/"]:hover {
    border-color: var(--ui-primary) !important;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary) 55%, transparent),
                0 12px 26px -12px rgba(255, 140, 26, .45) !important;
    transform: translateY(-2px);
}
/* 板块卡片装饰：右下角一只小幽灵 */
html.pickcat-halloween aside section a[href*="/forum/category/"]::after {
    content: "👻";
    position: absolute;
    right: 6px;
    bottom: 6px;
    font-size: 13px;
    line-height: 1;
    opacity: .8;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .4));
}
html.pickcat-halloween aside section a[href*="/forum/category/"] [class*="bg-info"],
html.pickcat-halloween aside section a[href*="/forum/category/"] span.text-info {
    background: color-mix(in srgb, var(--ui-primary) 16%, transparent) !important;
    color: var(--ui-primary) !important;
}

/* ---- 搜索框 ---- */
html.pickcat-halloween input[placeholder*="搜索"],
html.pickcat-halloween input[type="search"] {
    background: color-mix(in srgb, #2a1446 55%, transparent) !important;
    border: 1px solid var(--ui-border-accented) !important;
    color: var(--ui-text) !important;
}
html.pickcat-halloween input[placeholder*="搜索"]::placeholder { color: #9e7fc6 !important; }

/* ---- 选项卡（关注/推荐/最新）活跃项用主题色自动呈现 ---- */

/* ---- 滚动条 ---- */
html.pickcat-halloween *::-webkit-scrollbar { width: 10px; height: 10px; }
html.pickcat-halloween *::-webkit-scrollbar-thumb { background: #4a2a73; border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
html.pickcat-halloween *::-webkit-scrollbar-thumb:hover { background: var(--ui-primary); background-clip: padding-box; }
html.pickcat-halloween *::-webkit-scrollbar-track { background: transparent; }

/* ---- 文本选中：南瓜橙 ---- */
html.pickcat-halloween ::selection { background: #ff8c1a; color: #241003; }

/* ---- “分享你的想法”按钮：彩带换成南瓜/幽灵 ---- */
html.pickcat-halloween .posting-confetti-background .confetti-paper {
    background: transparent !important;
    box-shadow: none !important;
    width: 12px !important;
    height: 12px !important;
}
html.pickcat-halloween .posting-confetti-background .confetti-piece::before {
    content: "🎃";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    line-height: 1;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .35));
}
html.pickcat-halloween .posting-confetti-background .confetti-piece:nth-child(odd)::before {
    content: "👻";
}

/* ---- 点赞特效：南瓜/幽灵 飞散（由 decorateLikeButtons 触发） ---- */
.pch-like-burst {
    position: fixed;
    z-index: 9999;
    font-size: 20px;
    line-height: 1;
    pointer-events: none;
    opacity: 0;
    animation: pchLikeBurst 1.3s ease-out forwards;
}
@keyframes pchLikeBurst {
    0%   { opacity: 0; transform: translate(0, 0) scale(.5) rotate(0deg); }
    12%  { opacity: 1; }
    100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.15) rotate(var(--rot)); }
}

/* ---- 角落蜘蛛网装饰 ---- */
#pickcat-halloween-corners {
    position: fixed; left: 0; right: 0; bottom: 0; height: 0;
    pointer-events: none; z-index: 0;
}
#pickcat-halloween-corners svg {
    position: fixed; bottom: 0;
    overflow: hidden;
}
#pickcat-halloween-corners .pch-web-l { left: 0; }
#pickcat-halloween-corners .pch-web-r { right: 0; }
#pickcat-halloween-corners .pch-spider {
    transform-box: fill-box;
    transform-origin: 50% 0;
    animation: pchSpiderSwing 7s ease-in-out infinite;
}
@keyframes pchSpiderSwing {
    0%, 100% { transform: rotate(0deg); }
    50%      { transform: rotate(9deg); }
}
`;

function applyHalloweenTheme(enabled) {
    let styleTag = document.getElementById('pickcat-halloween-style');
    if (enabled) {
        document.documentElement.classList.add('pickcat-halloween');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'pickcat-halloween-style';
            document.head.appendChild(styleTag);
        }
        styleTag.textContent = HALLOWEEN_CSS;
        injectHalloweenCorners();
    } else {
        document.documentElement.classList.remove('pickcat-halloween');
        if (styleTag) styleTag.remove();
        const corners = document.getElementById('pickcat-halloween-corners');
        if (corners) corners.remove();
    }
}

// 角落蜘蛛网装饰（固定贴边、位于内容之下、不挡交互）
function injectHalloweenCorners() {
    if (document.getElementById('pickcat-halloween-corners')) return;

    const WEB_GROUP = `
        <g stroke="rgba(210, 182, 250, 0.72)" stroke-width="1.5" fill="none" stroke-linecap="round">
            <line x1="0" y1="250" x2="250" y2="250"/>
            <line x1="0" y1="250" x2="190" y2="64"/>
            <line x1="0" y1="250" x2="106" y2="22"/>
            <line x1="0" y1="250" x2="42" y2="150"/>
            <line x1="0" y1="250" x2="150" y2="205"/>
            <line x1="0" y1="250" x2="92" y2="118"/>
            <line x1="0" y1="250" x2="30" y2="60"/>
            <circle cx="0" cy="250" r="52"/>
            <circle cx="0" cy="250" r="104"/>
            <circle cx="0" cy="250" r="156"/>
            <circle cx="0" cy="250" r="208"/>
            <circle cx="0" cy="250" r="250"/>
        </g>
        <g text-anchor="middle" dominant-baseline="central">
            <line x1="138" y1="150" x2="138" y2="158" stroke="rgba(210,182,250,0.6)" stroke-width="1"/>
            <text x="138" y="163" font-size="16">🎃</text>
            <line x1="80" y1="100" x2="80" y2="108" stroke="rgba(210,182,250,0.6)" stroke-width="1"/>
            <text x="80" y="113" font-size="14">👻</text>
            <line x1="178" y1="196" x2="178" y2="204" stroke="rgba(210,182,250,0.6)" stroke-width="1"/>
            <text x="178" y="209" font-size="13">🍬</text>
        </g>`;

    // 一只小蜘蛛（挂在网上）
    const SPIDER = `
        <g class="pch-spider">
            <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(203,176,255,0.6)" stroke-width="1"/>
            <g transform="translate(0 14)">
                <circle r="3.2" fill="#1c0d30" stroke="#4a2a73" stroke-width="0.8"/>
                <circle cy="3.4" r="4.6" fill="#241038" stroke="#4a2a73" stroke-width="0.8"/>
                <g stroke="#241038" stroke-width="1.1" stroke-linecap="round">
                    <line x1="-2.5" y1="1.5" x2="-7" y2="-2"/>
                    <line x1="-3.5" y1="2.5" x2="-8.5" y2="1"/>
                    <line x1="-3.5" y1="4" x2="-8.5" y2="5"/>
                    <line x1="-2.5" y1="5.5" x2="-6.5" y2="8.5"/>
                    <line x1="2.5" y1="1.5" x2="7" y2="-2"/>
                    <line x1="3.5" y1="2.5" x2="8.5" y2="1"/>
                    <line x1="3.5" y1="4" x2="8.5" y2="5"/>
                    <line x1="2.5" y1="5.5" x2="6.5" y2="8.5"/>
                </g>
            </g>
        </g>`;

    const corners = document.createElement('div');
    corners.id = 'pickcat-halloween-corners';

    // 左下角蜘蛛网
    const webL = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    webL.setAttribute('viewBox', '0 0 250 250');
    webL.setAttribute('width', '150');
    webL.setAttribute('height', '150');
    webL.setAttribute('class', 'pch-web-l');
    webL.innerHTML = WEB_GROUP + `<g transform="translate(88 52) scale(0.9)">${SPIDER}</g>`;

    // 右下角蜘蛛网（水平镜像）
    const webR = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    webR.setAttribute('viewBox', '0 0 250 250');
    webR.setAttribute('width', '150');
    webR.setAttribute('height', '150');
    webR.setAttribute('class', 'pch-web-r');
    webR.innerHTML = `<g transform="translate(250 0) scale(-1 1)">${WEB_GROUP}</g>
                      <g transform="translate(162 52) scale(-0.9 0.9)">${SPIDER}</g>`;

    corners.appendChild(webL);
    corners.appendChild(webR);
    document.body.appendChild(corners);
}

// ==========================================
// 6. 初始化与监听
// ==========================================

// 点赞特效：给爱心点赞按钮绑定南瓜/幽灵 飞散
function decorateLikeButtons() {
    if (!document.documentElement.classList.contains('pickcat-halloween')) return;
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
        if (btn.classList.contains('pch-like-btn')) return;
        const svg = btn.querySelector('svg');
        if (!svg || !/M12 5.705c-3.692/.test(svg.innerHTML)) return;
        btn.classList.add('pch-like-btn');
        btn.addEventListener('click', () => { pumpkinBurst(btn); });
    });
}

// 点赞时飞散南瓜/幽灵
function pumpkinBurst(anchor) {
    if (!document.documentElement.classList.contains('pickcat-halloween')) return;
    const rect = anchor.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = 7;
    for (let i = 0; i < count; i++) {
        const s = document.createElement('div');
        s.className = 'pch-like-burst';
        s.textContent = (i % 2 === 0) ? '🎃' : '👻';
        s.style.left = (cx + (Math.random() * 36 - 18)) + 'px';
        s.style.top = cy + 'px';
        s.style.setProperty('--dx', ((Math.random() * 2 - 1) * 90) + 'px');
        s.style.setProperty('--dy', (-(Math.random() * 55 + 70)) + 'px');
        s.style.setProperty('--rot', ((Math.random() * 2 - 1) * 180) + 'deg');
        s.style.animationDelay = (i * 0.045) + 's';
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1600);
    }
}

function init() {
    chrome.storage.local.get(['pickcatBgUrl', 'pickcatMaskEnabled', 'pickcatCursor', 'pickcatCustomCursor', 'pickcatHalloween'], (res) => {
        const bgUrl = res.pickcatBgUrl || '';
        const maskEnabled = res.pickcatMaskEnabled !== undefined ? res.pickcatMaskEnabled : true;
        const halloween = res.pickcatHalloween !== undefined ? res.pickcatHalloween : true; // 默认开启万圣节主题

        // 容错：如果用户之前存过 style4/style5，强制回退到 default
        let cursorStyle = res.pickcatCursor || 'default'; 
        if (['style4', 'style5'].includes(cursorStyle)) {
            cursorStyle = 'default';
        }
        // 万圣节模式下，默认指针自动换成南瓜款 style6
        if (halloween && (cursorStyle === 'default')) {
            cursorStyle = 'style6';
        }
        
        const customCursor = res.pickcatCustomCursor || '';
        
        applyHalloweenTheme(halloween);
        applyBackground(bgUrl, maskEnabled);
        injectCursorStyle(cursorStyle, customCursor); 
        decorateLikeButtons();
    });
    processLinks();
    injectKitten4();
}

function startApp() {
    if (!document.body) { 
        setTimeout(startApp, 50); 
        return; 
    }
    
    const observer = new MutationObserver(() => { 
        processLinks(); 
        injectKitten4(); 
        decorateLikeButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    init();
}

startApp();

chrome.storage.onChanged.addListener((changes) => {
    if (changes.pickcatBgUrl || changes.pickcatMaskEnabled || changes.pickcatCursor || changes.pickcatCustomCursor || changes.pickcatHalloween) { 
        init(); 
    }
});
