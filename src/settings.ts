// src/settings.ts
import { App, PluginSettingTab, Setting, TFolder, Modal, Notice } from 'obsidian';
import ExportHtmlPlugin from './main';

export interface ExportHtmlSettings {
    excludedFolders: string[];
}

export const DEFAULT_SETTINGS: ExportHtmlSettings = {
    excludedFolders: []
};

// 设置页面
export class ExportHtmlSettingTab extends PluginSettingTab {
    plugin: ExportHtmlPlugin;
    excludedFoldersContainer: HTMLElement;

    constructor(app: App, plugin: ExportHtmlPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    // 渲染排除文件夹列表
    renderExcludedFolders() {
        if (!this.excludedFoldersContainer) return;
        
        this.excludedFoldersContainer.empty();
        
        this.excludedFoldersContainer.createEl('div', { 
            text: '当前排除的文件夹：', 
            cls: 'excluded-folders-title' 
        });
        
        if (this.plugin.settings.excludedFolders.length > 0) {
            const listEl = this.excludedFoldersContainer.createEl('div', { cls: 'excluded-folders-box' });
            this.plugin.settings.excludedFolders.forEach((folder, index) => {
                const item = listEl.createEl('div', { cls: 'excluded-folder-item' });
                
                const infoEl = item.createEl('div', { cls: 'folder-info' });
                infoEl.createEl('span', { 
                    text: '📁 ', 
                    cls: 'folder-icon' 
                });
                infoEl.createEl('span', { 
                    text: folder, 
                    cls: 'folder-path' 
                });
                
                // 删除按钮
                const removeBtn = item.createEl('button', {
                    cls: 'folder-remove-btn',
                    attr: { 'aria-label': '删除' }
                });
                removeBtn.innerHTML = '✕';
                removeBtn.addEventListener('click', () => {
                    this.plugin.settings.excludedFolders.splice(index, 1);
                    this.plugin.saveData(this.plugin.settings);
                    this.renderExcludedFolders();
                });
            });
        } else {
            this.excludedFoldersContainer.createEl('div', { 
                text: '（未设置排除文件夹）', 
                cls: 'excluded-folders-empty' 
            });
        }
    }

    // 刷新排除文件夹显示
    refreshExcludedFoldersDisplay() {
        this.renderExcludedFolders();
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Export HTML 设置' });

        // 排除文件夹设置
        new Setting(containerEl)
            .setName('排除文件夹')
            .setDesc('在文件选择时排除以下文件夹')
            .addButton(button => {
                button
                    .setButtonText('管理排除文件夹')
                    .setCta()
                    .onClick(() => {
                        new ExcludedFoldersModal(this.app, this.plugin.settings.excludedFolders, (folders) => {
                            this.plugin.settings.excludedFolders = folders;
                            this.plugin.saveData(this.plugin.settings);
                            // 刷新显示
                            this.refreshExcludedFoldersDisplay();
                        }).open();
                    });
            });

        // 显示当前排除的文件夹容器
        this.excludedFoldersContainer = containerEl.createEl('div', { cls: 'excluded-folders-display' });
        this.renderExcludedFolders();

        // 添加样式
        this.addDisplayStyles();
    }

    addDisplayStyles() {
        const styleId = 'excluded-folders-display-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .excluded-folders-display {
                margin-top: 20px;
                padding: 16px;
                background: var(--background-secondary);
                border-radius: 8px;
                border: 1px solid var(--background-modifier-border);
            }
            .excluded-folders-title {
                font-size: 14px;
                font-weight: 600;
                color: var(--text-normal);
                margin-bottom: 12px;
            }
            .excluded-folders-box {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .excluded-folder-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: var(--background-primary);
                border-radius: 6px;
                border: 1px solid var(--background-modifier-border);
                transition: all 0.15s;
            }
            .excluded-folder-item:hover {
                background: var(--background-modifier-hover);
                border-color: var(--interactive-accent);
            }
            .excluded-folder-item .folder-info {
                display: flex;
                align-items: center;
                flex: 1;
                overflow: hidden;
            }
            .excluded-folder-item .folder-icon {
                margin-right: 8px;
                font-size: 14px;
                flex-shrink: 0;
            }
            .excluded-folder-item .folder-path {
                font-size: 13px;
                color: var(--text-normal);
                font-family: var(--font-monospace);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .excluded-folder-item .folder-remove-btn {
                width: 20px !important;
                height: 20px !important;
                min-width: 20px !important;
                min-height: 20px !important;
                max-width: 20px !important;
                max-height: 20px !important;
                border-radius: 50% !important;
                border: none;
                background: transparent;
                color: var(--text-muted);
                cursor: pointer;
                font-size: 12px;
                line-height: 1;
                display: flex !important;
                align-items: center;
                justify-content: center;
                margin-left: 8px;
                flex-shrink: 0;
                transition: all 0.15s;
                padding: 0 !important;
                box-sizing: border-box !important;
                aspect-ratio: 1 / 1 !important;
            }
            .excluded-folder-item .folder-remove-btn:hover {
                background: var(--text-error) !important;
                color: white;
            }
            .excluded-folders-empty {
                font-size: 13px;
                color: var(--text-muted);
                font-style: italic;
                padding: 12px;
                text-align: center;
                background: var(--background-primary);
                border-radius: 6px;
                border: 1px dashed var(--background-modifier-border);
            }
        `;
        document.head.appendChild(style);
    }
}

// 排除文件夹管理弹窗
class ExcludedFoldersModal extends Modal {
    folders: string[];
    onSubmit: (folders: string[]) => void;

    constructor(app: App, folders: string[], onSubmit: (folders: string[]) => void) {
        super(app);
        this.folders = [...folders];
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass('excluded-folders-modal');

        contentEl.createEl('h3', { text: '管理排除文件夹', cls: 'modal-title' });

        const descEl = contentEl.createEl('div', { cls: 'modal-description' });
        descEl.innerHTML = '选择要在文件选择时排除的文件夹。<br>被选中的文件夹及其子文件夹中的文件将不会显示在文件列表中。';

        // 获取所有文件夹
        const allFolders = this.getAllFolders();
        
        const folderListContainer = contentEl.createDiv({ cls: 'folder-list-container' });

        allFolders.forEach(folderPath => {
            const item = folderListContainer.createDiv({ cls: 'folder-item' });
            
            const checkbox = item.createEl('input', {
                type: 'checkbox',
                cls: 'folder-checkbox'
            }) as HTMLInputElement;
            checkbox.checked = this.folders.includes(folderPath);
            checkbox.dataset.path = folderPath;

            const label = item.createEl('label', { 
                text: folderPath,
                cls: 'folder-label'
            });
            label.htmlFor = checkbox.id;

            // 点击整行切换
            item.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
                if (checkbox.checked) {
                    if (!this.folders.includes(folderPath)) {
                        this.folders.push(folderPath);
                    }
                } else {
                    this.folders = this.folders.filter(f => f !== folderPath);
                }
            });
        });

        // 按钮
        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });

        buttonContainer.createEl('button', {
            text: '取消',
            cls: 'modal-btn modal-btn-cancel'
        }).addEventListener('click', () => this.close());

        buttonContainer.createEl('button', {
            text: '保存',
            cls: 'modal-btn modal-btn-primary'
        }).addEventListener('click', () => {
            this.close();
            this.onSubmit(this.folders);
            new Notice(`已保存排除文件夹设置`);
        });

        this.addStyles();
    }

    getAllFolders(): string[] {
        const folders: string[] = [];
        const rootFolder = this.app.vault.getRoot();
        
        const traverse = (folder: TFolder, prefix: string = '') => {
            for (const child of folder.children) {
                if (child instanceof TFolder) {
                    const path = prefix ? `${prefix}/${child.name}` : child.name;
                    folders.push(path);
                    traverse(child, path);
                }
            }
        };
        
        traverse(rootFolder);
        return folders.sort();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .excluded-folders-modal {
                padding: 20px;
            }
            .excluded-folders-modal .modal-title {
                margin: 0 0 10px 0;
                font-size: 18px;
                font-weight: 600;
            }
            .excluded-folders-modal .modal-description {
                font-size: 13px;
                color: var(--text-muted);
                margin-bottom: 20px;
                line-height: 1.5;
            }
            .excluded-folders-modal .folder-list-container {
                max-height: 300px;
                overflow-y: auto;
                background: var(--background-secondary);
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 20px;
            }
            .excluded-folders-modal .folder-item {
                display: flex;
                align-items: center;
                padding: 8px 10px;
                border-radius: 6px;
                cursor: pointer;
                transition: background 0.15s;
                margin-bottom: 4px;
            }
            .excluded-folders-modal .folder-item:hover {
                background: var(--background-modifier-hover);
            }
            .excluded-folders-modal .folder-checkbox {
                margin-right: 10px;
                width: 16px;
                height: 16px;
                flex-shrink: 0;
                cursor: pointer;
            }
            .excluded-folders-modal .folder-label {
                font-size: 13px;
                color: var(--text-normal);
                cursor: pointer;
                flex: 1;
            }
            .excluded-folders-modal .modal-button-container {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            .excluded-folders-modal .modal-btn {
                padding: 6px 16px;
                border-radius: 6px;
                border: 1px solid var(--background-modifier-border);
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
            }
            .excluded-folders-modal .modal-btn-cancel {
                background: var(--background-primary);
                color: var(--text-normal);
            }
            .excluded-folders-modal .modal-btn-cancel:hover {
                background: var(--background-modifier-hover);
            }
            .excluded-folders-modal .modal-btn-primary {
                background: var(--interactive-accent);
                color: var(--text-on-accent);
                border-color: var(--interactive-accent);
            }
            .excluded-folders-modal .modal-btn-primary:hover {
                background: var(--interactive-accent-hover);
            }
        `;
        document.head.appendChild(style);
    }

    onClose() {
        this.contentEl.empty();
    }
}
