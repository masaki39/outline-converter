import { Editor, Notice, Plugin } from 'obsidian';
import { IndentFold } from './src/indentFold';
import { OutlineConverterSettings, DEFAULT_SETTINGS, OutlineConverterSettingTab } from './src/settings';
import { OutputHandler } from './src/output';
import { SectionExtractor } from './src/sectionExtractor';
import { calculateIndentLevels, filterIgnoredLines } from './src/utilis';
import { applyReplacements, transformLines, autoHeaderTransform, resolvePlaceholders } from './src/converter';

export default class OutlineConverter extends Plugin {
	settings: OutlineConverterSettings;
	private foldLevel: IndentFold;
	private outputHandler: OutputHandler;
	private sectionExtractor: SectionExtractor;

	async onload() {
		await this.loadSettings();

		// initialization
		this.foldLevel = new IndentFold(this);
		this.outputHandler = new OutputHandler(this.app);
		this.sectionExtractor = new SectionExtractor(this.app);

		// loading
		await this.foldLevel.onload();
		
		// auto-header converter
		this.addCommand({
			id: 'auto-header',
			name: 'Auto-header converter',
			editorCallback: async (editor: Editor) => {
				try {
					// get lines
					const { lines, frontmatterLength } = await this.splitContent(editor);
					if (lines.length === 0) return;

					// get indent levels list
					const tabSize = (this.app as any).vault.getConfig("tabSize") ?? 4;
					let indentLevels = calculateIndentLevels(lines, frontmatterLength, tabSize);

					// filter ignored lines
					const { filteredLines, filteredLevels } = filterIgnoredLines(lines, indentLevels);

					// transform & connect
					let result = autoHeaderTransform(
						filteredLines,
						filteredLevels,
						this.settings.startHeader,
						resolvePlaceholders(this.settings.addSpace)
					);

					// apply replacement methods
					result = applyReplacements(result, this.settings);

					// process section links
					result = await this.sectionExtractor.processSectionLinks(result);

					// export
					this.exportResult(editor, result);
				} catch (error) {
					new Notice(`Error in auto-header converter: ${error instanceof Error ? error.message : 'Unknown error'}`);
					console.error('Auto-header converter error:', error);
				}
			}
		});
		
		// custom command
		this.addCommand({
			id: 'custom-convert',
			name: 'Custom converter',
			editorCallback: async (editor: Editor) => {
				try {
					// get lines
					const { lines, frontmatterLength } = await this.splitContent(editor);
					if (lines.length === 0) return;

					// get indent levels list
					const tabSize = (this.app as any).vault.getConfig("tabSize") ?? 4;
					let indentLevels = calculateIndentLevels(lines, frontmatterLength, tabSize);

					// filter ignored lines
					const { filteredLines, filteredLevels } = filterIgnoredLines(lines, indentLevels);

					// create custom transformers
					const transformers = this.createCustomTransformers();

					// transform & connect
					let result = transformLines(filteredLines, filteredLevels, transformers);

					// apply replacement methods
					result = applyReplacements(result, this.settings);

					// process section links
					result = await this.sectionExtractor.processSectionLinks(result);

					// export
					this.exportResult(editor, result);
				} catch (error) {
					new Notice(`Error in custom converter: ${error instanceof Error ? error.message : 'Unknown error'}`);
					console.error('Custom converter error:', error);
				}
			}
		});

		this.addCommand({
			id: 'line-up',
			name: 'Swap line up',
			editorCallback: async (editor: Editor) => {

				//check if outliner commands exist
				const commandId = "obsidian-outliner:move-list-item-up";
				const commands = (this.app as any).commands;
				const commandExist = commands.listCommands().some((cmd: any) => cmd.id === commandId);

				const cursor = editor.getCursor();
				if (cursor.line == 0) {
					return;
				}

				const line = editor.getLine(cursor.line);	
				const lineAbove = editor.getLine(cursor.line - 1);

				if (commandExist && !editor.somethingSelected() && line.trim().startsWith(`- `) && lineAbove.trim().startsWith(`- `)) {
					commands.executeCommandById(commandId);
				} else {
					editor.exec("swapLineUp");
				}
				
			}
		});

		this.addCommand({
			id: 'line-down',
			name: 'Swap line down',
			editorCallback: async (editor: Editor) => {
		
				// Check if outliner commands exist
				const commandId = "obsidian-outliner:move-list-item-down";
				const commands = (this.app as any).commands;
				const commandExist = commands.listCommands().some((cmd: any) => cmd.id === commandId);
		
				const cursor = editor.getCursor();
				const lastLineNumber = editor.lineCount() - 1; // Get the index of the last line
		
				if (cursor.line == lastLineNumber) {
					return; // If cursor is on the last line, there is no line below to swap with
				}
		
				const line = editor.getLine(cursor.line);    
				const lineBelow = editor.getLine(cursor.line + 1);
		
				// Check if both current line and the line below start with "- "
				if (commandExist && !editor.somethingSelected() && line.trim().startsWith(`- `) && lineBelow.trim().startsWith(`- `)) {
					commands.executeCommandById(commandId);
				} else {
					editor.exec("swapLineDown");
				}
				
			}
		});		

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new OutlineConverterSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Split content into lines from editor selection or entire file
	 */
	async splitContent(editor: Editor): Promise<{ lines: string[], frontmatterLength: number }> {
		let fileContent = editor.getSelection();
		if (!fileContent) {
			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) {
				new Notice('No active file.');
				return { lines: [], frontmatterLength: 0 };
			}
			fileContent = await this.app.vault.read(activeFile);
		}
		const { parseFrontmatter } = await import('./src/utilis');
		const { frontmatter, content } = parseFrontmatter(fileContent);
		const lines = [...frontmatter.split(/\r?\n/).slice(0, -1), ...content.split(/\r?\n/)];
		const frontmatterLength = frontmatter.split(/\r?\n/).slice(0, -1).length;
		return { lines, frontmatterLength };
	}

	/**
	 * Create custom transformer functions for each indentation level
	 */
	private createCustomTransformers(): Array<(line: string) => string> {
		const transformers: Array<(line: string) => string> = [];

		for (let i = 1; i <= 5; i++) {
			const level = i as 1 | 2 | 3 | 4 | 5;
			const before = resolvePlaceholders(this.settings[`beforeText${level}`]);
			const after = resolvePlaceholders(this.settings[`afterText${level}`]);

			transformers.push((line: string): string => {
				if (this.settings[`ignoreText${level}`]) {
					return before + after;
				}
				return before + line + after;
			});
		}

		return transformers;
	}

	/**
	 * Export result based on selected export method
	 */
	private exportResult(editor: Editor, result: string): void {
		switch (this.settings.exportMethod) {
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
				this.outputHandler.outputToSection(editor, this.settings.sectionName, result);
				break;
		}
	}

}
