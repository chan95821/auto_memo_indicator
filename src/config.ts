import * as vscode from 'vscode';
import * as path from 'path';

const CONFIG_SECTION = 'autoMemoIndicator';

function getConfig() {
    return vscode.workspace.getConfiguration(CONFIG_SECTION);
}

export function getMemoFileExtensions(): string[] {
    const config = getConfig();
    const defaultExtensions = config.get<string[]>('memoFileExtensions', ['.md', '.txt', '.note', '.memo']);
    const customExtensions = config.get<string>('customExtensions', '');
    
    const customExts = customExtensions
        .split(',')
        .map(ext => ext.trim())
        .filter(ext => ext.length > 0)
        .map(ext => ext.startsWith('.') ? ext : '.' + ext);
    
    // Use a Set to avoid duplicates
    const allExtensions = new Set([...defaultExtensions, ...customExts]);
    return Array.from(allExtensions);
}

export function isAutoOpenEnabled(): boolean {
    return getConfig().get<boolean>('autoOpen', true);
}

export function shouldPreserveFocus(): boolean {
    return getConfig().get<boolean>('preserveFocus', true);
}

export function isAutoCloseEnabled(): boolean {
    return getConfig().get<boolean>('autoClosePrevious', true);
}

export function shouldKeepSideLayout(): boolean {
    return getConfig().get<boolean>('keepSideLayout', false);
}

export function isMemoFile(uri: vscode.Uri): boolean {
    const memoExtensions = getMemoFileExtensions();
    const fileName = uri.fsPath.toLowerCase();
    return memoExtensions.some(ext => fileName.endsWith(ext.toLowerCase()));
}

export async function toggleAutoOpen(): Promise<void> {
    const config = getConfig();
    const currentValue = config.get<boolean>('autoOpen', true);
    await config.update('autoOpen', !currentValue, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`Auto open memo files: ${!currentValue ? 'Enabled' : 'Disabled'}`);
}

export async function toggleAutoClose(): Promise<void> {
    const config = getConfig();
    const currentValue = config.get<boolean>('autoClosePrevious', true);
    await config.update('autoClosePrevious', !currentValue, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`Auto close previous memo files: ${!currentValue ? 'Enabled' : 'Disabled'}`);
}

export function affectsConfiguration(event: vscode.ConfigurationChangeEvent): boolean {
    return event.affectsConfiguration(CONFIG_SECTION);
}
