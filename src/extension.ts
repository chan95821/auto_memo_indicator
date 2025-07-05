import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface MemoFile {
    name: string;
    uri: vscode.Uri;
}

class MemoIndicatorProvider implements vscode.TreeDataProvider<MemoFile> {
    private _onDidChangeTreeData: vscode.EventEmitter<MemoFile | undefined | null | void> = new vscode.EventEmitter<MemoFile | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MemoFile | undefined | null | void> = this._onDidChangeTreeData.event;

    private memoFiles: MemoFile[] = [];
    private previousMemoFiles: vscode.Uri[] = []; // 이전에 열린 메모 파일들 추적

    constructor() {
        this.refresh();
    }

    refresh(): void {
        console.log('=== REFRESH CALLED ===');
        this.findMemoFiles().then(() => {
            console.log('findMemoFiles completed, firing tree data change event');
            this._onDidChangeTreeData.fire();
        });
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
            console.log('getChildren called, returning:', this.memoFiles.length, 'items');
            console.log('Items:', this.memoFiles.map(f => f.name));
            // 파일이 없어도 빈 배열 반환하여 뷰가 표시되도록 함
            return Promise.resolve(this.memoFiles);
        }
        return Promise.resolve([]);
    }

    private async findMemoFiles(): Promise<void> {
        console.log('=== FINDING MEMO FILES ===');
        // 이전 배열 완전히 초기화
        this.memoFiles.length = 0;
        
        const activeEditor = vscode.window.activeTextEditor;
        console.log('Active editor:', activeEditor ? activeEditor.document.fileName : 'none');
        
        if (!activeEditor) {
            console.log('No active editor found');
            this.updateContext();
            return;
        }

        const currentFile = activeEditor.document.uri;
        const currentFileName = path.parse(currentFile.fsPath).name;
        console.log('Current file name:', currentFileName);
        
        if (!vscode.workspace.workspaceFolders) {
            console.log('No workspace folders found');
            this.updateContext();
            return;
        }

        // 설정에서 메모 파일 확장자 가져오기
        const config = vscode.workspace.getConfiguration('autoMemoIndicator');
        const defaultExtensions = config.get<string[]>('memoFileExtensions', ['.md', '.txt', '.note', '.memo']);
        const customExtensions = config.get<string>('customExtensions', '');
        
        // 커스텀 확장자 파싱
        const customExts = customExtensions
            .split(',')
            .map(ext => ext.trim())
            .filter(ext => ext.length > 0)
            .map(ext => ext.startsWith('.') ? ext : '.' + ext);
        
        // 모든 확장자 합치기
        const allExtensions = [...defaultExtensions, ...customExts];
        console.log('Searching for extensions:', allExtensions);

        for (const workspaceFolder of vscode.workspace.workspaceFolders) {
            // 각 확장자에 대해 검색
            for (const extension of allExtensions) {
                const memoPattern = new vscode.RelativePattern(workspaceFolder, `**/${currentFileName}${extension}`);
                console.log('Searching pattern:', memoPattern.pattern, 'in', workspaceFolder.uri.fsPath);
                const memoUris = await vscode.workspace.findFiles(memoPattern);
                console.log('Found memo files for', extension, ':', memoUris.map(uri => uri.fsPath));
                
                for (const uri of memoUris) {
                    // 현재 파일과 다른 파일이면서 이미 목록에 없는 경우에만 추가
                    if (uri.fsPath !== currentFile.fsPath && 
                        !this.memoFiles.some(memo => memo.uri.fsPath === uri.fsPath)) {
                        this.memoFiles.push({
                            name: path.basename(uri.fsPath),
                            uri: uri
                        });
                        console.log('Added memo file:', uri.fsPath);
                    }
                }
            }
        }

        console.log('=== FINAL RESULT ===');
        console.log('Total memo files found:', this.memoFiles.length);
        console.log('Memo files:', this.memoFiles.map(f => f.uri.fsPath));
        
        // 설정에 따라 이전 메모 파일들을 닫기
        const autoClosePrevious = config.get<boolean>('autoClosePrevious', true);
        if (autoClosePrevious) {
            await this.closePreviousMemoFiles();
        }
        
        // 메모 파일이 있으면 설정에 따라 첫 번째 파일을 자동으로 사이드에 열기
        const autoOpen = config.get<boolean>('autoOpen', true);
        
        if (this.memoFiles.length > 0 && autoOpen) {
            await this.openMemoInSide(this.memoFiles[0].uri);
            // 새로 열린 메모 파일들을 이전 메모 파일 목록에 저장
            this.previousMemoFiles = this.memoFiles.map(memo => memo.uri);
        } else {
            // 메모 파일이 없으면 이전 메모 파일 목록도 비우기
            this.previousMemoFiles = [];
        }
        
        this.updateContext();
    }

    private async openMemoInSide(uri: vscode.Uri): Promise<void> {
        try {
            console.log('Opening memo file in side:', uri.fsPath);
            
            const config = vscode.workspace.getConfiguration('autoMemoIndicator');
            const preserveFocus = config.get<boolean>('preserveFocus', true);
            
            // 사이드에 열기 (ViewColumn.Beside 사용)
            await vscode.window.showTextDocument(uri, {
                viewColumn: vscode.ViewColumn.Beside,
                preserveFocus: preserveFocus, // 설정에 따라 포커스 유지
                preview: false // 탭으로 고정
            });
            
            console.log('Memo file opened successfully in side panel');
        } catch (error) {
            console.error('Failed to open memo file:', error);
        }
    }

    private async closePreviousMemoFiles(): Promise<void> {
        try {
            console.log('Closing previous memo files:', this.previousMemoFiles.map(uri => uri.fsPath));
            
            const config = vscode.workspace.getConfiguration('autoMemoIndicator');
            const keepSideLayout = config.get<boolean>('keepSideLayout', false);
            
            for (const uri of this.previousMemoFiles) {
                // 현재 열린 탭들 중에서 해당 URI와 일치하는 탭 찾기
                const tabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
                const tabToClose = tabs.find(tab => {
                    if (tab.input instanceof vscode.TabInputText) {
                        return tab.input.uri.fsPath === uri.fsPath;
                    }
                    return false;
                });
                
                if (tabToClose) {
                    console.log('Closing tab for:', uri.fsPath);
                    await vscode.window.tabGroups.close(tabToClose);
                }
            }
            
            // 레이아웃 유지 옵션이 꺼져있으면 사이드 패널 레이아웃도 정리
            if (!keepSideLayout && this.previousMemoFiles.length > 0) {
                // 사이드 패널에 메모 파일만 있었다면 사이드 패널 닫기
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor && activeEditor.viewColumn === vscode.ViewColumn.One) {
                    // 메인 에디터로 포커스 이동
                    await vscode.window.showTextDocument(activeEditor.document, {
                        viewColumn: vscode.ViewColumn.One,
                        preserveFocus: false
                    });
                }
            }
            
        } catch (error) {
            console.error('Failed to close previous memo files:', error);
        }
    }

    private updateContext(): void {
        vscode.commands.executeCommand('setContext', 'memoIndicator.hasItems', this.memoFiles.length > 0);
    }

    getMemoFilesCount(): number {
        return this.memoFiles.length;
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Auto Memo Indicator extension is being activated');
    
    const provider = new MemoIndicatorProvider();
    
    // Create tree view instead of just registering provider
    const treeView = vscode.window.createTreeView('memoIndicator', {
        treeDataProvider: provider,
        showCollapseAll: false
    });
    
    // Set message when no memo files are found
    treeView.message = 'No memo files found for the current file';
    
    console.log('Tree view created');

    // Register commands
    const refreshCommand = vscode.commands.registerCommand('memoIndicator.refresh', () => {
        console.log('Refresh command executed');
        provider.refresh();
    });

    const openFileCommand = vscode.commands.registerCommand('memoIndicator.openFile', (uri: vscode.Uri) => {
        console.log('Opening file:', uri.fsPath);
        vscode.window.showTextDocument(uri);
    });

    const toggleAutoOpenCommand = vscode.commands.registerCommand('memoIndicator.toggleAutoOpen', async () => {
        const config = vscode.workspace.getConfiguration('autoMemoIndicator');
        const currentValue = config.get<boolean>('autoOpen', true);
        await config.update('autoOpen', !currentValue, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Auto open memo files: ${!currentValue ? 'Enabled' : 'Disabled'}`);
    });

    const toggleAutoCloseCommand = vscode.commands.registerCommand('memoIndicator.toggleAutoClose', async () => {
        const config = vscode.workspace.getConfiguration('autoMemoIndicator');
        const currentValue = config.get<boolean>('autoClosePrevious', true);
        await config.update('autoClosePrevious', !currentValue, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Auto close previous memo files: ${!currentValue ? 'Enabled' : 'Disabled'}`);
    });

    const openInSideCommand = vscode.commands.registerCommand('memoIndicator.openInSide', (uri: vscode.Uri) => {
        console.log('Opening file in side:', uri.fsPath);
        vscode.window.showTextDocument(uri, {
            viewColumn: vscode.ViewColumn.Beside,
            preserveFocus: true,
            preview: false
        });
    });

    // Listen for active editor changes
    const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
        console.log('Active editor changed:', editor ? editor.document.fileName : 'none');
        provider.refresh();
        // Update message based on current state
        setTimeout(() => {
            if (provider.getMemoFilesCount() === 0) {
                treeView.message = editor ? 
                    `No memo files found for "${path.parse(editor.document.fileName).name}"` : 
                    'Open a file to see related memo files';
            } else {
                treeView.message = undefined;
            }
        }, 100);
    });

    // Listen for configuration changes
    const onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('autoMemoIndicator.memoFileExtensions') || 
            event.affectsConfiguration('autoMemoIndicator.customExtensions') ||
            event.affectsConfiguration('autoMemoIndicator.autoClosePrevious') ||
            event.affectsConfiguration('autoMemoIndicator.keepSideLayout')) {
            console.log('Auto memo indicator configuration changed, refreshing...');
            provider.refresh();
        }
    });

    // Listen for file system changes
    // 설정에서 확장자 가져와서 와처 생성
    const config = vscode.workspace.getConfiguration('autoMemoIndicator');
    const defaultExtensions = config.get<string[]>('memoFileExtensions', ['.md', '.txt', '.note', '.memo']);
    const customExtensions = config.get<string>('customExtensions', '');
    
    const customExts = customExtensions
        .split(',')
        .map(ext => ext.trim())
        .filter(ext => ext.length > 0)
        .map(ext => ext.startsWith('.') ? ext : '.' + ext);
    
    const allExtensions = [...defaultExtensions, ...customExts];
    
    // 각 확장자에 대해 파일 와처 생성
    const fileWatchers: vscode.FileSystemWatcher[] = [];
    const watchers: vscode.Disposable[] = [];
    
    for (const extension of allExtensions) {
        const pattern = `**/*${extension}`;
        console.log('Creating file watcher for pattern:', pattern);
        const watcher = vscode.workspace.createFileSystemWatcher(pattern);
        
        const onCreate = watcher.onDidCreate((uri) => {
            console.log('Memo file created:', uri.fsPath);
            provider.refresh();
        });
        const onDelete = watcher.onDidDelete((uri) => {
            console.log('Memo file deleted:', uri.fsPath);
            provider.refresh();
        });
        const onChange = watcher.onDidChange((uri) => {
            console.log('Memo file changed:', uri.fsPath);
            provider.refresh();
        });
        
        fileWatchers.push(watcher);
        watchers.push(onCreate, onDelete, onChange);
    }

    context.subscriptions.push(
        treeView,
        refreshCommand,
        openFileCommand,
        toggleAutoOpenCommand,
        toggleAutoCloseCommand,
        openInSideCommand,
        onDidChangeActiveEditor,
        onDidChangeConfiguration,
        ...fileWatchers,
        ...watchers
    );

    // Initial refresh
    console.log('Performing initial refresh');
    provider.refresh();
    
    console.log('Auto Memo Indicator extension activated successfully');
}

// This method is called when your extension is deactivated
export function deactivate() {}
