import * as vscode from 'vscode';
import { findMemoFiles, openMemoInSide, closePreviousMemoFiles } from './fileService';
import { isAutoOpenEnabled, isAutoCloseEnabled } from './config';

export interface MemoFile {
    name: string;
    uri: vscode.Uri;
}

export class MemoIndicatorProvider implements vscode.TreeDataProvider<MemoFile> {
    private _onDidChangeTreeData: vscode.EventEmitter<MemoFile | undefined | null | void> = new vscode.EventEmitter<MemoFile | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MemoFile | undefined | null | void> = this._onDidChangeTreeData.event;

    private memoFiles: MemoFile[] = [];
    private previousMemoFiles: vscode.Uri[] = [];

    constructor() {}

    async refresh(): Promise<void> {
        console.log('=== REFRESH CALLED ===');

        if (isAutoCloseEnabled()) {
            await closePreviousMemoFiles(this.previousMemoFiles);
        }

        this.memoFiles = await findMemoFiles();
        this.updateContext();
        this._onDidChangeTreeData.fire();

        console.log('Total memo files found:', this.memoFiles.length);

        if (this.memoFiles.length > 0 && isAutoOpenEnabled()) {
            await openMemoInSide(this.memoFiles[0].uri);
            this.previousMemoFiles = this.memoFiles.map(memo => memo.uri);
        } else {
            this.previousMemoFiles = [];
        }
    }

    getTreeItem(element: MemoFile): vscode.TreeItem {
        const item = new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.None);
        item.resourceUri = element.uri;
        item.command = {
            command: 'memoIndicator.openFile',
            title: 'Open Memo File',
            arguments: [element.uri]
        };
        item.iconPath = vscode.ThemeIcon.File;
        item.tooltip = element.uri.fsPath;
        return item;
    }

    getChildren(element?: MemoFile): Thenable<MemoFile[]> {
        if (!element) {
            return Promise.resolve(this.memoFiles);
        }
        return Promise.resolve([]);
    }

    private updateContext(): void {
        vscode.commands.executeCommand('setContext', 'memoIndicator.hasItems', this.memoFiles.length > 0);
    }

    getMemoFilesCount(): number {
        return this.memoFiles.length;
    }

    async refreshForMemoFile(): Promise<void> {
        console.log('=== REFRESH FOR MEMO FILE CALLED (No auto-close/open) ===');
        this.memoFiles = await findMemoFiles();
        this.updateContext();
        this._onDidChangeTreeData.fire();
        console.log('Total memo files found:', this.memoFiles.length);
    }
}