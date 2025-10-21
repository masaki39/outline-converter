import { Notice } from 'obsidian';
import { OutlineConverterSettings, LevelIndex } from './settings';

/**
 * Apply replacement methods to the content
 * @param content - The content to process
 * @param settings - Plugin settings
 * @returns Processed content
 */
export function applyReplacements(content: string, settings: OutlineConverterSettings): string {
	let result = content;

	for (let i = 1; i <= 5; i++) {
		const levelIndex = i as LevelIndex;
		if (settings.currentReplace >= i) {
			const beforeReplace = settings[`beforeReplace${levelIndex}`];
			const afterReplace = settings[`afterReplace${levelIndex}`];
			const enableRegex = settings[`enableRegex${levelIndex}`];

			try {
				if (enableRegex) {
					const regex = new RegExp(beforeReplace, 'g');
					result = result.replace(regex, afterReplace);
				} else {
					// Escape special regex characters for literal string replacement
					const escapedPattern = beforeReplace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					const regex = new RegExp(escapedPattern, 'g');
					result = result.replace(regex, afterReplace);
				}
			} catch (error) {
				new Notice(`Error in replacement ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
				throw error;
			}
		}
	}

	return result;
}

/**
 * Transform lines using custom transformers for each level
 * @param lines - Array of lines to transform
 * @param indentLevels - Array of indent levels
 * @param transformers - Array of transformer functions for each level (1-5)
 * @returns Transformed and concatenated string
 */
export function transformLines(
	lines: string[],
	indentLevels: number[],
	transformers: Array<(line: string) => string>
): string {
	const transformedLines: string[] = [];

	for (let i = 0; i < indentLevels.length; i++) {
		// Ignore lines such as frontmatter where indent level might be 0
		if (indentLevels[i] === 0) continue;

		const line = lines[i].trim().slice(2); // Remove "- " prefix
		const level = indentLevels[i];

		// Ensure the transformer exists for the given level (1-indexed)
		if (level > 0 && level <= transformers.length) {
			transformedLines.push(transformers[level - 1](line));
		}
	}

	return transformedLines.join('');
}

/**
 * Auto-header transformation
 * @param lines - Array of lines to transform
 * @param indentLevels - Array of indent levels
 * @param startHeader - Starting header level ('h1' or 'h2')
 * @param addSpace - Space to add between items at same level
 * @returns Transformed string
 */
export function autoHeaderTransform(
	lines: string[],
	indentLevels: number[],
	startHeader: string,
	addSpace: string
): string {
	const transformedLines: string[] = [];
	const addHeaderOffset = startHeader === 'h2' ? 1 : 0;

	for (let i = 0; i < indentLevels.length; i++) {
		// Ignore lines such as frontmatter where indent level might be 0
		if (indentLevels[i] === 0) continue;

		let line = lines[i].trim().slice(2); // Remove "- " prefix
		const level = indentLevels[i];
		const nextLevel = indentLevels[i + 1] ?? 0;
		const next2Level = indentLevels[i + 2] ?? 0;
		const beforeLevel = indentLevels[i - 1] ?? 0;

		// Determine if this should be a header
		if (next2Level === level + 2) {
			// Item with grandchild -> make it a header
			line = '\n\n' + '#'.repeat(level + addHeaderOffset) + ' ' + line;
			transformedLines.push(line);
		} else if (nextLevel === level + 1) {
			// Item with child -> make it a header with spacing
			line = '\n\n' + '#'.repeat(level + addHeaderOffset) + ' ' + line + '\n\n';
			transformedLines.push(line);
		} else {
			// Regular item (no children)
			if (level < beforeLevel) {
				line = '\n\n' + line;
			}
			if (nextLevel === level && next2Level <= level) {
				line = line + addSpace;
			}
			transformedLines.push(line);
		}
	}

	return transformedLines.join('');
}
