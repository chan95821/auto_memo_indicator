# Auto Memo Indicator

A VS Code extension that automatically detects memo files with the same name as the currently active file and displays them in a sidebar tree view. Supports multiple file extensions for memo files.

## Features

- **Automatic Detection**: Automatically finds memo files that match the name of your current active file
- **Multiple Extensions**: Supports `.md`, `.txt`, `.note`, `.memo` and custom extensions
- **Configurable Extensions**: Add your own custom file extensions for memo files
- **Sidebar Integration**: Displays matching memo files in the Explorer sidebar under "Memo Files"
- **Auto Open in Side Panel**: Automatically opens memo files in a side panel when switching files
- **Real-time Updates**: Updates the list when you switch between files or when memo files are created/deleted
- **Quick Access**: Click on any memo file to open it instantly

## How it Works

1. When you open or switch to a file (e.g., `example.cpp`), the extension searches your workspace for memo files with the same name
2. Searches for files like `example.md`, `example.txt`, `example.note`, `example.memo`, etc.
3. Found memo files are displayed in the "Memo Files" section in the Explorer sidebar
4. The first memo file can automatically open in a side panel (configurable)
5. The list updates automatically when you switch files or when memo files are added/removed

## Configuration

### Extension Settings

- `autoMemoIndicator.autoOpen` (default: `true`): Automatically open the first memo file in a side panel when switching files
- `autoMemoIndicator.preserveFocus` (default: `true`): Keep focus on the current file when opening memo files
- `autoMemoIndicator.memoFileExtensions` (default: `[".md", ".txt", ".note", ".memo"]`): List of file extensions to consider as memo files
- `autoMemoIndicator.customExtensions` (default: `""`): Additional file extensions separated by commas (e.g., `.org,.rst,.adoc`)
- `autoMemoIndicator.autoClosePrevious` (default: `true`): Automatically close previous memo files when switching to a different file
- `autoMemoIndicator.keepSideLayout` (default: `false`): Keep side panel layout when closing previous memo files (prevents layout shift)

### Example Configuration

```json
{
  "autoMemoIndicator.autoOpen": true,
  "autoMemoIndicator.preserveFocus": true,
  "autoMemoIndicator.memoFileExtensions": [".md", ".txt", ".note", ".memo"],
  "autoMemoIndicator.customExtensions": ".org,.rst,.adoc,.wiki",
  "autoMemoIndicator.autoClosePrevious": true,
  "autoMemoIndicator.keepSideLayout": false
}
```

## Usage

1. Install the extension
2. Open a workspace with your code files
3. Create memo files with the same name as your code files using supported extensions:
   - `main.md` for `main.cpp`
   - `algorithm.txt` for `algorithm.py`
   - `utils.note` for `utils.js`
   - `config.memo` for `config.json`
4. The "Memo Files" section will appear in the Explorer sidebar when matching files are found
5. Click on memo files to open them, or they will auto-open in side panel (if enabled)

## Example

If you have:
- `algorithm.cpp` (currently active)
- `algorithm.md` (memo file)
- `algorithm.txt` (another memo file)
- `notes/algorithm.note` (memo file in subdirectory)
- `docs/algorithm.memo` (yet another memo file)

All these memo files will appear in the "Memo Files" section.

## Commands

- `Memo Files: Refresh` - Manually refresh the memo files list
- `Toggle Auto Open Memo Files` - Enable/disable automatic opening of memo files in side panel
- `Toggle Auto Close Previous Memo Files` - Enable/disable automatic closing of previous memo files when switching files
- `Open in Side Panel` - Open selected memo file in side panel (available in context menu)

## Supported File Extensions

**Default extensions:**
- `.md` (Markdown)
- `.txt` (Plain text)
- `.note` (Note files)
- `.memo` (Memo files)

**Custom extensions:**
You can add any custom extensions through the settings. Popular options include:
- `.org` (Org-mode files)
- `.rst` (reStructuredText)
- `.adoc` (AsciiDoc)
- `.wiki` (Wiki files)
- `.doc` (Documentation)
- `.info` (Information files)

## Requirements

- VS Code 1.101.0 or higher

## Extension Settings

This extension contributes the following settings:

- `autoMemoIndicator.autoOpen`: Enable/disable automatic opening of memo files in side panel
- `autoMemoIndicator.preserveFocus`: Keep focus on current file when opening memo files
- `autoMemoIndicator.memoFileExtensions`: Array of file extensions to consider as memo files
- `autoMemoIndicator.customExtensions`: Additional custom file extensions (comma-separated)

## Known Issues

None at this time. If you encounter any issues, please report them on the GitHub repository.

## Release Notes

### 0.0.1

Initial release of Auto Memo Indicator

- Automatic detection of matching memo files
- Support for multiple file extensions (.md, .txt, .note, .memo)
- Configurable custom file extensions
- Automatic opening in side panel
- Sidebar tree view integration
- Real-time file system watching
- Quick file opening functionality
- Configuration options for behavior customization

---

## Development

To run this extension in development mode:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Press `F5` to open a new Extension Development Host window
4. Test the extension functionality

**Enjoy!**
