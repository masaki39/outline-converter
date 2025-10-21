# Obsidian Outline Converter Plugin

[![GitHub Release](https://img.shields.io/github/v/release/masaki39/outline-converter?sort=semver&label=latest&logo=github&color=%237c3aed)](https://github.com/masaki39/outline-converter/releases/latest)
[![Total Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&query=%24%5B%22outline-converter%22%5D.downloads&label=total%20downloads&color=%237c3aed)](https://obsidian.md/plugins?id=outline-converter)
[![Latest Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&query=%24%5B%22outline-converter%22%5D%5B%221.3.8%22%5D&label=latest%20downloads&color=%237c3aed)](https://github.com/masaki39/outline-converter/releases/latest)

- Obsidian Outline Converter Plugin
	- Features
		- This plugin converts bullet list outlines into continuous text.
		- You can use two commands: `Auto-header converter` & `Custom converter`
	- Installation
		- You can download from `Community plugins` in Obsidian settings.
	- Commands
		- You can choose to convert selected text, or if none is selected, all content in the active note will be accessed.
		- Auto-header converter
			- It automatically determines whether the text is a header or a sentence.
		- Custom converter
			- Customize how text is handled at each indentation level from 1 to 5.
			- Options include inserting text before or after content, ignoring content and using line breaks.
	- Replacement
		- You can search & replace terms as you like before outputting the connected sentences.
		- {{break}}
		- Double line breaks are inserted before this sentence, as I configured.
	- Insertion
		- You can use `{{i:id}}` as insert anything in the active file.
		- {{i:mermaid}}
		- `{{i:id}}` is replaced with content between `{{s:id}}` and  `{{e:id}}`.
	- Select export method 
		- Choose from the following options for exporting your text:
		- Copy to clipboard.
		- Append to the cursor's current position.
		- Append to the bottom of the active note.
		- Replace a section; if none exists, create it at the bottom of the note.
	- Other commands
		- Fold all of indentation levels 1-5.
		- Swap lines commands
			- In bullet lists, it uses line swapping commands of the Outliner plugin.
			- Outside of that, it simply swaps lines.
	- Note
		- The command of `Auto-header converter`  can convert this outline into the text below. 

{{s:mermaid}}

```mermaid
flowchart TD
OutlineList-->|convert|ContinuousText
ContinuousText-->|replacement×1-5|ReplacedText
ReplacedText-->|+insertion|Export
```

{{e:mermaid}}
# Output


## Obsidian Outline Converter Plugin

### Features

This plugin converts bullet list outlines into continuous text. You can use two commands: `Auto-header converter` & `Custom converter` 

### Installation

You can download from `Community plugins` in Obsidian settings. 

### Commands

You can choose to convert selected text, or if none is selected, all content in the active note will be accessed. 

#### Auto-header converter

It automatically determines whether the text is a header or a sentence. 

#### Custom converter

Customize how text is handled at each indentation level from 1 to 5. Options include inserting text before or after content, ignoring content and using line breaks. 

### Replacement

You can search & replace terms as you like before outputting the connected sentences. 

 Double line breaks are inserted before this sentence, as I configured. 

### Insertion

You can use `{{i:id}}` as insert anything in the active file. 

```mermaid
flowchart TD
OutlineList-->|convert|ContinuousText
ContinuousText-->|replacement×1-5|ReplacedText
ReplacedText-->|+insertion|Export
```

`{{i:id}}` is replaced with content between `{{s:id}}` and  `{{e:id}}`.

### Select export method

Choose from the following options for exporting your text: Copy to clipboard. Append to the cursor's current position. Append to the bottom of the active note. Replace a section; if none exists, create it at the bottom of the note. 

### Other commands

Fold all of indentation levels 1-5. 

#### Swap lines commands

In bullet lists, it uses line swapping commands of the Outliner plugin. Outside of that, it simply swaps lines. 

### Note

The command of `Auto-header converter`  can convert this outline into the text below. 