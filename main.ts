import { App, Editor,  EditorPosition,  MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface OutlineConverterSettings {
	sectionName: string;
	currentLevel: number;
	[key: `beforeText${string}`]: string; 
	[key: `afterText${string}`]: string; 
	[key: `ignoreText${string}`]: boolean; 
}

const DEFAULT_SETTINGS: OutlineConverterSettings = {
	sectionName: 'Output',
	currentLevel: 3,
	ignoreText1: false,
	beforeText1: "\\n\\n## ",
	afterText1: "",
	ignoreText2: false,
	beforeText2: "\\n\\n### ",
	afterText2: "\\n\\n",
	ignoreText3: false,
	beforeText3: "",
	afterText3: " ",
}

export default class OutlineConverter extends Plugin {
	settings: OutlineConverterSettings;

	async onload() {
		await this.loadSettings();

		// adjust result text to pandoc style method
		
		// custom command
		this.addCommand({
			id: 'outline-converter1',
			name: 'Custom converter',
			editorCallback: async (editor: Editor, view: MarkdownView) => {

				// get lines
				const lines = await this.splitContent();

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
				
				// transform linebreak
				result = this.linebreak(result);

				// copy the result to clipboard
				navigator.clipboard.writeText(result);
				
				// output
				this.outputToSection(editor, lines, this.settings.sectionName, result);
			}
		});

		// preset1
		this.addCommand({
			id: 'outline-converter2',
			name: 'Section, Paragraph, Content, Reference',
			editorCallback: async (editor: Editor, view: MarkdownView) => {

				// get lines
				const lines = await this.splitContent();

				// get indent levels list
				let indentLevels = this.calculateIndentLevels(lines);
				
				// transform & connect
				let result = this.transformLines(lines, indentLevels, this.headerLevel2, this.doubleLinebreak, this.addSpace, this.extractPandoc);
				
				// adjust pandoc style
				result = this.adjustPandoc(result);

				// copy the result to clipboard
				navigator.clipboard.writeText(result);
				
				// output
				this.outputToSection(editor, lines, this.settings.sectionName, result);
			}
		});

		// preset2
		this.addCommand({
			id: 'outline-converter3',
			name: 'Section, Paragraph, Skip, Content, Reference',
			editorCallback: async (editor: Editor, view: MarkdownView) => {

				// get lines
				const lines = await this.splitContent();
				
				// get indent levels list
				let indentLevels = this.calculateIndentLevels(lines);

				// transform & connect
				let result = this.transformLines(lines, indentLevels, this.headerLevel2, this.doubleLinebreak, this.ignoreLine, this.addSpace, this.extractPandoc);
				
				// adjust pandoc style
				result = this.adjustPandoc(result);

				// copy the result to clipboard
				navigator.clipboard.writeText(result);
				
				// output
				this.outputToSection(editor, lines, this.settings.sectionName, result);
			}
		});

		// fold indentation level 1 command
		this.addCommand({
			id: 'outline-converter:fold1',
			name: 'Fold All of Indentation Level 1',
			editorCallback: async (editor: Editor) => {

				// unfold all
				editor.exec(`unfoldAll`);

				// get lines
				const lines = await this.splitContent();
				
				// get indent levels list
				let indentLevels = this.calculateIndentLevels(lines);

				// fold the indentlevel
				for (let i = 0; i < indentLevels.length; i++) {
					if (indentLevels[i] === 1) {
						editor.setCursor(i);
						editor.exec(`toggleFold`);
					}
				}
			}
		});

		// fold indentation level 2 command
		this.addCommand({
			id: 'outline-converter:fold2',
			name: 'Fold All of Indentation Level 2',
			editorCallback: async (editor: Editor) => {

				// unfold all
				editor.exec(`unfoldAll`);

				// get lines
				const lines = await this.splitContent();
				
				// get indent levels list
				let indentLevels = this.calculateIndentLevels(lines);

				// fold the indentlevel
				for (let i = 0; i < indentLevels.length; i++) {
					if (indentLevels[i] === 2) {
						editor.setCursor(i);
						editor.exec(`toggleFold`);
					}
				}
			}
		});

		// fold indentation level 3 command
		this.addCommand({
			id: 'outline-converter:fold3',
			name: 'Fold All of Indentation Level 3',
			editorCallback: async (editor: Editor) => {

				// unfold all
				editor.exec(`unfoldAll`);

				// get lines
				const lines = await this.splitContent();
				
				// get indent levels list
				let indentLevels = this.calculateIndentLevels(lines);

				// fold the indentlevel
				for (let i = 0; i < indentLevels.length; i++) {
					if (indentLevels[i] === 3) {
						editor.setCursor(i);
						editor.exec(`toggleFold`);
					}
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
	async splitContent() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('No active file.');
			return [];
		}
		const fileContent = await this.app.vault.read(activeFile);
		const lines = fileContent.split(/\r?\n/);
		return lines;
	}

	// return list of indentlevels from lines
	calculateIndentLevels(lines: string[], tabSize: number = 4): number[]{
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
		let indexOffset = lines.length - indentLevels.length;
	
		for (let i = 0; i < indentLevels.length; i++) {
			// Ignore lines such as front matter where indent level might be 0
			if (indentLevels[i] === 0) continue;
	
			let line = lines[i + indexOffset].trim().slice(2);
			let level = indentLevels[i];
	
			// Ensure the method exists for the given level (1-indexed for methods)
			if (level > 0 && level <= methods.length) {
				transformedLines.push(methods[level - 1](line));
			}
		}
	
		const connectedResult = transformedLines.join("");
		return connectedResult;
	}

	// add methods for line

	headerLevel2(line: string): string{
		const transformedLine =  `\n\n## ` + line; 
		return transformedLine;
	}

	doubleLinebreak(line: string): string{
		const transformedLine =  `\n\n`; 
		return transformedLine;
	}

	addSpace(line: string): string{
		const transformedLine = line + ` `; 
		return transformedLine;
	}

	extractPandoc(line: string): string{
		const pattern = /\[\[@(.*?)(\||\]\])/ ;
		let match = line.match(pattern);
		let transformedLine: string = "";
		if (match) {
			transformedLine = `[@${match[1]}]`;
		}
		return transformedLine; 
	}

	ignoreLine(line: string): string{
		return "";
	}

	// add replace methods 

	// adjust pandoc style
	adjustPandoc(text: string,): string {
		const adjustedText = text.replace(/\]\[\@/g, ';@').replace(/(\.)\s*(\[@.*?\])/g, '$2$1 ');
		return adjustedText
	}

	// \\n→\n
	linebreak(line: string): string{
		const transformedLine = line.replace(/\\n/g, "\n"); 
		return transformedLine;
	}

	// add output methods

	//　funstion: output to the section
	outputToSection(
		editor: Editor,
		lines: string[],
		sectionName: string,
		finalResult: string
	  ): void {

			let startLine = null;
			let endLine = null;
			let endCh = null;

			// determine the values above
			for (let index = 0; index < lines.length; index++) {
				const line = lines[index].trim(); // trim each line
				if (line === `# ${sectionName}`.trim()) {
					startLine = index + 1 ;
				} else if (line.startsWith(`# `) && startLine && !endLine) {
					endLine = index - 1;
					endCh = lines[endLine].length;
				break; 
				}		
			}
			if (startLine && !endLine) {
				endLine = lines.length - 1; // adjust index
				endCh = lines[endLine].length;
			}
			console.log(`replaceRange:{${startLine},0},{${endLine},${endCh}}`);

			// output the result
			if (startLine && endLine && endCh !== null) {
				editor.replaceRange(finalResult, {line: startLine, ch: 0}, {line: endLine, ch: endCh});
				editor.setCursor(startLine, 0) 
			}

	}
}

class OutlineConverterSettingTab extends PluginSettingTab {
	plugin: OutlineConverter;
	maxLevel: number = 5;
	minLevel: number = 1;

	constructor(app: App, plugin: OutlineConverter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
		.setName('Output section name')
		.addText(text => text
			.setPlaceholder('Enter a name')
			.setValue(this.plugin.settings.sectionName)
			.onChange(async (value) => {
				this.plugin.settings.sectionName = value;
				await this.plugin.saveSettings();
			}));
			
		new Setting(containerEl)
			.setName('Custom Comverter')
			.setDesc(
				`Check if you want to ignore content.
				Set text you want to insert.
				\\n means linebreak.
				`
			)
			.addButton(button => 
				button.setButtonText('+')
				.setDisabled(this.plugin.settings.currentLevel >= this.maxLevel)
				.onClick(async() => {
					if (this.plugin.settings.currentLevel < this.maxLevel) {
						this.plugin.settings.currentLevel++;
						this.initializeLevelSettings(this.plugin.settings.currentLevel);
						await this.display();
						await this.plugin.saveSettings();
					}
			
				}))
			.addButton(button => 
				button.setButtonText('-')
				.setDisabled(this.plugin.settings.currentLevel <= this.minLevel)
				.onClick(async() => {
					if (this.plugin.settings.currentLevel > this.minLevel) {
						this.plugin.settings.currentLevel--;
						await this.display();
						await this.plugin.saveSettings();
					}
				}));

		// display up to current level
		for (let i = 1; i <= this.plugin.settings.currentLevel; i++) {
            this.addIndentLevelSetting(i);
        }
	}

	addIndentLevelSetting(level: number): void {
        const containerEl = this.containerEl;

		new Setting(containerEl)
            .setName(`Indentation level ${level}`)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings[`ignoreText${level}`])
				.onChange(async (value) => {
					this.plugin.settings[`ignoreText${level}`] = value;
					await this.plugin.saveSettings();
				}))	
            .addText(text => text
                .setPlaceholder('Insert Before Text')
                .setValue(this.plugin.settings[`beforeText${level}`])
                .onChange(async (value) => {
                    this.plugin.settings[`beforeText${level}`] = value;
                    await this.plugin.saveSettings();
                }))
            .addText(text => text
                .setPlaceholder('Insert After Text')
                .setValue(this.plugin.settings[`afterText${level}`])
                .onChange(async (value) => {
                    this.plugin.settings[`afterText${level}`] = value;
                    await this.plugin.saveSettings();
                }));
	}

	initializeLevelSettings(level: number): void {
		this.plugin.settings[`ignoreText${level}`] = false;
		this.plugin.settings[`beforeText${level}`] = '';
		this.plugin.settings[`afterText${level}`] = '';
	}
}
