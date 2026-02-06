// src/main.ts

import { Plugin, TFile, TFolder, Menu } from 'obsidian';
import { HtmlExporter } from './exporter';
import { ExportHtmlSettingTab, ExportHtmlSettings, DEFAULT_SETTINGS } from './settings';

export default class ExportHtmlPlugin extends Plugin {
    settings: ExportHtmlSettings;

    async onload() {
        console.log('Export HTML 插件已加载');

        // 加载设置
        await this.loadSettings();

        // 添加设置页面
        this.addSettingTab(new ExportHtmlSettingTab(this.app, this));

        // 1. 命令面板入口 (Ctrl/Cmd+P)
        this.addCommand({
            id: 'export-current-file',
            name: '导出当前文件为 HTML',
            checkCallback: (checking: boolean) => {
                const file = this.app.workspace.getActiveFile();
                if (file) {
                    if (!checking) new HtmlExporter(this.app, [file], this.settings).export();
                    return true;
                }
                return false;
            }
        });

        // 2. 文件列表右键菜单
        this.registerEvent(
            this.app.workspace.on("file-menu", (menu: Menu, file: any) => {
                // 只处理 markdown 文件和文件夹
                if (!(file instanceof TFolder) && !(file instanceof TFile && file.extension === 'md')) {
                    return;
                }
                menu.addItem((item) => {
                    item
                        .setTitle("导出为 HTML")
                        .setIcon("share-2")
                        .onClick(() => {
                            let filesToExport: TFile[] = [];
                            if (file instanceof TFolder) {
                                // 如果选了文件夹，导出里面所有md
                                filesToExport = this.getAllFiles(file);
                            } else if (file instanceof TFile && file.extension === 'md') {
                                filesToExport = [file];
                            }
                            if (filesToExport.length > 0) new HtmlExporter(this.app, filesToExport, this.settings).export();
                        });
                });
            })
        );

        // 3. 编辑器右键菜单
        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu, editor, view) => {
                // 确保有文件才能导出
                if (!view.file) return;
                menu.addItem((item) => {
                    item
                        .setTitle("导出为 HTML")
                        .setIcon("share-2")
                        .onClick(() => {
                            if (view.file) new HtmlExporter(this.app, [view.file], this.settings).export();
                        });
                });
            })
        );
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    getAllFiles(folder: TFolder): TFile[] {
        let files: TFile[] = [];
        for(let child of folder.children) {
            if(child instanceof TFile && child.extension === 'md') files.push(child);
            if(child instanceof TFolder) files = files.concat(this.getAllFiles(child));
        }
        return files;
    }
}
