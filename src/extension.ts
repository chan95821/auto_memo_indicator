import * as vscode from 'vscode';
import * as path from 'path';
import { MemoIndicatorProvider } from './memoIndicatorProvider';
import * as config from './config';
import { openMemoInSide, createFileSystemWatcher } from './fileService';

export function activate(context: vscode.ExtensionContext) {
    console.log('Auto Memo Indicator extension is being activated');

    const provider = new MemoIndicatorProvider();

    const treeView = vscode.window.createTreeView('memoIndicator', {
        treeDataProvider: provider,
        showCollapseAll: false
    });

    treeView.message = 'Open a file to see related memo files';
    console.log('Tree view created');

    // Register Commands
    const refreshCommand = vscode.commands.registerCommand('memoIndicator.refresh', () => {
        console.log('Refresh command executed');
        provider.refresh();
    });

    const openFileCommand = vscode.commands.registerCommand('memoIndicator.openFile', (uri: vscode.Uri) => {
        console.log('Opening file:', uri.fsPath);
        vscode.window.showTextDocument(uri);
    });

    const toggleAutoOpenCommand = vscode.commands.registerCommand('memoIndicator.toggleAutoOpen', config.toggleAutoOpen);
    const toggleAutoCloseCommand = vscode.commands.registerCommand('memoIndicator.toggleAutoClose', config.toggleAutoClose);

    const openInSideCommand = vscode.commands.registerCommand('memoIndicator.openInSide', (item: vscode.TreeItem) => {
        if (item.resourceUri) {
            console.log('Opening file in side:', item.resourceUri.fsPath);
            openMemoInSide(item.resourceUri);
        }
    });

    // Register Event Listeners
    const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
        console.log('Active editor changed:', editor ? editor.document.fileName : 'none');
        provider.refresh();
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

    const onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration((event) => {
        if (config.affectsConfiguration(event)) {
            console.log('Auto memo indicator configuration changed, refreshing...');
            provider.refresh();
        }
    });

    // File System Watcher
    let fileWatcher = createFileSystemWatcher();
    fileWatcher.onDidCreate(() => provider.refresh());
    fileWatcher.onDidDelete(() => provider.refresh());
    fileWatcher.onDidChange(() => provider.refresh());

    context.subscriptions.push(
        treeView,
        refreshCommand,
        openFileCommand,
        toggleAutoOpenCommand,
        toggleAutoCloseCommand,
        openInSideCommand,
        onDidChangeActiveEditor,
        onDidChangeConfiguration,
        fileWatcher
    );

    // Initial refresh
    console.log('Performing initial refresh');
    provider.refresh();

    console.log('Auto Memo Indicator extension activated successfully');
}

export function deactivate() {}