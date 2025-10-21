import { App } from 'obsidian';

export class SectionExtractor {
	app: App;

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Extract section content from the active file
	 * @param sectionName - The name of the section to extract (without # prefix)
	 * @returns The content of the section with leading/trailing empty lines trimmed
	 */
	async extractSectionContent(sectionName: string): Promise<string | null> {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			return null;
		}

		const fileContent = await this.app.vault.read(activeFile);
		const lines = fileContent.split(/\r?\n/);

		let sectionStartIndex = -1;
		let sectionLevel = 0;

		// Find the section header
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const headerMatch = line.match(/^(#+)\s+(.+)$/);

			if (headerMatch) {
				const level = headerMatch[1].length;
				const title = headerMatch[2].trim();

				if (title === sectionName) {
					sectionStartIndex = i;
					sectionLevel = level;
					break;
				}
			}
		}

		// Section not found
		if (sectionStartIndex === -1) {
			return null;
		}

		// Find the end of the section (next header with same or higher level)
		let sectionEndIndex = lines.length;
		for (let i = sectionStartIndex + 1; i < lines.length; i++) {
			const line = lines[i];
			const headerMatch = line.match(/^(#+)\s+/);

			if (headerMatch) {
				const level = headerMatch[1].length;
				if (level <= sectionLevel) {
					sectionEndIndex = i;
					break;
				}
			}
		}

		// Extract section content (excluding the header itself)
		const sectionLines = lines.slice(sectionStartIndex + 1, sectionEndIndex);

		// Trim empty lines from the start
		while (sectionLines.length > 0 && sectionLines[0].trim() === '') {
			sectionLines.shift();
		}

		// Trim empty lines from the end
		while (sectionLines.length > 0 && sectionLines[sectionLines.length - 1].trim() === '') {
			sectionLines.pop();
		}

		return sectionLines.join('\n');
	}

	/**
	 * Process content and replace section link patterns with actual section content
	 * Supports both [[#Section]] and ![[#Section]] formats
	 * @param content - The content to process
	 * @returns The content with section links replaced
	 */
	async processSectionLinks(content: string): Promise<string> {
		// Match both [[#Section]] and ![[#Section]]
		const sectionLinkPattern = /!?\[\[#(.+?)\]\]/g;
		const matches = Array.from(content.matchAll(sectionLinkPattern));

		let result = content;
		for (const match of matches) {
			const fullMatch = match[0];
			const sectionName = match[1].trim();

			const sectionContent = await this.extractSectionContent(sectionName);
			if (sectionContent !== null) {
				result = result.replace(fullMatch, sectionContent);
			}
		}

		return result;
	}
}
