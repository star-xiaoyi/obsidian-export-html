// src/template.ts

export interface PageData {
    title: string;
    content: string;
    toc: { text: string; level: number; id: string }[];
}

export function getTemplate(pages: PageData[], defaultTitle: string) {
    const dataScript = `const WIKI_DATA = ${JSON.stringify(pages)};`;

    // 内嵌 SVG 图标，确保手机/离线都能显示
    const iconSun = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"></path></svg>`;
    const iconMoon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.3807 2.01886C9.91605 2.38117 8.58085 3.03458 7.42629 3.90161C6.01257 4.96443 4.94528 6.41723 4.35473 8.11307C4.16278 8.66314 4.02641 9.23194 3.94593 9.81431C3.86175 10.4227 3.84446 11.0456 3.89438 11.666C3.99368 12.9022 4.41703 14.0754 5.12726 15.0877C6.01257 16.3503 7.23485 17.3364 8.6536 17.915C9.82283 18.3916 11.084 18.5703 12.3394 18.4237C12.9234 18.3556 13.4925 18.2163 14.0378 18.0101C14.223 17.94 14.4055 17.8631 14.5849 17.7797C14.7358 17.7096 14.8841 17.6339 15.0298 17.5528C14.7828 17.5768 14.5323 17.5891 14.2797 17.5891C11.5183 17.5891 9.27972 15.3505 9.27972 12.5891C9.27972 10.4312 10.6473 8.59184 12.5645 7.79549C12.8226 7.68822 13.0906 7.60098 13.3664 7.53508C12.7214 6.07186 11.7145 4.80164 10.4369 3.85627C10.7431 3.22055 11.1643 2.63666 11.6853 2.12643C11.8315 1.98327 11.9836 1.84606 12.1412 1.71493C11.8906 1.81223 11.6378 1.91433 11.3807 2.01886ZM12.3394 18.4237C12.3394 18.4237 12.3394 18.4237 12.3394 18.4237ZM12.1412 1.71493C13.2355 3.32832 13.8447 5.25732 13.8447 7.29412C13.8447 11.3857 10.5901 14.7801 6.55152 14.9395C7.45663 17.394 9.82729 19.1471 12.607 19.1471C16.327 19.1471 19.3423 16.1318 19.3423 12.4118C19.3423 9.38769 17.3622 6.80496 14.6543 5.75336C14.0722 3.89652 12.9842 2.22384 11.5654 0.909668C11.7601 1.16972 11.9535 1.43977 12.1412 1.71493Z"></path></svg>`;

    return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${defaultTitle}</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css" rel="stylesheet" />
    <style>
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
            --scroll-thumb: #474747;
            --scroll-thumb-hover: #5a5a5a;
        }

        * { box-sizing: border-box; }
        
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: var(--scroll-track); }
        ::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--scroll-thumb-hover); }

        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; background: var(--bg-body); color: var(--text-main); height: 100vh; display: flex; overflow: hidden; transition: background 0.3s, color 0.3s; }
        
        .layout-container { display: flex; width: 100%; height: 100%; }
        
        #sidebar { width: 260px; background: var(--sidebar-bg); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 20; flex-shrink: 0; }
        .search-box { padding: 12px; }
        .search-box input { width: 100%; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border); outline: none; background: var(--bg-body); color: var(--text-main); font-size: 14px; }
        .search-box input:focus { border-color: var(--primary); }
        .file-list { flex: 1; overflow-y: auto; padding: 6px; list-style: none; margin: 0; }
        .file-item { padding: 8px 12px; margin-bottom: 2px; border-radius: 4px; cursor: pointer; color: var(--text-sec); font-size: 14px; display: flex; align-items: center; gap: 8px; transition: background 0.1s; }
        .file-item:hover { background: var(--hover-bg); color: var(--text-main); }
        .file-item.active { background: var(--hover-bg); color: var(--text-main); font-weight: 600; }

        #main-scroll { flex: 1; overflow-y: overlay; scroll-behavior: smooth; position: relative; }
        
        .article-container { max-width: 960px; margin: 0 auto; padding: 40px 120px 150px; }
        
        h1.page-title { font-size: 2.4rem; font-weight: 700; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); line-height: 1.2; margin-top: 0; }
        
        h1, h2, h3, h4, h5, h6 { 
            scroll-margin-top: 2em; 
            border-radius: 6px;
            padding: 4px 12px; 
            margin-left: -12px; 
            margin-right: -12px;
            transition: background-color 0.2s;
        }

        .highlight-target { background-color: var(--highlight-bg); }

        a { color: var(--primary); text-decoration: none; cursor: pointer; border-bottom: 1px solid transparent; transition: border 0.2s; }
        a:hover { border-bottom-color: var(--primary); }
        img { max-width: 100%; border-radius: 4px; cursor: zoom-in; display: block; margin: 1.5em auto; }
        blockquote { border-left: 3px solid var(--text-main); margin: 1.5em 0; padding-left: 1em; color: var(--text-sec); font-style: italic; }
        code { background: var(--hover-bg); padding: 3px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em; color: #eb5757; }
        [data-theme="dark"] code { color: #ff9580; }

        /* === 右侧边缘栏 (容器) === */
        /* 1. 彻底解决误触：容器本身宽度极小，仅用于定位 */
        .right-edge-bar {
            position: fixed; right: 0; top: 0; bottom: 0;
            width: 0; /* 甚至设为0，只让子元素溢出显示 */
            display: flex; flex-direction: column; align-items: flex-end; /* 靠右对齐 */
            z-index: 50;
            pointer-events: none; /* 穿透 */
        }

        /* 4. 按钮优化：圆形 + 固定定位 + 阴影 */
        .theme-toggle {
            position: fixed; /* 独立定位 */
            top: 20px; right: 20px;
            width: 36px; height: 36px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; /* 圆形 */
            cursor: pointer;
            color: var(--text-sec);
            background: var(--bg-body); /* 确保有背景 */
            box-shadow: 0 2px 8px rgba(0,0,0,0.08); /* 淡淡的阴影 */
            border: 1px solid var(--border);
            z-index: 52;
            pointer-events: auto;
            transition: transform 0.2s, background 0.2s;
        }
        .theme-toggle:hover { 
            background: var(--hover-bg); 
            color: var(--text-main); 
            transform: scale(1.05);
        }

        /* === 短线容器 (核心交互修复) === */
        .toc-trigger-container {
            /* 1. 移除 flex: 1，改为自适应高度，不再占据全屏 */
            height: auto; 
            /* 定位到屏幕大约 30% 的位置 */
            margin-top: 30vh;
            
            display: flex; flex-direction: column; 
            align-items: flex-end; 
            
            /* 距离右侧的距离 */
            padding-right: 36px;
            
            gap: 14px;
            /* 宽度限制，确保左侧不会误触 */
            width: 100px; 
            
            transition: opacity 0.2s;
            pointer-events: auto; /* 恢复点击 */
        }

        .toc-line {
            height: 2px;
            background: var(--toc-line-inactive);
            border-radius: 2px;
            transition: background-color 0.2s;
            cursor: pointer;
            width: 16px; 
        }
        
        .toc-line.level-1 { width: 24px; }
        .toc-line.level-2 { width: 18px; }
        .toc-line.level-3 { width: 14px; }
        .toc-line.level-4 { width: 10px; }
        
        .toc-line.active { background: var(--toc-line-active); }

        /* === 大纲弹窗 === */
        .toc-popover {
            position: fixed;
            right: 20px; 
            top: 30vh; 
            /* 3. 宽度调整：原来的 3/4 (约 220px) */
            width: 220px;
            
            transform: translateY(-20%) translateX(20px) scale(0.95);
            max-height: 60vh;
            
            background: var(--popover-bg);
            box-shadow: var(--popover-shadow);
            border-radius: 12px;
            padding: 8px;
            
            /* 1. 解决底部滚动条：隐藏水平溢出 */
            overflow-x: hidden;
            overflow-y: auto;
            
            opacity: 0;
            pointer-events: none;
            transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            z-index: 51;
        }

        /* 隐形桥梁：连接线和弹窗 */
        .toc-popover::after {
            content: "";
            position: absolute;
            top: 0; bottom: 0;
            right: -60px; /* 连接到右侧触发区 */
            width: 80px; 
            z-index: -1;
        }
        
        /* 触发逻辑 */
        .toc-trigger-container:hover { opacity: 0; }
        
        .toc-trigger-container:hover + .toc-popover,
        .toc-popover:hover {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(-20%) translateX(0) scale(1);
        }

        .right-edge-bar:has(.toc-popover:hover) .toc-trigger-container {
            opacity: 0;
        }

        /* === 大纲链接样式 === */
        .toc-link {
            display: block;
            padding: 8px 12px; 
            color: var(--text-sec);
            font-size: 13px;
            text-decoration: none;
            border-radius: 6px;
            margin-bottom: 2px;
            line-height: 1.5;
            
            /* 1. 解决文字溢出/滚动条：允许换行 */
            white-space: normal; 
            word-break: break-word;
            
            transition: background 0.1s, color 0.1s;
            border-bottom: none !important;
        }
        
        .toc-link.level-1 { font-weight: 600; color: var(--text-main); margin-left: 0; }
        .toc-link.level-2 { margin-left: 12px; }
        .toc-link.level-3 { margin-left: 24px; font-size: 12px; }
        .toc-link.level-4 { margin-left: 36px; font-size: 12px; }

        .toc-link:hover {
            background: var(--hover-bg);
            color: var(--text-main);
        }
        
        .toc-link.active {
            color: var(--primary);
            background: transparent;
            font-weight: 500;
        }
        
        .toc-link.active:hover {
            background: var(--hover-bg);
            color: var(--primary); 
        }

        #lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: none; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); }
        #lightbox img { max-width: 90vw; max-height: 90vh; box-shadow: none; border-radius: 0; cursor: zoom-out; }

        @media (max-width: 768px) {
            #sidebar { position: fixed; height: 100%; transform: translateX(-100%); box-shadow: 2px 0 8px rgba(0,0,0,0.1); }
            #sidebar.open { transform: translateX(0); }
            .article-container { padding: 80px 20px; }
            .right-edge-bar { display: none; }
            #mobile-menu-btn { display: flex !important; }
        }
        #mobile-menu-btn { position: fixed; top: 20px; left: 20px; z-index: 30; background: var(--bg-body); border: 1px solid var(--border); display: none; width:36px; height:36px; align-items:center; justify-content:center; border-radius:50%; box-shadow:0 2px 5px rgba(0,0,0,0.05); }
    </style>
</head>
<body>
    <div class="icon-btn" id="mobile-menu-btn" onclick="app.toggleSidebar()">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"></path></svg>
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
             <div id="theme-icon-container">${iconSun}</div>
        </div>
    </div>

    <div id="lightbox" onclick="this.style.display='none'"><img id="lightbox-img"></div>

    <script>
        ${dataScript}
        const ICONS = {
            sun: '${iconSun}',
            moon: '${iconMoon}'
        };

        const app = {
            data: WIKI_DATA,
            currentIdx: 0,
            observer: null,

            init() {
                this.renderSidebar();
                this.loadState();
                
                document.getElementById('page-content').addEventListener('click', e => {
                    if(e.target.tagName === 'IMG') {
                        document.getElementById('lightbox-img').src = e.target.src;
                        document.getElementById('lightbox').style.display = 'flex';
                    }
                });

                document.addEventListener('mousedown', (e) => {
                    if (!e.target.closest('.toc-link')) {
                        const targets = document.querySelectorAll('.highlight-target');
                        if (targets.length > 0) {
                             targets.forEach(t => t.classList.remove('highlight-target'));
                        }
                    }
                });
            },

            renderSidebar() {
                document.getElementById('file-list-ul').innerHTML = this.data.map((p, i) => 
                    \`<li class="file-item" onclick="app.loadPage(\${i})" data-idx="\${i}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M21 8V20.9932C21 21.5501 20.5552 22 20.0066 22H3.9934C3.44495 22 3 21.556 3 21.0082V2.9918C3 2.45531 3.4487 2 4.00221 2H14.9968L21 8ZM19 9H14V4H5V20H19V9ZM8 7H11V9H8V7ZM8 11H16V13H8V11ZM8 15H16V17H8V15Z"></path></svg>
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

                setTimeout(() => {
                    if(page.toc.length > 0) {
                        const firstId = page.toc[0].id;
                        this.updateActiveToc(firstId);
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
                
                linesContainer.innerHTML = toc.map(h => 
                    \`<div class="toc-line level-\${h.level}" data-target="\${h.id}"></div>\`
                ).join('');

                popoverContainer.innerHTML = toc.map(h => 
                    \`<a href="javascript:void(0)" onclick="app.scrollToHeader('\${h.id}')" class="toc-link level-\${h.level}" data-target="\${h.id}">\${h.text}</a>\`
                ).join('');
                
                this.initScrollSpy();
            },

            scrollToHeader(id) {
                document.querySelectorAll('.highlight-target').forEach(t => t.classList.remove('highlight-target'));
                const target = document.getElementById(id);
                if(target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    target.classList.add('highlight-target');
                }
            },

            updateActiveToc(id) {
                document.querySelectorAll('.toc-line.active, .toc-link.active').forEach(l => l.classList.remove('active'));
                
                const activeLine = document.querySelector(\`.toc-line[data-target="\${id}"]\`);
                const activeLink = document.querySelector(\`.toc-link[data-target="\${id}"]\`);
                
                if(activeLine) activeLine.classList.add('active');
                if(activeLink) {
                    activeLink.classList.add('active');
                    if(getComputedStyle(document.querySelector('.toc-popover')).opacity === '1') {
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
                        if (entry.isIntersecting) {
                            this.updateActiveToc(entry.target.id);
                        }
                    });
                }, { 
                    root: document.getElementById('main-scroll'), 
                    rootMargin: "-10% 0px -70% 0px",
                    threshold: 0
                });
                
                headers.forEach(h => this.observer.observe(h));
            },

            toggleTheme() {
                const html = document.documentElement;
                const isDark = html.getAttribute('data-theme') === 'dark';
                const newTheme = isDark ? 'light' : 'dark';
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('wiki_theme', newTheme);
                this.updateThemeIcon(newTheme);
            },

            updateThemeIcon(theme) {
                const container = document.getElementById('theme-icon-container');
                container.innerHTML = theme === 'dark' ? ICONS.moon : ICONS.sun;
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
            }
        };
        app.init();
    </script>
</body>
</html>`;
}