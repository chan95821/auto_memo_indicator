# Change Log

All notable changes to the "auto-memo-indicator" extension will be documented in this file.

## [0.2.1] - 2024-12-28

### Fixed
- **Memo File Auto-Close Prevention**: Fixed issue where clicking on a memo file in the sidebar would trigger auto-close of the memo file itself
- Added intelligent detection to prevent auto-close when switching to memo files
- Only non-memo files now trigger the auto-close/open behavior

### Technical Changes
- Added `isMemoFile()` function to `config.ts` for memo file detection
- Added `refreshForMemoFile()` method to `MemoIndicatorProvider` for memo-only refresh
- Modified active editor change listener to differentiate between memo and non-memo files

## [0.2.0] - 2025-07-05

### Added
- Auto-close previous memo files when switching to different files
- `autoMemoIndicator.autoClosePrevious` setting to control auto-closing behavior
- `autoMemoIndicator.keepSideLayout` setting to prevent layout shifts when closing files
- `Toggle Auto Close Previous Memo Files` command for quick toggling
- Smart tab management to close only memo file tabs
- Enhanced layout preservation options

### Changed
- Improved file switching behavior with cleaner side panel management
- Better tracking of opened memo files for precise closing
- Enhanced user experience with configurable auto-close behavior

### Fixed
- Prevented memory leaks from accumulating opened memo files
- Improved side panel layout stability

## [0.1.0] - 2025-07-04

### Added
- Multiple file extension support for memo files (.md, .txt, .note, .memo)
- Configurable custom file extensions through settings
- Automatic opening of memo files in side panel
- Settings to control auto-open behavior and focus preservation
- Real-time configuration change detection
- Enhanced file system watching for all supported extensions
- Context menu option to open memo files in side panel
- Command palette integration for toggling auto-open feature

### Features
- `autoMemoIndicator.memoFileExtensions`: Configure default memo file extensions
- `autoMemoIndicator.customExtensions`: Add custom file extensions
- `autoMemoIndicator.autoOpen`: Control automatic opening in side panel
- `autoMemoIndicator.preserveFocus`: Keep focus on current file when opening memos

### Changed
- Improved file detection algorithm for better performance
- Enhanced sidebar tree view with better messaging
- Updated README with comprehensive configuration examples

## [0.0.1] - 2025-07-04

### Added
- Initial release
- Basic markdown file detection
- Sidebar tree view integration
- File system watching for real-time updates