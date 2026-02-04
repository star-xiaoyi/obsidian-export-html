// src/exporter.ts

import { App, TFile, MarkdownRenderer, Component, Notice } from 'obsidian';
import { getTemplate, PageData } from './template';

export class HtmlExporter {
    app: App;
    files: TFile[];

    constructor(app: App, files: TFile[]) {
        this.app = app;
        this.files = files;
    }

    async export() {
        if (this.files.length === 0) { new Notice("未选择文件"); return; }
        const loadingNotice = new Notice(`正在处理 ${this.files.length} 个文件...`, 0);
        
        try {
            const pagesData: PageData[] = [];
            const container = document.body.createDiv();
            container.style.display = 'none';
            
            // 遍历处理每个文件
            for (const file of this.files) {
                const renderWrapper = container.createDiv();
                // 渲染 MD -> HTML
                await MarkdownRenderer.render(this.app, await this.app.vault.read(file), renderWrapper, file.path, new Component());

                // === 【核心修改】图片 Base64 化 (新方法) ===
                const images = renderWrapper.querySelectorAll('img');
                // 使用 Promise.all 并发处理图片，提高速度
                await Promise.all(Array.from(images).map(async (imgEl) => {
                    const img = imgEl as HTMLImageElement;
                    // Obsidian 渲染本地图片时，src 通常是 app://local/... 开头的
                    // 如果不是 http 开头，我们就尝试转换
                    if (!img.src.startsWith('http')) {
                        try {
                            // 直接 fetch 图片的 src 地址（利用 Obsidian 内部协议）
                            const response = await fetch(img.src);
                            const blob = await response.blob();
                            // 将 blob 转为 base64
                            const base64 = await this.blobToBase64(blob);
                            img.src = base64;
                        } catch (err) {
                            console.error("图片转换失败:", img.src, err);
                            // 可以在图片位置显示一个错误提示
                            img.alt = "⚠️ 图片加载失败: " + img.getAttribute('src');
                        }
                    }
                }));
                // ===========================================

                // 处理 Canvas 占位符
                renderWrapper.querySelectorAll('.internal-embed').forEach(embed => {
                     if (embed.getAttribute('src')?.endsWith('.canvas')) {
                         const div = document.createElement('div');
                         div.innerHTML = `<i class="ri-artboard-line" style="font-size:24px; display:block; margin-bottom:10px;"></i>白板文件: ${embed.getAttribute('src')} <br><span style="font-size:0.8em; opacity:0.7">(静态页面无法预览)</span>`;
                         div.style.cssText = "background:var(--hover-bg); color:var(--primary); padding:30px; text-align:center; border-radius:8px; margin:20px 0; border: 2px dashed var(--border);";
                         embed.replaceWith(div);
                     }
                });

                // 处理内部链接
                renderWrapper.querySelectorAll('a.internal-link').forEach(node => {
                    const link = node as HTMLElement;
                    const href = link.getAttribute('href');
                    const target = this.app.metadataCache.getFirstLinkpathDest(href || "", file.path);
                    const isIncluded = this.files.find(f => f === target);
                    
                    if (isIncluded && target) {
                        link.removeAttribute('href');
                        link.setAttribute('onclick', `app.navigate('${target.basename}')`);
                        link.style.cursor = 'pointer';
                    } else {
                        const span = document.createElement('span');
                        span.innerText = link.textContent || href || "";
                        span.style.opacity = "0.6";
                        span.style.textDecoration = "none"; span.style.cursor = "text"; span.style.border = "none";
                        link.replaceWith(span);
                    }
                });

                // 提取标题用于大纲
                const headers = Array.from(renderWrapper.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h, index) => {
                    // 确保每个标题都有 ID，如果没有就生成一个
                    if (!h.id) h.id = `heading-${index}-${Date.now()}`;
                    return {
                        text: h.textContent || "Untitled",
                        level: parseInt(h.tagName.substring(1)),
                        id: h.id
                    };
                });

                pagesData.push({ title: file.basename, content: renderWrapper.innerHTML, toc: headers });
            }
            container.remove();

            // 生成最终 HTML
            const defaultName = this.files[0]?.basename || "Wiki-Export";
            const htmlContent = getTemplate(pagesData, defaultName);
            loadingNotice.hide();

            // 保存文件
            // @ts-ignore
            const result = await window.electron.remote.dialog.showSaveDialog({
                title: 'Export HTML',
                defaultPath: `${defaultName}.html`,
                filters: [{ name: 'HTML Files', extensions: ['html'] }]
            });

            if (!result.canceled && result.filePath) {
                const fs = require('fs');
                fs.writeFileSync(result.filePath, htmlContent);
                new Notice(`✅ 成功导出！`);
            }

        } catch (e) {
            console.error(e);
            loadingNotice.hide();
            new Notice('❌ 导出失败，请检查控制台');
        }
    }

    // 辅助函数: Blob 转 Base64
    blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}