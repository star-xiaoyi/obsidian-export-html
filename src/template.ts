// src/template.ts

export interface PageData {
    title: string;
    content: string;
    toc: { text: string; level: number; id: string }[];
}

export function getTemplate(pages: PageData[], defaultTitle: string) {
    const dataScript = `const WIKI_DATA = ${JSON.stringify(pages)};`;
    const isSinglePage = pages.length === 1;

    // ==========================================
    // 1. SVG 图标 (内嵌)
    // ==========================================
    const svgSun = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const svgMoon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    const svgMenu = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"></path></svg>`;
    const svgFile = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/></svg>`;
    const svgDownload = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
    const svgEye = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;

    // ==========================================
    // 2. CSS 样式
    // ==========================================
    const cssVariables = `
        :root {
            --primary: #2563eb;
            --bg-body: #ffffff;
            --text-main: #37352f;
            --text-sec: #787774;
            --border: #e5e7eb;
            --sidebar-bg: #fbfbfa;
            --hover-bg: #f3f3f3; 
            --toc-line-inactive: #e0e0e0;
            --toc-line-active: #37352f;
            --popover-bg: #ffffff;
            --popover-shadow: rgba(15, 15, 15, 0.04) 0px 0px 0px 1px, rgba(15, 15, 15, 0.08) 0px 4px 12px, rgba(15, 15, 15, 0.1) 0px 12px 32px;
            --highlight-bg: rgba(37, 99, 235, 0.15);
            --card-bg: #ffffff;
            --card-border: #e0e0e0;
            --radius-md: 10px;
            
            --scroll-track: transparent;
            --scroll-thumb: #d3d1cb;
            --scroll-thumb-hover: #aeaca6;
        }
        [data-theme="dark"] {
            --primary: #60a5fa;
            --bg-body: #191919;
            --text-main: #d4d4d4;
            --text-sec: #9b9b9b;
            --border: #2f2f2f;
            --sidebar-bg: #202020;
            --hover-bg: #2c2c2c;
            --toc-line-inactive: #3f3f3f;
            --toc-line-active: #d4d4d4;
            --popover-bg: #252525;
            --popover-shadow: rgba(0, 0, 0, 0.6) 0px 0px 0px 1px, rgba(0, 0, 0, 0.7) 0px 4px 12px, rgba(0, 0, 0, 0.8) 0px 12px 32px;
            --highlight-bg: rgba(96, 165, 250, 0.2);
            --card-bg: #2a2a2a;
            --card-border: #444;
            --scroll-thumb: #474747;
            --scroll-thumb-hover: #5a5a5a;
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: var(--scroll-track); }
        ::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--scroll-thumb-hover); }
    `;

    const cssLayout = `
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; background: var(--bg-body); color: var(--text-main); height: 100vh; display: flex; overflow: hidden; transition: background 0.3s, color 0.3s; }
        .layout-container { display: flex; width: 100%; height: 100%; position: relative; }

        #sidebar { width: 260px; background: var(--sidebar-bg); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 60; flex-shrink: 0; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .search-box { padding: 12px; }
        .search-box input { width: 100%; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border); outline: none; background: var(--bg-body); color: var(--text-main); font-size: 14px; }
        .search-box input:focus { border-color: var(--primary); }
        .file-list { flex: 1; overflow-y: auto; padding: 6px; list-style: none; margin: 0; }
        .file-item { padding: 8px 12px; margin-bottom: 2px; border-radius: 4px; cursor: pointer; color: var(--text-sec); font-size: 14px; display: flex; align-items: center; gap: 8px; transition: background 0.1s; }
        .file-item:hover { background: var(--hover-bg); color: var(--text-main); }
        .file-item.active { background: var(--hover-bg); color: var(--text-main); font-weight: 600; }

        #main-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; position: relative; -webkit-overflow-scrolling: touch; }
        .article-container { max-width: 960px; margin: 0 auto; padding: 40px 120px 150px; transition: padding 0.3s; }
        
        h1.page-title { font-size: 2.4rem; font-weight: 700; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); line-height: 1.2; margin-top: 0; }
        h1, h2, h3, h4, h5, h6 { scroll-margin-top: 2em; border-radius: 6px; padding: 4px 12px; margin-left: -12px; margin-right: -12px; transition: background-color 0.2s; }
        .highlight-target { background-color: var(--highlight-bg); }

        a { color: var(--primary); text-decoration: none; cursor: pointer; border-bottom: 1px solid transparent; transition: border 0.2s; }
        a:hover { border-bottom-color: var(--primary); }
        img { max-width: 100%; border-radius: 4px; cursor: zoom-in; display: block; margin: 1.5em auto; }
        blockquote { border-left: 3px solid var(--text-main); margin: 1.5em 0; padding-left: 1em; color: var(--text-sec); font-style: italic; }
        code { background: var(--hover-bg); padding: 3px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em; color: #eb5757; }
        [data-theme="dark"] code { color: #ff9580; }
    `;

    const cssAttachments = `
        /* === 文件卡片 (UI 2.0) === */
        .file-card {
            display: flex; flex-direction: row; /* 横向布局 */
            align-items: center;
            background: var(--card-bg); border: 1px solid var(--card-border);
            border-radius: var(--radius-md); 
            padding: 10px 14px; 
            margin: 20px auto; 
            width: 320px; max-width: 100%;
            text-decoration: none !important; transition: all 0.2s; cursor: pointer;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03); user-select: none;
        }
        .file-card:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); transform: translateY(-1px); }
        
        /* 图标区 */
        .file-card .file-icon { 
            font-size: 24px; color: var(--text-sec); 
            margin-right: 14px; display: flex; align-items: center; justify-content: center;
        }
        
        /* 信息区 (右侧主体) */
        .file-card .file-info { 
            flex: 1; min-width: 0; 
            display: flex; flex-direction: column; justify-content: center; 
        }
        
        /* 文件名 (上) */
        .file-card .file-name { 
            font-weight: 600; /* 加粗 */
            font-size: 14px; 
            color: var(--text-main); 
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; 
            line-height: 1.4;
        }
        
        /* 元数据或按钮区 (下) */
        .file-card .file-meta { 
            font-size: 11px; color: var(--text-sec); margin-top: 2px; 
            display: flex; align-items: center;
        }
        
        /* PDF 按钮组 (位于信息区下方) */
        .file-card .file-actions { 
            display: flex; gap: 8px; margin-top: 4px; 
        }
        .file-card button, .file-card .btn-download {
            background: transparent; 
            border: 1px solid var(--border); 
            border-radius: 4px;
            color: var(--text-sec); font-size: 11px; 
            padding: 2px 8px; line-height: 1.4;
            cursor: pointer; transition: all 0.1s;
            text-decoration: none !important;
            flex: 1; /* 均匀分布 */
            text-align: center;
        }
        .file-card button:hover, .file-card .btn-download:hover { 
            background: var(--hover-bg); color: var(--text-main); border-color: var(--text-sec); 
        }

        /* 通用文件下载图标 (最右侧) */
        .file-download-icon { 
            color: var(--text-sec); opacity: 0.6; margin-left: 12px; 
            display: flex; align-items: center;
        }
        .file-card:hover .file-download-icon { opacity: 1; color: var(--primary); }

        /* 媒体播放器 */
        .media-container { 
            display: flex; flex-direction: column; align-items: center; 
            margin: 30px auto; width: 100%; max-width: 600px;
            background: var(--card-bg); padding: 16px; 
            border-radius: var(--radius-md); border: 1px solid var(--card-border);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        audio, video { width: 100%; outline: none; border-radius: 6px; }
        .media-caption { margin-top: 8px; font-size: 12px; color: var(--text-sec); text-align: center; }

        /* PDF 预览 */
        .pdf-preview-container embed {
            display: block; width: 100%; height: 800px;
            border-radius: var(--radius-md); border: 1px solid var(--border);
            margin-top: 10px; background: #fff;
        }
        .pdf-preview-container.active { display: block !important; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    `;

    const cssUI = `
        /* === 1. 右侧边缘栏 (核心修复) === */
        .right-edge-bar { 
            position: fixed; right: 0; top: 0; bottom: 0; 
            width: 24px; /* 窄条触发区 */
            display: flex; flex-direction: column; align-items: flex-end; 
            z-index: 50; 
            pointer-events: auto; /* 允许点击触发 */
        }
        
        /* 隐形底盘主题按钮 */
        .theme-toggle { 
            position: fixed; top: 20px; right: 20px; 
            width: 36px; height: 36px; 
            display: flex; align-items: center; justify-content: center; 
            border-radius: 50%; cursor: pointer; 
            color: var(--text-sec); background: transparent; 
            border: none; padding: 0; line-height: 0;
            z-index: 52; pointer-events: auto; 
            transition: all 0.2s; 
        }
        .theme-toggle:hover { background: var(--hover-bg); color: var(--text-main); transform: scale(1.05); }
        .theme-toggle svg { display: block; }

        /* 大纲 Trigger */
        .toc-trigger-container { 
            height: auto; margin-top: 30vh; 
            display: flex; flex-direction: column; align-items: flex-end; 
            padding-right: 36px; gap: 14px; width: 100px; 
            transition: opacity 0.2s; pointer-events: auto; 
        }
        .toc-line { height: 2px; background: var(--toc-line-inactive); border-radius: 2px; transition: background-color 0.2s; cursor: pointer; width: 16px; }
        .toc-line.level-1 { width: 24px; } .toc-line.level-2 { width: 18px; } .toc-line.level-3 { width: 14px; } .toc-line.level-4 { width: 10px; }
        .toc-line.active { background: var(--toc-line-active); }

        /* 大纲 Popover */
        .toc-popover { 
            position: fixed; right: 20px; top: 30vh; 
            width: 220px; transform: translateY(-20%) translateX(20px) scale(0.95); 
            max-height: 60vh; background: var(--popover-bg); 
            box-shadow: var(--popover-shadow); border-radius: var(--radius-md); padding: 8px; 
            overflow-x: hidden; overflow-y: auto; opacity: 0; 
            pointer-events: none; transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94); 
            z-index: 51; 
        }
        .toc-popover::after { content: ""; position: absolute; top: 0; bottom: 0; right: -60px; width: 80px; z-index: -1; }
        
        /* 交互逻辑 */
        .toc-trigger-container:hover { opacity: 0; }
        .toc-trigger-container:hover + .toc-popover, .toc-popover:hover { opacity: 1; pointer-events: auto; transform: translateY(-20%) translateX(0) scale(1); }
        .right-edge-bar:has(.toc-popover:hover) .toc-trigger-container { opacity: 0; }

        .toc-link { 
            display: block; padding: 8px 12px; color: var(--text-sec); 
            font-size: 13px; text-decoration: none; border-radius: 6px; 
            margin-bottom: 2px; line-height: 1.5; white-space: normal; 
            word-break: break-word; transition: background 0.1s, color 0.1s; 
            border-bottom: none !important; 
        }
        .toc-link.level-1 { font-weight: 600; color: var(--text-main); margin-left: 0; } 
        .toc-link.level-2 { margin-left: 12px; } .toc-link.level-3 { margin-left: 24px; font-size: 12px; } .toc-link.level-4 { margin-left: 36px; font-size: 12px; }
        .toc-link:hover { background: var(--hover-bg); color: var(--text-main); }
        .toc-link.active { color: var(--primary); background: transparent; font-weight: 500; }
        .toc-link.active:hover { background: var(--hover-bg); color: var(--primary); }

        /* 灯箱 */
        #lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: none; align-items: center; justify-content: center; z-index: 1000; overflow: hidden; }
        #lightbox img { max-width: 90vw; max-height: 90vh; box-shadow: none; border-radius: 4px; cursor: grab; transition: transform 0.1s ease-out; transform-origin: center; will-change: transform; }
        #lightbox img:active { cursor: grabbing; }

        /* === 移动端适配 === */
        #mobile-menu-btn { display: none; }

        @media (max-width: 768px) {
            #sidebar { position: fixed; height: 100%; transform: translateX(-100%); box-shadow: 4px 0 12px rgba(0,0,0,0.1); }
            #sidebar.open { transform: translateX(0); }
            
            /* 1. 恢复右侧边栏显示，并优化点击 */
            .right-edge-bar { display: flex !important; width: 30px; }
            /* 将触发区稍微调大一点点方便点击 */
            .toc-trigger-container { padding-right: 10px; width: 40px; }
            
            .article-container { padding: 80px 24px; }

            /* 2. 单页面隐藏左上角按钮 */
            #mobile-menu-btn { 
                position: fixed; top: 16px; left: 16px; 
                display: ${isSinglePage ? 'none' : 'flex'}; 
                align-items: center; justify-content: center;
                background: var(--bg-body); border: 1px solid var(--border);
                width: 40px; height: 40px; border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 90;
                color: var(--text-sec); cursor: pointer;
            }
            
            /* 移动端大纲激活状态 */
            .toc-popover.mobile-active {
                opacity: 1; pointer-events: auto;
                position: fixed !important; right: 40px !important; top: 20vh !important;
                z-index: 100; transform: scale(1) !important;
                border: 1px solid var(--border); box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            }
            .theme-toggle { top: 16px; right: 16px; }
        }
    `;

    return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${defaultTitle}</title>
    <script>
        (function() {
            const RESOURCES = {
                prismCss: { primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css', fallback: 'https://unpkg.com/prismjs@1.29.0/themes/prism.min.css' },
                mathJax: { primary: 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js', fallback: 'https://unpkg.com/mathjax@3.2.2/es5/tex-mml-chtml.js' }
            };
            function loadCSS(config) {
                const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = config.primary;
                link.onerror = function() { const fl = document.createElement('link'); fl.rel = 'stylesheet'; fl.href = config.fallback; document.head.appendChild(fl); };
                document.head.appendChild(link);
            }
            function loadJS(config) {
                const script = document.createElement('script'); script.src = config.primary; script.async = true;
                script.onerror = function() { const fs = document.createElement('script'); fs.src = config.fallback; fs.async = true; document.head.appendChild(fs); };
                document.head.appendChild(script);
            }
            window.MathJax = { tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']] }, svg: { fontCache: 'global' }, startup: { pageReady: () => MathJax.startup.defaultPageReady() } };
            loadCSS(RESOURCES.prismCss);
            loadJS(RESOURCES.mathJax);
        })();
    </script>
    <style>
        ${cssVariables}
        ${cssLayout}
        ${cssAttachments}
        ${cssUI}
    </style>
</head>
<body>
    <div id="mobile-menu-btn" onclick="app.toggleSidebar()">
        ${svgMenu}
    </div>

    <div class="layout-container">
        <aside id="sidebar" style="${pages.length === 1 ? 'display:none' : ''}">
            <div class="search-box">
                <input type="text" placeholder="搜索文档..." oninput="app.filter(this.value)">
            </div>
            <ul class="file-list" id="file-list-ul"></ul>
        </aside>

        <main id="main-scroll">
            <div class="article-container">
                <h1 id="page-title" class="page-title"></h1>
                <div id="page-content"></div>
                <div style="margin-top: 80px; border-top: 1px solid var(--border); padding-top: 30px; text-align: center; color: var(--text-sec); font-size: 0.85em;">
                    Generated by Export HTML
                </div>
            </div>
        </main>

        <div class="right-edge-bar">
            <div class="toc-trigger-container" id="toc-lines"></div>
            <nav class="toc-popover" id="toc-popover-list"></nav>
        </div>
        
        <div class="theme-toggle" onclick="app.toggleTheme()" title="切换主题">
             <div id="theme-icon-container">${svgSun}</div>
        </div>
    </div>

    <div id="lightbox" onclick="app.closeLightbox(event)">
        <img id="lightbox-img">
    </div>

    <script>
        ${dataScript}
        const ICONS = { sun: '${svgSun}', moon: '${svgMoon}' };

        const app = {
            data: WIKI_DATA,
            currentIdx: 0,
            observer: null,
            lightboxState: { scale: 1, isDragging: false, startX: 0, startY: 0, translateX: 0, translateY: 0 },
            isMobileTocOpen: false,

            init() {
                this.renderSidebar();
                this.loadState();
                
                // 1. 右侧大纲点击逻辑 (兼容移动端)
                const tocContainer = document.querySelector('.toc-trigger-container');
                if (tocContainer) {
                    tocContainer.addEventListener('click', (e) => {
                        if (window.innerWidth <= 768) {
                            this.toggleMobileToc(!this.isMobileTocOpen);
                            e.stopPropagation(); // 防止冒泡
                        }
                    });
                }

                // 全局图片点击
                document.getElementById('page-content').addEventListener('click', e => {
                    if(e.target.tagName === 'IMG') {
                        this.openLightbox(e.target.src);
                    }
                });

                // PDF 按钮逻辑
                document.getElementById('page-content').addEventListener('click', e => {
                    if(e.target.classList.contains('btn-preview')) {
                        const card = e.target.closest('.file-card');
                        const wrapper = card.nextElementSibling;
                        if(wrapper && wrapper.classList.contains('pdf-preview-container')) {
                            if(wrapper.innerHTML === '') {
                                const src = card.dataset.src;
                                wrapper.innerHTML = \`<embed src="\${src}" type="application/pdf" />\`;
                                wrapper.classList.add('active');
                                e.target.innerText = '收起';
                            } else {
                                if(wrapper.classList.contains('active')) {
                                    wrapper.classList.remove('active');
                                    e.target.innerText = '预览';
                                } else {
                                    wrapper.classList.add('active');
                                    e.target.innerText = '收起';
                                }
                            }
                        }
                    }
                });

                // 2. 下载确认逻辑
                document.getElementById('page-content').addEventListener('click', e => {
                    // 查找是否点击了下载链接 (包含通用卡片本身 或 PDF的下载按钮)
                    const downloadLink = e.target.closest('a[download]') || e.target.closest('.btn-download');
                    if (downloadLink) {
                        e.preventDefault(); // 阻止默认下载
                        
                        // 获取文件名
                        let fileName = 'file';
                        const card = downloadLink.closest('.file-card');
                        if (card) {
                            const nameEl = card.querySelector('.file-name');
                            if (nameEl) fileName = nameEl.innerText;
                        }

                        if (confirm(\`确认下载文件: \${fileName}?\`)) {
                            // 手动触发下载
                            const href = downloadLink.getAttribute('href');
                            const a = document.createElement('a');
                            a.href = href;
                            a.download = '';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }
                    }
                });

                // 点击空白处关闭移动端大纲 & 取消高亮
                document.addEventListener('mousedown', (e) => {
                    const popover = document.getElementById('toc-popover-list');
                    const trigger = document.querySelector('.toc-trigger-container');
                    
                    if (this.isMobileTocOpen && !popover.contains(e.target) && !trigger.contains(e.target)) {
                        this.toggleMobileToc(false);
                    }

                    if (!e.target.closest('.toc-link')) {
                        const targets = document.querySelectorAll('.highlight-target');
                        if (targets.length > 0) targets.forEach(t => t.classList.remove('highlight-target'));
                    }
                });

                this.setupLightboxEvents();
            },

            toggleMobileToc(show) {
                const popover = document.getElementById('toc-popover-list');
                this.isMobileTocOpen = show;
                if (show) {
                    popover.classList.add('mobile-active');
                } else {
                    popover.classList.remove('mobile-active');
                }
            },

            renderSidebar() {
                document.getElementById('file-list-ul').innerHTML = this.data.map((p, i) => 
                    \`<li class="file-item" onclick="app.loadPage(\${i})" data-idx="\${i}">
                        ${svgFile}
                        <span>\${p.title}</span>
                    </li>\`
                ).join('');
            },

            loadPage(idx) {
                this.currentIdx = idx;
                const page = this.data[idx];
                document.getElementById('page-title').innerText = page.title;
                const contentEl = document.getElementById('page-content');
                contentEl.innerHTML = page.content;
                
                document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
                document.querySelector(\`.file-item[data-idx="\${idx}"]\`)?.classList.add('active');
                
                this.renderToc(page.toc);
                document.getElementById('main-scroll').scrollTop = 0;
                localStorage.setItem('wiki_last_idx', idx);
                
                if (window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.remove('open');
                    this.toggleMobileToc(false);
                }

                setTimeout(() => {
                    if(page.toc.length > 0) this.updateActiveToc(page.toc[0].id);
                    if (window.MathJax && window.MathJax.typesetPromise) {
                        window.MathJax.typesetPromise([contentEl]).catch(err => console.log(err));
                    }
                }, 100);
            },

            renderToc(toc) {
                const linesContainer = document.getElementById('toc-lines');
                const popoverContainer = document.getElementById('toc-popover-list');
                
                if(!toc || !toc.length) {
                    linesContainer.innerHTML = '';
                    popoverContainer.innerHTML = '<div style="padding:10px;color:var(--text-sec);font-size:12px;text-align:center">暂无目录</div>';
                    return;
                }
                
                linesContainer.innerHTML = toc.map(h => \`<div class="toc-line level-\${h.level}" data-target="\${h.id}"></div>\`).join('');
                popoverContainer.innerHTML = toc.map(h => \`<a href="javascript:void(0)" onclick="app.scrollToHeader('\${h.id}')" class="toc-link level-\${h.level}" data-target="\${h.id}">\${h.text}</a>\`).join('');
                this.initScrollSpy();
            },

            scrollToHeader(id) {
                document.querySelectorAll('.highlight-target').forEach(t => t.classList.remove('highlight-target'));
                const target = document.getElementById(id);
                if(target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    target.classList.add('highlight-target');
                    
                    if (this.isMobileTocOpen) {
                        this.toggleMobileToc(false);
                    }
                }
            },

            updateActiveToc(id) {
                document.querySelectorAll('.toc-line.active, .toc-link.active').forEach(l => l.classList.remove('active'));
                const activeLine = document.querySelector(\`.toc-line[data-target="\${id}"]\`);
                const activeLink = document.querySelector(\`.toc-link[data-target="\${id}"]\`);
                if(activeLine) activeLine.classList.add('active');
                if(activeLink) {
                    activeLink.classList.add('active');
                    if(window.innerWidth > 768 && getComputedStyle(document.querySelector('.toc-popover')).opacity === '1') {
                        activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            },

            initScrollSpy() {
                if(this.observer) this.observer.disconnect();
                const headers = document.querySelectorAll('#page-content h1, #page-content h2, #page-content h3, #page-content h4, #page-content h5, #page-content h6');
                if(headers.length === 0) return;
                this.observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) this.updateActiveToc(entry.target.id);
                    });
                }, { root: document.getElementById('main-scroll'), rootMargin: "-10% 0px -70% 0px", threshold: 0 });
                headers.forEach(h => this.observer.observe(h));
            },

            toggleTheme() {
                const html = document.documentElement;
                const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('wiki_theme', newTheme);
                this.updateThemeIcon(newTheme);
            },

            updateThemeIcon(theme) {
                document.getElementById('theme-icon-container').innerHTML = theme === 'dark' ? ICONS.moon : ICONS.sun;
            },

            loadState() {
                const theme = localStorage.getItem('wiki_theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
                this.updateThemeIcon(theme);
                const lastIdx = localStorage.getItem('wiki_last_idx');
                this.loadPage(lastIdx ? parseInt(lastIdx) : 0);
            },
            
            filter(val) {
                document.querySelectorAll('.file-item').forEach(item => {
                    const idx = item.getAttribute('data-idx');
                    item.style.display = this.data[idx].title.toLowerCase().includes(val.toLowerCase()) ? 'flex' : 'none';
                });
            },

            toggleSidebar() {
                document.getElementById('sidebar').classList.toggle('open');
            },

            setupLightboxEvents() {
                const img = document.getElementById('lightbox-img');
                const lb = document.getElementById('lightbox');
                lb.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? 0.9 : 1.1;
                    let newScale = this.lightboxState.scale * delta;
                    newScale = Math.min(Math.max(0.5, newScale), 5);
                    this.lightboxState.scale = newScale;
                    this.updateLightboxTransform();
                });
                img.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.lightboxState.isDragging = true;
                    this.lightboxState.startX = e.clientX - this.lightboxState.translateX;
                    this.lightboxState.startY = e.clientY - this.lightboxState.translateY;
                });
                window.addEventListener('mousemove', (e) => {
                    if (!this.lightboxState.isDragging) return;
                    this.lightboxState.translateX = e.clientX - this.lightboxState.startX;
                    this.lightboxState.translateY = e.clientY - this.lightboxState.startY;
                    this.updateLightboxTransform();
                });
                window.addEventListener('mouseup', () => { this.lightboxState.isDragging = false; });
            },
            updateLightboxTransform() {
                const img = document.getElementById('lightbox-img');
                img.style.transform = \`translate(\${this.lightboxState.translateX}px, \${this.lightboxState.translateY}px) scale(\${this.lightboxState.scale})\`;
            },
            openLightbox(src) {
                const lb = document.getElementById('lightbox');
                const img = document.getElementById('lightbox-img');
                img.src = src;
                lb.style.display = 'flex';
                this.lightboxState = { scale: 1, isDragging: false, startX: 0, startY: 0, translateX: 0, translateY: 0 };
                this.updateLightboxTransform();
            },
            closeLightbox(e) {
                if (e.target.id === 'lightbox') { e.target.style.display = 'none'; }
            }
        };
        app.init();
    </script>
</body>
</html>`;
}