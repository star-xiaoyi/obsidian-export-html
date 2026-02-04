// src/exporter.ts
import { App, TFile, MarkdownRenderer, Component, Notice, FileSystemAdapter } from 'obsidian';
import { getTemplate, PageData } from './template';
import * as fs from 'fs';
import * as path from 'path';

export class HtmlExporter {
    app: App;
    files: TFile[];

    constructor(app: App, files: TFile[]) {
        this.app = app;
        this.files = files;
    }

    async export() {
        if (!this.files || this.files.length === 0) {
            new Notice("未选择文件");
            return;
        }
        
        // 【修复】安全获取第一个文件名
        const firstFile = this.files[0];
        const defaultName = firstFile ? firstFile.basename : "Wiki-Export";

        // @ts-ignore
        const result = await window.electron.remote.dialog.showSaveDialog({
            title: 'Export HTML',
            defaultPath: defaultName,
            filters: [{ name: 'HTML Files', extensions: ['html'] }]
        });

        if (result.canceled || !result.filePath) return;

        const savePath = result.filePath;
        const saveDir = path.dirname(savePath);
        const assetsDirName = 'assets';
        const assetsDirPath = path.join(saveDir, assetsDirName);
        
        let hasAttachments = false;
        const loadingNotice = new Notice(`正在处理 ${this.files.length} 个文件...`, 0);
        
        try {
            const pagesData: PageData[] = [];
            const container = document.body.createDiv();
            container.style.display = 'none';
            
            for (const file of this.files) {
                const renderWrapper = container.createDiv();
                await MarkdownRenderer.render(this.app, await this.app.vault.read(file), renderWrapper, file.path, new Component());

                // === 1. 图片处理 (Base64) ===
                const images = renderWrapper.querySelectorAll('img');
                await Promise.all(Array.from(images).map(async (img) => {
                    if (!img.src.startsWith('http')) {
                        try {
                            const response = await fetch(img.src);
                            const blob = await response.blob();
                            const base64 = await this.blobToBase64(blob);
                            if (base64) img.src = base64;
                        } catch (e) { console.warn('图片转换失败', img.src); }
                    }
                }));

                // === 2. 附件处理 (复制到 assets) ===
                const mediaEmbeds = renderWrapper.querySelectorAll('.internal-embed');
                for (let i = 0; i < mediaEmbeds.length; i++) {
                    const embed = mediaEmbeds[i] as HTMLElement;
                    const src = embed.getAttribute('src');
                    if (!src) continue;

                    const targetFile = this.app.metadataCache.getFirstLinkpathDest(src, file.path);
                    if (!targetFile) continue;

                    const ext = targetFile.extension.toLowerCase();
                    // 跳过图片
                    if (['png','jpg','jpeg','gif','svg','webp','bmp'].includes(ext)) continue;

                    // 初始化 assets 目录
                    if (!hasAttachments) {
                        if (!fs.existsSync(assetsDirPath)) fs.mkdirSync(assetsDirPath, { recursive: true });
                        hasAttachments = true;
                    }

                    // 复制文件
                    const adapter = this.app.vault.adapter as FileSystemAdapter;
                    const sourcePath = adapter.getFullPath(targetFile.path);
                    const destFileName = `${targetFile.basename}.${ext}`; // 扁平化文件名
                    const destPath = path.join(assetsDirPath, destFileName);
                    
                    try {
                        fs.copyFileSync(sourcePath, destPath);
                    } catch (err) {
                        console.error("复制附件失败", err);
                    }

                    // 构造相对路径
                    const relativePath = `./${assetsDirName}/${encodeURIComponent(destFileName)}`;

                    // 生成 HTML 结构
                    const newContainer = document.createElement('div');
                    newContainer.className = 'attachment-wrapper';

                    if (ext === 'pdf') {
                        newContainer.innerHTML = `
                            <embed src="${relativePath}" type="application/pdf" width="100%" height="800px" style="border-radius:8px; border:1px solid var(--border);" />
                            <div class="attachment-fallback">无法预览? <a href="${relativePath}" target="_blank">点击下载 ${src}</a></div>
                        `;
                    } else if (['mp3', 'wav', 'm4a', 'ogg', 'flac'].includes(ext)) {
                        newContainer.innerHTML = `
                            <div class="media-container audio">
                                <audio controls src="${relativePath}"></audio>
                                <div class="media-caption">🎵 ${src}</div>
                            </div>`;
                    } else if (['mp4', 'webm', 'mov', 'mkv'].includes(ext)) {
                        newContainer.innerHTML = `
                            <div class="media-container video">
                                <video controls src="${relativePath}"></video>
                                <div class="media-caption">🎬 ${src}</div>
                            </div>`;
                    } else {
                        // 通用文件卡片
                        let icon = '📄';
                        if(['zip','rar','7z'].includes(ext)) icon = '📦';
                        if(['doc','docx'].includes(ext)) icon = '📝';
                        if(['xls','xlsx','csv'].includes(ext)) icon = '📊';
                        if(['ppt','pptx'].includes(ext)) icon = '📽️';

                        newContainer.innerHTML = `
                            <a href="${relativePath}" class="file-card" download>
                                <div class="file-icon">${icon}</div>
                                <div class="file-info">
                                    <div class="file-name">${src}</div>
                                    <div class="file-meta">点击下载 • .${ext.toUpperCase()} 文件</div>
                                </div>
                                <div class="file-download-icon">↓</div>
                            </a>`;
                    }
                    embed.replaceWith(newContainer);
                }

                // === 3. 内部链接处理 ===
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
                        link.replaceWith(span);
                    }
                });

                // 提取标题
                const headers = Array.from(renderWrapper.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h, index) => {
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

            const htmlContent = getTemplate(pagesData, defaultName);
            fs.writeFileSync(savePath, htmlContent);
            
            loadingNotice.hide();
            
            let msg = `✅ 导出成功: ${path.basename(savePath)}`;
            if (hasAttachments) msg += `\n📦 附件已导出至 assets 文件夹`;
            new Notice(msg, 5000);

        } catch (e) {
            console.error(e);
            loadingNotice.hide();
            new Notice('❌ 导出失败，请检查控制台 (Ctrl+Shift+I)');
        }
    }

    blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}