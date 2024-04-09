import { App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting1: string;
	mySetting2: string;
	mySetting3: string;
	mySetting4: string;
	mySetting5: string;
	mySetting6: string;
	mySetting7: string;
	mySetting8: string;
	mySetting9: string;
	mySetting10: string;
	mySetting11: string;
	myCheckboxSetting1: boolean;
	myCheckboxSetting2: boolean;
	myCheckboxSetting3: boolean;
	myCheckboxSetting4: boolean;
	myCheckboxSetting5: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting1: 'Output',
	mySetting2: '\\n\\n## ', //indent level 1
	mySetting3: '',
	mySetting4: '\\n\\n### ', // 2
	mySetting5: '\\n\\n',
	mySetting6: '', // 3
	mySetting7: ' ',
	mySetting8: '', // 4
	mySetting9: ' ',
	mySetting10: '', //5
	mySetting11: ' ',
	myCheckboxSetting1: false,
	myCheckboxSetting2: false,
	myCheckboxSetting3: false,
	myCheckboxSetting4: false,
	myCheckboxSetting5: false,
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// custom command
		this.addCommand({
			id: 'outline-converter1',
			name: 'Custom converter',
			callback: async() => {

				// return if no active file
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					new Notice('No active file.');
					return;
				}
				
				// get lines
				const fileContent = await this.app.vault.read(activeFile);
				const lines = fileContent.split(/\r?\n/);
				const tabSize = 4;

				// ignore frontmatter index
				let ignoreUntilIndex = 0;
				for (let i = 0; i < lines.length; i++) {
					if (lines[i].startsWith('---') && i !== 0) {
						ignoreUntilIndex = i + 1;
						break;
					}
				}
				console.log(`ignore frontmatter:${ignoreUntilIndex}`);

				// get values from settings
				let frontText1 = this.settings.mySetting2.replace(/\\n/g, "\n");
				let postText1 = this.settings.mySetting3.replace(/\\n/g, "\n");
				let frontText2 = this.settings.mySetting4.replace(/\\n/g, "\n");
				let postText2 = this.settings.mySetting5.replace(/\\n/g, "\n");
				let frontText3 = this.settings.mySetting6.replace(/\\n/g, "\n");
				let postText3 = this.settings.mySetting7.replace(/\\n/g, "\n");
				let frontText4 = this.settings.mySetting8.replace(/\\n/g, "\n");
				let postText4 = this.settings.mySetting9.replace(/\\n/g, "\n");
				let frontText5 = this.settings.mySetting10.replace(/\\n/g, "\n");
				let postText5 = this.settings.mySetting11.replace(/\\n/g, "\n");

				// treat each line 
				let result: string[] = [];
				for (let i = 0; i < lines.length; i++) {
					if (i < ignoreUntilIndex) continue;

					// difine match rule
					let line = lines[i];
					let level = 0;
					const matchTabs = line.match(/^(\t*)- /);
					const matchSpaces = line.match(/^( *)- /);

					// search indent level
					if (matchTabs) {
						level = matchTabs[1].length + 1;
					  } else if (matchSpaces) {
						const leadingSpaces = matchSpaces[1].length;
						level = Math.ceil(leadingSpaces / (tabSize)) + 1;
					  }
					console.log(`${level}`);

					// transform each level
					if (level == 1) {
						const text = this.settings.myCheckboxSetting1 ? '' : line.trim().slice(2);
						result.push(`${frontText1}${text}${postText1}`);
					} else if (level == 2) {
						const text = this.settings.myCheckboxSetting2 ? '' : line.trim().slice(2);
						result.push(`${frontText2}${text}${postText2}`);
					} else if (level == 3) {
						const text = this.settings.myCheckboxSetting3 ? '' : line.trim().slice(2);
						result.push(`${frontText3}${text}${postText3}`);
					} else if (level == 4) {
						const text = this.settings.myCheckboxSetting4 ? '' : line.trim().slice(2);
						result.push(`${frontText4}${text}${postText4}`);
					} else if (level == 5) {
						const text = this.settings.myCheckboxSetting5 ? '' : line.trim().slice(2);
						result.push(`${frontText5}${text}${postText5}`);
					}
				};

				// connect transformed lines
				const finalResult = result.join("");

				// copy the result to clipboard
				navigator.clipboard.writeText(finalResult);
				
				// output the result to a section
				let startLine = null;
				let endLine = null;
				let endCh = null;

				// determine the values above
				for (let index = 0; index < lines.length; index++) {
    				const line = lines[index].trim(); // trim each line
    				if (line === `# ${this.settings.mySetting1}`.trim()) {
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
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (startLine && endLine && endCh !== null && markdownView) {
    				markdownView.editor.replaceRange(finalResult, {line: startLine, ch: 0}, {line: endLine, ch: endCh});
    				markdownView.editor.setCursor(startLine, 0) 
				}
			}
		});

		// preset1
		this.addCommand({
			id: 'outline-converter2',
			name: 'Section, Paragraph, Content, Reference',
			callback: async() => {

				// return if no active file
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					new Notice('No active file.');
					return;
				}
				
				// get lines
				const fileContent = await this.app.vault.read(activeFile);
				const lines = fileContent.split(/\r?\n/);
				const tabSize = 4;

				// ignore frontmatter index
				let ignoreUntilIndex = 0;
				for (let i = 0; i < lines.length; i++) {
					if (lines[i].startsWith('---') && i !== 0) {
						ignoreUntilIndex = i + 1;
						break;
					}
				}
				console.log(`ignore frontmatter:${ignoreUntilIndex}`);

				// treat each line 
				let result: string[] = [];
				for (let i = 0; i < lines.length; i++) {
					if (i < ignoreUntilIndex) continue;

					// difine match rule
					let line = lines[i];
					let level = 0;
					const matchTabs = line.match(/^(\t*)- /);
					const matchSpaces = line.match(/^( *)- /);

					// search indent level
					if (matchTabs) {
						level = matchTabs[1].length + 1;
					  } else if (matchSpaces) {
						const leadingSpaces = matchSpaces[1].length;
						level = Math.ceil(leadingSpaces / (tabSize)) + 1;
					  }
					console.log(`${level}`);

					// transform each level
					if (level == 1) {
						const text = line.trim().slice(2);
						result.push(`\n\n${text}`);
					} else if (level == 2) {
						result.push(`\n\n`);
					} else if (level == 3) {
						const text = line.trim().slice(2);
						result.push(`${text} `);
					} else if (level == 4) {
						const pattern = /\[\[@(.*?)(\||\]\])/ ;
						let match = line.match(pattern);
						if (match) {
							const text = `[@${match[1]}]`;
							result.push(text); 
						}
					}
				};

				// connect transformed lines
				const intermediateResult = result.join("").slice(1);
				console.log(`${intermediateResult}`);
				
				// adjust pandoc style
				let finalResult = intermediateResult
					.replace(/\]\[\@/g, ';@')
					.replace(/(\.)\s*(\[@.*?\])/g, '$2$1 ');

				// copy the result to clipboard
				navigator.clipboard.writeText(finalResult);
				
				// output the result to a section
				let startLine = null;
				let endLine = null;
				let endCh = null;

				// determine the values above
				for (let index = 0; index < lines.length; index++) {
    				const line = lines[index].trim(); // trim each line
    				if (line === `# ${this.settings.mySetting1}`.trim()) {
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
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (startLine && endLine && endCh !== null && markdownView) {
    				markdownView.editor.replaceRange(finalResult, {line: startLine, ch: 0}, {line: endLine, ch: endCh});
    				markdownView.editor.setCursor(startLine, 0) 
				}
			}
		});

		// preset2
		this.addCommand({
			id: 'outline-converter3',
			name: 'Section, Paragraph, Skip, Content, Reference',
			callback: async() => {

				// return if no active file
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					new Notice('No active file.');
					return;
				}
				
				// get lines
				const fileContent = await this.app.vault.read(activeFile);
				const lines = fileContent.split(/\r?\n/);
				const tabSize = 4;

				// ignore frontmatter index
				let ignoreUntilIndex = 0;
				for (let i = 0; i < lines.length; i++) {
					if (lines[i].startsWith('---') && i !== 0) {
						ignoreUntilIndex = i + 1;
						break;
					}
				}
				console.log(`ignore frontmatter:${ignoreUntilIndex}`);

				// treat each line 
				let result: string[] = [];
				for (let i = 0; i < lines.length; i++) {
					if (i < ignoreUntilIndex) continue;

					// difine match rule
					let line = lines[i];
					let level = 0;
					const matchTabs = line.match(/^(\t*)- /);
					const matchSpaces = line.match(/^( *)- /);

					// search indent level
					if (matchTabs) {
						level = matchTabs[1].length + 1;
					  } else if (matchSpaces) {
						const leadingSpaces = matchSpaces[1].length;
						level = Math.ceil(leadingSpaces / (tabSize)) + 1;
					  }
					console.log(`${level}`);

					// transform each level
					if (level == 1) {
						const text = line.trim().slice(2);
						result.push(`\n\n${text}`);
					} else if (level == 2) {
						result.push(`\n\n`);
					} else if (level == 4) {
						const text = line.trim().slice(2);
						result.push(`${text} `);
					} else if (level == 5) {
						const pattern = /\[\[@(.*?)(\||\]\])/ ;
						let match = line.match(pattern);
						if (match) {
							const text = `[@${match[1]}]`;
							result.push(text); 
						}
					}
				};

				// connect transformed lines
				const intermediateResult = result.join("").slice(1);
				console.log(`${intermediateResult}`);
				
				// adjust pandoc style
				let finalResult = intermediateResult
					.replace(/\]\[\@/g, ';@')
					.replace(/(\.)\s*(\[@.*?\])/g, '$2$1 ');

				// copy the result to clipboard
				navigator.clipboard.writeText(finalResult);
				
				// output the result to a section
				let startLine = null;
				let endLine = null;
				let endCh = null;

				// determine the values above
				for (let index = 0; index < lines.length; index++) {
    				const line = lines[index].trim(); // trim each line
    				if (line === `# ${this.settings.mySetting1}`.trim()) {
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
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (startLine && endLine && endCh !== null && markdownView) {
    				markdownView.editor.replaceRange(finalResult, {line: startLine, ch: 0}, {line: endLine, ch: endCh});
    				markdownView.editor.setCursor(startLine, 0) 
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
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

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Output section name')
			// .setDesc('')
			.addText(text => text
				.setPlaceholder('Enter a name')
				.setValue(this.plugin.settings.mySetting1)
				.onChange(async (value) => {
					this.plugin.settings.mySetting1 = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Custom Converter')
			.setDesc("Check if you want to ignore the text.")
		new Setting(containerEl)
			.setName('Indent level 1')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.myCheckboxSetting1)
				.onChange(async (value) => {
					this.plugin.settings.myCheckboxSetting1 = value;
					await this.plugin.saveSettings();
				}))	
			.addText(text => text
				.setPlaceholder('Insert before text')
				.setValue(this.plugin.settings.mySetting2)
				.onChange(async (value) => {
					this.plugin.settings.mySetting2 = value;
					await this.plugin.saveSettings();
				}))
			.addText(text => text
				.setPlaceholder('Insert after text')
				.setValue(this.plugin.settings.mySetting3)
				.onChange(async (value) => {
					this.plugin.settings.mySetting3 = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Indent level 2')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.myCheckboxSetting2)
				.onChange(async (value) => {
					this.plugin.settings.myCheckboxSetting2 = value;
					await this.plugin.saveSettings();
				}))	
			.addText(text => text
				.setPlaceholder('Insert before text')
				.setValue(this.plugin.settings.mySetting4)
				.onChange(async (value) => {
					this.plugin.settings.mySetting4 = value;
					await this.plugin.saveSettings();
				}))
			.addText(text => text
				.setPlaceholder('Insert after text')
				.setValue(this.plugin.settings.mySetting5)
				.onChange(async (value) => {
					this.plugin.settings.mySetting5 = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Indent level 3')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.myCheckboxSetting3)
				.onChange(async (value) => {
					this.plugin.settings.myCheckboxSetting3 = value;
					await this.plugin.saveSettings();
				}))	
			.addText(text => text
				.setPlaceholder('Insert before text')
				.setValue(this.plugin.settings.mySetting6)
				.onChange(async (value) => {
					this.plugin.settings.mySetting6 = value;
					await this.plugin.saveSettings();
				}))
			.addText(text => text
				.setPlaceholder('Insert After text')
				.setValue(this.plugin.settings.mySetting7)
				.onChange(async (value) => {
					this.plugin.settings.mySetting7 = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Indent level 4')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.myCheckboxSetting4)
				.onChange(async (value) => {
					this.plugin.settings.myCheckboxSetting4 = value;
					await this.plugin.saveSettings();
				}))	
			.addText(text => text
				.setPlaceholder('Insert before text')
				.setValue(this.plugin.settings.mySetting8)
				.onChange(async (value) => {
					this.plugin.settings.mySetting8 = value;
					await this.plugin.saveSettings();
				}))
			.addText(text => text
				.setPlaceholder('Insert after text')
				.setValue(this.plugin.settings.mySetting9)
				.onChange(async (value) => {
					this.plugin.settings.mySetting9 = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Indent level 5')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.myCheckboxSetting5)
				.onChange(async (value) => {
					this.plugin.settings.myCheckboxSetting5 = value;
					await this.plugin.saveSettings();
				}))	
			.addText(text => text
				.setPlaceholder('Insert before text')
				.setValue(this.plugin.settings.mySetting10)
				.onChange(async (value) => {
					this.plugin.settings.mySetting10 = value;
					await this.plugin.saveSettings();
				}))
			.addText(text => text
				.setPlaceholder('Insert after text')
				.setValue(this.plugin.settings.mySetting11)
				.onChange(async (value) => {
					this.plugin.settings.mySetting11 = value;
					await this.plugin.saveSettings();
				}));
	}
}
