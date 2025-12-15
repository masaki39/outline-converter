# Outline Converter

[![GitHub Release](https://img.shields.io/github/v/release/masaki39/outline-converter?sort=semver&label=latest&logo=github&color=%237c3aed)](https://github.com/masaki39/outline-converter/releases/latest) [![Total Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&query=%24%5B%22outline-converter%22%5D.downloads&label=total%20downloads&color=%237c3aed)](https://obsidian.md/plugins?id=outline-converter)

Obsidian plugin transforming your bullet point outlines into continuous text with intelligent header detection and flexible customization options.

## Installation

1. Open **Settings** → **Community plugins**
2. Disable **Restricted mode** if needed
3. Click **Browse** and search for "Outline Converter"
4. Click **Install**, then **Enable**

## Usage

Works on the current selection or the entire active note. Choose one of two commands:

### Auto-header Converter

Turns outlines into continuous text with heading promotion: items with children become headers; items without children become prose.

**Example (defaults: headings start at H2, siblings separated by line breaks)**

- Input
  ```markdown
  - Project
  	- Goals
  		- Ship v1
  	- Tasks
  		- Write docs
  		- Publish release
  ```
- Output
  ```markdown
  ## Project

  ### Goals
  Ship v1

  ### Tasks
  Write docs
  Publish release
  ```

### Custom Converter

Control text transformation at each indentation level (1–5). For each level, add text before/after the content or ignore the content entirely.

**Example (default settings: level1 before=`\n\n## `, after=`''`; level2 before=`\n\n### `, after=`\n\n`; level3 before=`''`, after=` `)**

- Input
  ```markdown
  - Features
  	- Auto-header
  		- Turn children into headers automatically.
  	- Custom converter
  		- Customize text per indentation level.
  - Usage
  	- Select text or whole note
  		- Works on selection or full note.
  	- Run command
  		- Trigger from the command palette or a hotkey.
  ```
- Output
  ```markdown
  ## Features

  ### Auto-header
  Turn children into headers automatically.

  ### Custom converter
  Customize text per indentation level.

  ## Usage

  ### Select text or whole note
  Works on selection or full note.

  ### Run command
  Trigger from the command palette or a hotkey.
  ```

> [!note]
> Lines starting with `//` (with or without space) have their content ignored, but before/after text is still applied.

### Replacement (Find & Replace)

Apply up to 5 find-and-replace operations with regex support. Replacements are processed sequentially.

**Handy preset example:**

| Purpose | Regex | Find | Replace |
|---------|-------|------|---------|
| Collapse 3+ blank lines to 2 | ✅ | `\n{3,}` | `\n\n` |
| Trim trailing spaces | ✅ | `[ \t]+$` | (empty) |
| Normalize double spaces in prose | ✅ | ` {2,}` | (single space) |
| Remove spaces before punctuation | ✅ | `\s+([.,!?])` | `$1` |

> [!important]
> - You can write placeholders in settings: `\n` (newline), `\r` (carriage return), `\t` (tab), and `\\` (backslash).
> - If you want to match the literal text `\n` in regex mode, write `\\n`. In non-regex mode, just write `\n` to search the literal backslash+n string.

### Section Insertion

Insert content from other sections in the active file using `[[#SectionName]]`. Works with both `[[#Section]]` and `![[#Section]]` formats. Useful when you keep prose outside the outline and want to pull it into the converted text.

**Example:**

- Current note
  ```markdown
  # Tasks
  Today: write docs and publish the release.

  # Outline
  - Project
  	- Tasks
  		- [[#Tasks]]
  ```
- Output
  ```markdown
  ## Project

  ### Tasks
  Today: write docs and publish the release.
  ```

### Export Methods

| Method | Description |
|--------|-------------|
| **Copy to clipboard** | Copies the result to your clipboard |
| **Append to cursor** | Inserts text at your current cursor position |
| **Append to bottom** | Adds text to the end of the active note |
| **Replace section** | Replaces a specific section (creates it if missing) |

## Additional Commands

### Fold Commands

Quickly fold all items at a specific indentation level (1-5) using the command palette.

### Swap Lines Commands

Move lines up or down. Integrates with [Outliner plugin](https://github.com/vslinko/obsidian-outliner) when available for enhanced outline manipulation.
