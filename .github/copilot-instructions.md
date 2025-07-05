<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Auto Memo Indicator VS Code Extension

This is a VS Code extension project. Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.

## Project Description
This extension automatically detects markdown (.md) files with the same name as the currently active file and displays them in a sidebar tree view. The purpose is to help developers quickly access documentation or notes related to their code files.

## Key Features
- Monitors active text editor changes
- Scans workspace for markdown files matching the current file name
- Displays matching markdown files in a dedicated sidebar view
- Provides quick access to related documentation

## Implementation Notes
- Uses TreeDataProvider for the sidebar view
- Implements file system watching for real-time updates
- Handles workspace file scanning efficiently
- Follows VS Code extension best practices for UI/UX
