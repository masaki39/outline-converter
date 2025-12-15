import { Editor, Notice, Plugin } from 'obsidian';
import { IndentFold } from './src/indentFold';
import { OutlineConverterSettings, DEFAULT_SETTINGS, OutlineConverterSettingTab } from './src/settings';
import { OutputHandler } from './src/output';
import { SectionExtractor } from './src/sectionExtractor';
import { ConversionService } from './src/conversionService';

export default class OutlineConverter extends Plugin {
	settings: OutlineConverterSettings;
	private foldLevel: IndentFold;
	private outputHandler: OutputHandler;
	private sectionExtractor: SectionExtractor;
	private conversionService: ConversionService;

	async onload() {
		await this.loadSettings();

		// initialization
		this.foldLevel = new IndentFold(this);
		this.outputHandler = new OutputHandler(this.app);
		this.sectionExtractor = new SectionExtractor(this.app);
		this.conversionService = new ConversionService(this.app, this.outputHandler, this.sectionExtractor);

		// loading
		await this.foldLevel.onload();
		
		// auto-header converter
		this.addCommand({
			id: 'auto-header',
			name: 'Auto-header converter',
			editorCallback: async (editor: Editor) => {
				try {
					await this.conversionService.runAutoHeader(editor, this.settings);
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
					await this.conversionService.runCustomConvert(editor, this.settings);
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

}
