import { Editor, Notice, Plugin } from 'obsidian';
import { IndentFold } from './src/indentFold';
import { OutlineConverterSettings, DEFAULT_SETTINGS, OutlineConverterSettingTab } from './src/settings';
import { OutputHandler } from './src/output';
import { SectionExtractor } from './src/sectionExtractor';

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

				// get lines
				const lines = await this.splitContent(editor);

				// get indent levels list
				let indentLevels = this.calculateIndentLevels(lines);
				
				// transform & connect
				let result = this.autoHeader(lines,indentLevels);

				// replacement methods
				for (let i = 1; i <= 5; i++) {
					if (this.settings.currentReplace >= i) {
						if (this.settings[`enableRegex${i}`]) {
							try {
								let regex = new RegExp(this.settings[`beforeReplace${i}`], "g");
								result = result.replace(regex, this.settings[`afterReplace${i}`]);
							} catch (error) {
								new Notice("Something wrong with regular expression");
								return;
							}
						} else {
							let regrex = new RegExp(this.settings[`beforeReplace${i}`].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"); // escape
							result = result.replace(regrex, this.settings[`afterReplace${i}`]);
						}
						
					}
				  }

				// transform linebreak
				result = result.replace(/\\n/g, "\n");

				// process section links
				result = await this.sectionExtractor.processSectionLinks(result);

				// export
				if (this.settings.exportMethod == 'Copy'){
					this.outputHandler.copyContent(result);
				} else if (this.settings.exportMethod == 'Cursor'){
					this.outputHandler.appendCursor(editor, result);
				} else if (this.settings.exportMethod == 'Bottom'){
					this.outputHandler.appendBottom(result);
				} else if (this.settings.exportMethod == 'Section'){
					this.outputHandler.outputToSection(editor, this.settings.sectionName, result);
				}
			}
		});
		
		// custom command
		this.addCommand({
			id: 'custom-convert',
			name: 'Custom converter',
			editorCallback: async (editor: Editor) => {

				// get lines
				const lines = await this.splitContent(editor);

				// get indent levels list
				let indentLevels = this.calculateIndentLevels(lines);
				
				const customizeLine1 = (line: string): string => {
					if (this.settings.currentLevel < 1) {
						return "";
					} else if (this.settings.ignoreText1 == true){
						return this.settings.beforeText1 + this.settings.afterText1;
					}
					return this.settings.beforeText1 + line + this.settings.afterText1;
				};
				const customizeLine2 = (line: string): string => {
					if (this.settings.currentLevel < 2) {
						return "";
					} else if (this.settings.ignoreText2 == true){
						return this.settings.beforeText2 + this.settings.afterText2;
					}
					return this.settings.beforeText2 + line + this.settings.afterText2;
				};
				const customizeLine3 = (line: string): string => {
					if (this.settings.currentLevel < 3) {
						return "";
					} else if (this.settings.ignoreText3 == true){
						return this.settings.beforeText3 + this.settings.afterText3;
					}
					return this.settings.beforeText3 + line + this.settings.afterText3;
				};
				const customizeLine4 = (line: string): string => {
					if (this.settings.currentLevel < 4) {
						return "";
					} else if (this.settings.ignoreText4 == true){
						return this.settings.beforeText4 + this.settings.afterText4;
					}
					return this.settings.beforeText4 + line + this.settings.afterText4;
				};
				const customizeLine5 = (line: string): string => {
					if (this.settings.currentLevel < 5) {
						return "";
					} else if (this.settings.ignoreText5 == true){
						return this.settings.beforeText5 + this.settings.afterText5;
					}
					return this.settings.beforeText5 + line + this.settings.afterText5;
				};

				// transform & connect
				let result = this.transformLines(lines, indentLevels, customizeLine1, customizeLine2, customizeLine3, customizeLine4, customizeLine5);
				
				// replacement methods
				for (let i = 1; i <= 5; i++) {
					if (this.settings.currentReplace >= i) {
						if (this.settings[`enableRegex${i}`]) {
							try {
								let regex = new RegExp(this.settings[`beforeReplace${i}`], "g");
								result = result.replace(regex, this.settings[`afterReplace${i}`]);
							} catch (error) {
								new Notice("Something wrong with regular expression");
								return;
							}
						} else {
							let regrex = new RegExp(this.settings[`beforeReplace${i}`].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"); // escape
							result = result.replace(regrex, this.settings[`afterReplace${i}`]);
						}
						
					}
				  }

				// transform linebreak
				result = result.replace(/\\n/g, "\n");

				// process section links
				result = await this.sectionExtractor.processSectionLinks(result);

				// export
				if (this.settings.exportMethod == 'Copy'){
					this.outputHandler.copyContent(result);
				} else if (this.settings.exportMethod == 'Cursor'){
					this.outputHandler.appendCursor(editor, result);
				} else if (this.settings.exportMethod == 'Bottom'){
					this.outputHandler.appendBottom(result);
				} else if (this.settings.exportMethod == 'Section'){
					this.outputHandler.outputToSection(editor, this.settings.sectionName, result);
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

	// transform content to lines
	async splitContent(editor: Editor) {
		let fileContent = editor.getSelection();
		if (!fileContent){
			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) {
				new Notice('No active file.');
				return [];
			}
			fileContent = await this.app.vault.read(activeFile);
		}
		const lines = fileContent.split(/\r?\n/);
		return lines;
	}

	// return list of indentlevels from lines
	calculateIndentLevels(lines: string[], tabSize: number = (this.app as any).vault.getConfig("tabSize") ?? 4): number[]{
		let ignoreUntilIndex = 0;
	    let indentLevels: number[] = [];

   	 	// Determine the index to start processing from (ignore frontmatter)
	    for (let i = 0; i < lines.length; i++) {
    	    if (!lines[i].startsWith('---') && i == 0) {
				break;
      	 	} else if (lines[i].startsWith('---') && i !== 0) {
				ignoreUntilIndex = i + 1;
				break;
       	 	}
   	 	}

    	// Calculate indent levels
    	for (let i = 0; i < lines.length; i++) {
			if (i < ignoreUntilIndex) {
				indentLevels.push(0);  // Set front matter lines to level 0
				continue;
			}
	
			let line = lines[i];
			let level = 0;
			const matchTabs = line.match(/^(\t*)- /);
			const matchSpaces = line.match(/^( *)- /);
			if (matchTabs) {
				level = matchTabs[1].length + 1;
			} else if (matchSpaces) {
				const leadingSpaces = matchSpaces[1].length;
				level = Math.ceil(leadingSpaces / tabSize) + 1;
			}
			indentLevels.push(level);
		}

    	return indentLevels;
	}

	// transform and connect each indentation level
	transformLines(lines: string[], indentLevels: number[], ...methods: ((line: string) => string)[]): string {
		let transformedLines: string[] = [];
	
		for (let i = 0; i < indentLevels.length; i++) {
			// Ignore lines such as front matter where indent level might be 0
			if (indentLevels[i] === 0) continue;
	
			let line = lines[i].trim().slice(2);
			let level = indentLevels[i];
	
			// Ensure the method exists for the given level (1-indexed for methods)
			if (level > 0 && level <= methods.length) {
				transformedLines.push(methods[level - 1](line));
			}
		}
	
		const connectedResult = transformedLines.join("");
		return connectedResult;
	}

	// transform autoheader
	autoHeader(lines: string[], indentLevels: number[]): string {
		let transformedLines: string[] = [];
	
		for (let i = 0; i < indentLevels.length; i++) {
			// Ignore lines such as front matter where indent level might be 0
			if (indentLevels[i] === 0) continue;
	
			let line = lines[i].trim().slice(2);
			let level = indentLevels[i];
			let nextLevel = indentLevels[i+1] ?? 0;
			let next2Level = indentLevels[i+2] ?? 0;
			let beforeLevel = indentLevels[i-1] ?? 0;
			let addHeader = 0;
			if (this.settings.startHeader == 'h2'){addHeader ++;}
	
			if (next2Level ==  level + 2) {
				line = '\n\n' + '#'.repeat(level + addHeader) + ' ' + line;
				transformedLines.push(line);
			} else if (nextLevel == level + 1) {
				line = '\n\n' + '#'.repeat(level + addHeader) + ' ' + line + '\n\n';
				transformedLines.push(line);
			} else {
				if (level < beforeLevel){line = '\n\n' + line;}
				if (nextLevel == level && next2Level <= level){line = line + this.settings.addSpace}
				transformedLines.push(line);
			}
		}
		const connectedResult = transformedLines.join("");
		return connectedResult;
	}

}
