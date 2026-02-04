// src/template.ts

export interface PageData {
    title: string;
    content: string;
    toc: { text: string; level: number; id: string }[];
}

export function getTemplate(pages: PageData[], defaultTitle: string) {
    const dataScript = `const WIKI_DATA = ${JSON.stringify(pages)};`;

    // 1. 更换为简单的弯月图标
    const iconMoon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    
    // 太阳图标 (保持原样，加了 style="display:block" 确保居中)
    const iconSun = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

    return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${defaultTitle}</title>
    
    <script>
        (function() {
            // 资源配置表
            const RESOURCES = {
                // 代码高亮样式
                prismCss: {
                    primary: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css',
                    fallback: 'https://unpkg.com/prismjs@1.29.0/themes/prism.min.css'
                },
                // 图标库样式
                remixIcon: {
                    primary: 'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css',
                    fallback: 'https://unpkg.com/remixicon@3.5.0/fonts/remixicon.css'
                },
                // MathJax (如果Obsidian导出的公式需要渲染)
                mathJax: {
                    primary: 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js',
                    fallback: 'https://unpkg.com/mathjax@3.2.2/es5/tex-mml-chtml.js'
                }
            };

            // CSS 加载函数
            function loadCSS(config) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = config.primary;
                link.onerror = function() {
                    console.warn('主 CDN 加载失败，切换备用:', config.primary);
                    const fallbackLink = document.createElement('link');
                    fallbackLink.rel = 'stylesheet';
                    fallbackLink.href = config.fallback;
                    document.head.appendChild(fallbackLink);
                };
                document.head.appendChild(link);
            }

            // MathJax 配置
            window.MathJax = {
                tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']] },
                svg: { fontCache: 'global' },
                startup: {
                    pageReady: () => MathJax.startup.defaultPageReady()
                }
            };

            // JS 加载函数 (异步)
            function loadJS(config) {
                const script = document.createElement('script');
                script.src = config.primary;
                script.async = true;
                script.onerror = function() {
                    console.warn('脚本主 CDN 加载失败，切换备用:', config.primary);
                    const fbScript = document.createElement('script');
                    fbScript.src = config.fallback;
                    fbScript.async = true;
                    document.head.appendChild(fbScript);
                };
                document.head.appendChild(script);
            }

            // 执行加载
            loadCSS(RESOURCES.prismCss);
            loadCSS(RESOURCES.remixIcon);
            loadJS(RESOURCES.mathJax);
        })();
    </script>

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

        /* === 右侧边缘栏 === */
        .right-edge-bar {
            position: fixed; right: 0; top: 0; bottom: 0;
            width: 0; 
            display: flex; flex-direction: column; align-items: flex-end; 
            z-index: 50;
            pointer-events: none; 
        }

        /* 3. 按钮样式优化：完美居中与圆形 */
        .theme-toggle {
            position: fixed;
            top: 20px; right: 20px;
            width: 36px; height: 36px;
            /* 关键：Flex 居中 */
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%;
            cursor: pointer;
            color: var(--text-sec);
            background: transparent;
            border: none;
            box-shadow: none;
            z-index: 52;
            pointer-events: auto;
            transition: transform 0.2s, background 0.2s, color 0.2s;
            /* 关键：重置内边距和行高，防止图标偏移 */
            padding: 0;
            line-height: 0;
        }
        .theme-toggle:hover { 
            background: var(--hover-bg);
            color: var(--text-main); 
            transform: scale(1.05);
        }
        /* 确保 SVG 本身没有奇怪的间隙 */
        .theme-toggle svg {
            display: block;
        }

        /* === 短线容器 === */
        .toc-trigger-container {
            height: auto; 
            margin-top: 30vh;
            display: flex; flex-direction: column; 
            align-items: flex-end; 
            padding-right: 36px;
            gap: 14px;
            width: 100px; 
            transition: opacity 0.2s;
            pointer-events: auto; 
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
            width: 220px;
            transform: translateY(-20%) translateX(20px) scale(0.95);
            max-height: 60vh;
            background: var(--popover-bg);
            box-shadow: var(--popover-shadow);
            border-radius: 12px;
            padding: 8px;
            overflow-x: hidden;
            overflow-y: auto;
            opacity: 0;
            pointer-events: none;
            transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            z-index: 51;
        }

        .toc-popover::after {
            content: "";
            position: absolute;
            top: 0; bottom: 0;
            right: -60px; 
            width: 80px; 
            z-index: -1;
        }
        
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
                    // 重新处理一下公式渲染 (如果 MathJax 已加载)
                    if (window.MathJax && window.MathJax.typesetPromise) {
                        window.MathJax.typesetPromise([contentEl]).catch((err) => console.log(err));
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