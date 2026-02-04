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
        let skippedFiles = 0;
        let copiedFiles = 0;

        const loadingNotice = new Notice(`正在处理 ${this.files.length} 个文件...`, 0);
        
        try {
            const pagesData: PageData[] = [];
            const container = document.body.createDiv();
            container.style.display = 'none';
            
            for (const file of this.files) {
                const renderWrapper = container.createDiv();
                await MarkdownRenderer.render(this.app, await this.app.vault.read(file), renderWrapper, file.path, new Component());

                // === 1. 图片处理 ===
                const images = renderWrapper.querySelectorAll('img');
                await Promise.all(Array.from(images).map(async (img) => {
                    if (!img.src.startsWith('http')) {
                        try {
                            const response = await fetch(img.src);
                            const blob = await response.blob();
                            const base64 = await this.blobToBase64(blob);
                            if (base64) {
                                img.src = base64;
                                img.classList.add('lightbox-target');
                            }
                        } catch (e) { console.warn('图片转换失败', img.src); }
                    }
                }));

                // === 2. 附件处理 ===
                const mediaEmbeds = renderWrapper.querySelectorAll('.internal-embed');
                for (let i = 0; i < mediaEmbeds.length; i++) {
                    const embed = mediaEmbeds[i] as HTMLElement;
                    const src = embed.getAttribute('src');
                    if (!src) continue;

                    const targetFile = this.app.metadataCache.getFirstLinkpathDest(src, file.path);
                    if (!targetFile) continue;

                    const ext = targetFile.extension.toLowerCase();
                    if (['png','jpg','jpeg','gif','svg','webp','bmp'].includes(ext)) continue;

                    if (!hasAttachments) {
                        if (!fs.existsSync(assetsDirPath)) fs.mkdirSync(assetsDirPath, { recursive: true });
                        hasAttachments = true;
                    }

                    // 获取文件信息 (用于增量同步 & 显示大小)
                    const adapter = this.app.vault.adapter as FileSystemAdapter;
                    const sourcePath = adapter.getFullPath(targetFile.path);
                    const destFileName = `${targetFile.basename}.${ext}`;
                    const destPath = path.join(assetsDirPath, destFileName);
                    
                    let fileSizeStr = "Unknown size";
                    let needCopy = true;

                    try {
                        const srcStat = fs.statSync(sourcePath);
                        fileSizeStr = this.formatBytes(srcStat.size); // 获取并格式化大小

                        if (fs.existsSync(destPath)) {
                            const destStat = fs.statSync(destPath);
                            if (srcStat.mtimeMs <= destStat.mtimeMs && srcStat.size === destStat.size) {
                                needCopy = false;
                                skippedFiles++;
                            }
                        }
                        if (needCopy) {
                            fs.copyFileSync(sourcePath, destPath);
                            copiedFiles++;
                        }
                    } catch (err) { console.error("附件同步失败", err); }

                    const relativePath = `./${assetsDirName}/${encodeURIComponent(destFileName)}`;
                    const newContainer = document.createElement('div');
                    newContainer.className = 'attachment-wrapper';

                    // --- HTML 结构生成 (UI 调整) ---
                    
                    if (ext === 'pdf') {
                        // PDF: 左图标 | 右信息 (上:名 下:按钮)
                        // 按钮去除 Emoji，仅保留文字
                        newContainer.innerHTML = `
                            <div class="file-card pdf-card compact" data-src="${relativePath}">
                                <div class="file-icon">📄</div>
                                <div class="file-info">
                                    <div class="file-name">${targetFile.basename}</div>
                                    <div class="file-actions">
                                        <button class="btn-preview">预览</button>
                                        <button class="btn-open" onclick="window.open('${relativePath}', '_blank')">新窗口</button>
                                        <a href="${relativePath}" class="btn-download" download>下载</a>
                                    </div>
                                </div>
                            </div>
                            <div class="pdf-preview-container" style="display:none;"></div>
                        `;
                    } else if (['mp3', 'wav', 'm4a', 'ogg', 'flac'].includes(ext)) {
                        newContainer.innerHTML = `
                            <div class="media-container audio">
                                <audio controls src="${relativePath}"></audio>
                                <div class="media-caption">🎵 ${targetFile.basename}</div>
                            </div>`;
                    } else if (['mp4', 'webm', 'mov', 'mkv'].includes(ext)) {
                        newContainer.innerHTML = `
                            <div class="media-container video">
                                <video controls src="${relativePath}"></video>
                                <div class="media-caption">🎬 ${targetFile.basename}</div>
                            </div>`;
                    } else {
                        // 通用文件: 左图标 | 中信息 (上:名 下:大小) | 右下载图标
                        let icon = '📄';
                        if(['zip','rar','7z'].includes(ext)) icon = '📦';
                        if(['doc','docx'].includes(ext)) icon = '📝';
                        if(['xls','xlsx','csv'].includes(ext)) icon = '📊';
                        if(['ppt','pptx'].includes(ext)) icon = '📽️';
                        if(['js','py','html','css','java','cpp','c','php','json','xml','yaml'].includes(ext)) icon = '💻';

                        newContainer.innerHTML = `
                            <a href="${relativePath}" class="file-card compact" download>
                                <div class="file-icon">${icon}</div>
                                <div class="file-info">
                                    <div class="file-name">${targetFile.basename}</div>
                                    <div class="file-meta">${ext.toUpperCase()} 文件 • ${fileSizeStr}</div>
                                </div>
                                <div class="file-download-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </div>
                            </a>`;
                    }
                    embed.replaceWith(newContainer);
                }

                // 链接处理
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

                // TOC
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
            
            let msg = `导出成功`; // 纯文字提示
            if (hasAttachments) {
                msg += `\n附件同步: 新增 ${copiedFiles}, 跳过 ${skippedFiles}`;
            }
            new Notice(msg, 4000);

        } catch (e) {
            console.error(e);
            loadingNotice.hide();
            new Notice('导出失败'); // 纯文字提示
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

    formatBytes(bytes: number, decimals = 1) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}