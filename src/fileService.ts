import * as vscode from 'vscode';
import * as path from 'path';
import { getMemoFileExtensions, shouldPreserveFocus, shouldKeepSideLayout } from './config';
import { MemoFile } from './memoIndicatorProvider';

export async function findMemoFiles(): Promise<MemoFile[]> {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return [];
    }

    const currentFile = activeEditor.document.uri;
    const currentFileName = path.parse(currentFile.fsPath).name;
    
    if (!vscode.workspace.workspaceFolders) {
        return [];
    }

    const allExtensions = getMemoFileExtensions();
    const memoFiles: MemoFile[] = [];

    for (const workspaceFolder of vscode.workspace.workspaceFolders) {
        for (const extension of allExtensions) {
            const pattern = new vscode.RelativePattern(workspaceFolder, `**/${currentFileName}${extension}`);
            const memoUris = await vscode.workspace.findFiles(pattern);
            
            for (const uri of memoUris) {
                if (uri.fsPath !== currentFile.fsPath && !memoFiles.some(memo => memo.uri.fsPath === uri.fsPath)) {
                    memoFiles.push({
                        name: path.basename(uri.fsPath),
                        uri: uri
                    });
                }
            }
        }
    }
    return memoFiles;
}

export async function openMemoInSide(uri: vscode.Uri): Promise<void> {
    try {
        await vscode.window.showTextDocument(uri, {
            viewColumn: vscode.ViewColumn.Beside,
            preserveFocus: shouldPreserveFocus(),
            preview: false
        });
    } catch (error) {
        console.error('Failed to open memo file:', error);
        vscode.window.showErrorMessage(`Failed to open memo file: ${error}`);
    }
}

export async function closePreviousMemoFiles(previousMemos: vscode.Uri[]): Promise<void> {
    if (previousMemos.length === 0) {
        return;
    }

    try {
        for (const uri of previousMemos) {
            const tabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
            const tabToClose = tabs.find(tab => 
                tab.input instanceof vscode.TabInputText && tab.input.uri.fsPath === uri.fsPath
            );
            
            if (tabToClose) {
                await vscode.window.tabGroups.close(tabToClose);
            }
        }

        if (!shouldKeepSideLayout()) {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.viewColumn === vscode.ViewColumn.One) {
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

export function createFileSystemWatcher(): vscode.FileSystemWatcher {
    const extensions = getMemoFileExtensions();
    const pattern = `**/*{${extensions.join(',')}}`;
    return vscode.workspace.createFileSystemWatcher(pattern);
}
