import { App, Editor, Notice } from 'obsidian';
import { OutlineConverterSettings, LevelIndex } from './settings';
import { OutputHandler } from './output';
import { SectionExtractor } from './sectionExtractor';
import { calculateIndentLevels, filterIgnoredLines, parseFrontmatter } from './utilis';
import {
	applyReplacements,
	transformLines,
	autoHeaderTransform,
	resolvePlaceholders,
} from './converter';

export class ConversionService {
	private readonly app: App;
	private readonly outputHandler: OutputHandler;
	private readonly sectionExtractor: SectionExtractor;

	constructor(app: App, outputHandler: OutputHandler, sectionExtractor: SectionExtractor) {
		this.app = app;
		this.outputHandler = outputHandler;
		this.sectionExtractor = sectionExtractor;
	}

	async runAutoHeader(editor: Editor, settings: OutlineConverterSettings): Promise<void> {
		try {
			const { lines, frontmatterLength } = await this.splitContent(editor);
			if (lines.length === 0) return;

			const tabSize = (this.app as any).vault.getConfig('tabSize') ?? 4;
			const indentLevels = calculateIndentLevels(lines, frontmatterLength, tabSize);
			const { filteredLines, filteredLevels } = filterIgnoredLines(lines, indentLevels);

			let result = autoHeaderTransform(
				filteredLines,
				filteredLevels,
				settings.startHeader,
				resolvePlaceholders(settings.addSpace)
			);

			result = applyReplacements(result, settings);
			result = await this.sectionExtractor.processSectionLinks(result);

			this.exportResult(editor, result, settings);
		} catch (error) {
			new Notice(`Error in auto-header converter: ${error instanceof Error ? error.message : 'Unknown error'}`);
			console.error('Auto-header converter error:', error);
		}
	}

	async runCustomConvert(editor: Editor, settings: OutlineConverterSettings): Promise<void> {
		try {
			const { lines, frontmatterLength } = await this.splitContent(editor);
			if (lines.length === 0) return;

			const tabSize = (this.app as any).vault.getConfig('tabSize') ?? 4;
			const indentLevels = calculateIndentLevels(lines, frontmatterLength, tabSize);
			const { filteredLines, filteredLevels } = filterIgnoredLines(lines, indentLevels);

			const transformers = this.createCustomTransformers(settings);
			let result = transformLines(filteredLines, filteredLevels, transformers);

			result = applyReplacements(result, settings);
			result = await this.sectionExtractor.processSectionLinks(result);

			this.exportResult(editor, result, settings);
		} catch (error) {
			new Notice(`Error in custom converter: ${error instanceof Error ? error.message : 'Unknown error'}`);
			console.error('Custom converter error:', error);
		}
	}

	private async splitContent(editor: Editor): Promise<{ lines: string[]; frontmatterLength: number }> {
		let fileContent = editor.getSelection();
		if (!fileContent) {
			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) {
				new Notice('No active file.');
				return { lines: [], frontmatterLength: 0 };
			}
			fileContent = await this.app.vault.read(activeFile);
		}

		const { frontmatter, content } = parseFrontmatter(fileContent);
		const frontmatterLines = frontmatter.split(/\r?\n/).slice(0, -1);
		const lines = [...frontmatterLines, ...content.split(/\r?\n/)];
		return { lines, frontmatterLength: frontmatterLines.length };
	}

	private createCustomTransformers(settings: OutlineConverterSettings): Array<(line: string) => string> {
		const transformers: Array<(line: string) => string> = [];

		for (let i = 1; i <= 5; i++) {
			const level = i as LevelIndex;
			const before = resolvePlaceholders(settings[`beforeText${level}`]);
			const after = resolvePlaceholders(settings[`afterText${level}`]);

			transformers.push((line: string): string => {
				if (settings[`ignoreText${level}`]) {
					return before + after;
				}
				return before + line + after;
			});
		}

		return transformers;
	}

	private exportResult(editor: Editor, result: string, settings: OutlineConverterSettings): void {
		switch (settings.exportMethod) {
			case 'Copy':
				this.outputHandler.copyContent(result);
				break;
			case 'Cursor':
				this.outputHandler.appendCursor(editor, result);
				break;
			case 'Bottom':
				this.outputHandler.appendBottom(result);
				break;
			case 'Section':
				this.outputHandler.outputToSection(editor, settings.sectionName, result);
				break;
		}
	}
}
