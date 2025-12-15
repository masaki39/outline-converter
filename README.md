# Outline Converter

[![GitHub Release](https://img.shields.io/github/v/release/masaki39/outline-converter?sort=semver&label=latest&logo=github&color=%237c3aed)](https://github.com/masaki39/outline-converter/releases/latest) [![Total Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&query=%24%5B%22outline-converter%22%5D.downloads&label=total%20downloads&color=%237c3aed)](https://obsidian.md/plugins?id=outline-converter)

Transform your bullet point outlines into beautifully formatted continuous text with intelligent header detection and flexible customization options.

## Features

- **🤖 Auto-header Converter**: Automatically converts outlines to continuous text with intelligent header detection
- **⚙️ Custom Converter**: Full control over how each indentation level is transformed
- **🔄 Find & Replace**: Apply up to 5 find-and-replace rules with regex support
- **📝 Section Insertion**: Insert content from other sections using `[[#Section]]` syntax
- **📤 Flexible Export**: Copy to clipboard, insert at cursor, append to bottom, or replace sections
- **📁 Fold Commands**: Quickly fold/unfold specific indentation levels (1-5)
- **↕️ Enhanced Line Swapping**: Smart line swapping with Outliner plugin integration

## Installation

1. Open **Settings** → **Community plugins**
2. Disable **Restricted mode** if needed
3. Click **Browse** and search for "Outline Converter"
4. Click **Install**, then **Enable**

## Usage

The plugin operates on either selected text or the entire active note.

### Auto-header Converter

Automatically converts outlines to continuous text. Items with children become headers, items without children become regular text.

**Example:**

```markdown
- Features
	- This plugin converts outlines
	- You can use two commands
```

Becomes:

```markdown
## Features

This plugin converts outlines. You can use two commands.
```

### Custom Converter

Control text transformation at each indentation level (1-5). For each level, add text before/after content or ignore content entirely.

Lines starting with `//` (with or without space) will have their content ignored, but before/after text will still be applied.

### Replacement (Find & Replace)

Apply up to 5 find-and-replace operations with regex support. Replacements are processed sequentially.

#### Special characters in settings
- You can write placeholders in settings: `\n` (newline), `\r` (carriage return), `\t` (tab), and `\\` (backslash). They are expanded at runtime.
- Other escape sequences stay as-is, so regex tokens like `\s`, `\d`, etc. work normally.
- If you want to match the literal text `\n` in regex mode, write `\\n`. In non-regex mode, just write `\n` to search the literal backslash+n string.

### Section Insertion

Insert content from other sections using `[[#SectionName]]` syntax. Works with both `[[#Section]]` and `![[#Section]]` formats.

### Export Methods

| Method | Description |
|--------|-------------|
| **Copy to clipboard** | Copies the result to your clipboard |
| **Append to cursor** | Inserts text at your current cursor position |
| **Append to bottom** | Adds text to the end of the active note |
| **Replace section** | Replaces a specific section (creates if doesn't exist) |

## Additional Commands

### Fold Commands

Quickly fold all items at a specific indentation level (1-5) using the command palette.

### Swap Lines Commands

Move lines up or down. Integrates with [Outliner plugin](https://github.com/vslinko/obsidian-outliner) when available for enhanced outline manipulation.
