import { App, PluginSettingTab, Setting } from 'obsidian';
import OutlineConverter from '../main';

export interface OutlineConverterSettings {
	exportMethod: string;
	sectionName: string;
	currentLevel: number;
	currentReplace: number;
	startHeader: string;
	addSpace: string;
	[key: `beforeText${string}`]: string;
	[key: `afterText${string}`]: string;
	[key: `ignoreText${string}`]: boolean;
	[key: `beforeReplace${string}`]: string;
	[key: `afterReplace${string}`]: string;
	[key: `enableRegex${string}`]: boolean;
}

export const DEFAULT_SETTINGS: OutlineConverterSettings = {
	exportMethod: 'Copy',
	sectionName: 'Output',
	currentLevel: 3,
	currentReplace: 1,
	startHeader: 'h2',
	addSpace: '\n',
	ignoreText1: false,
	beforeText1: "\\n\\n## ",
	afterText1: "",
	ignoreText2: false,
	beforeText2: "\\n\\n### ",
	afterText2: "\\n\\n",
	ignoreText3: false,
	beforeText3: "",
	afterText3: " ",
	ignoreText4: false,
	beforeText4: "",
	afterText4: "",
	ignoreText5: false,
	beforeText5: "",
	afterText5: "",
	beforeReplace1: "",
	afterReplace1: "",
	enableRegex1: false,
	beforeReplace2: "",
	afterReplace2: "",
	enableRegex2: false,
	beforeReplace3: "",
	afterReplace3: "",
	enableRegex3: false,
	beforeReplace4: "",
	afterReplace4: "",
	enableRegex4: false,
	beforeReplace5: "",
	afterReplace5: "",
	enableRegex5: false
}

export class OutlineConverterSettingTab extends PluginSettingTab {
	plugin: OutlineConverter;
	maxLevel: number = 5;
	minLevel: number = 1;
	maxReplace: number = 5;
	minReplace: number = 1;

	constructor(app: App, plugin: OutlineConverter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// auto header
		new Setting(containerEl)
		.setName('Auto-header converter')
		.setDesc('Configure content connection and header starting level.')
		.addDropdown(dropdown => dropdown
			.addOptions({'': 'Connect directly',' ':'Insert space', '\n':'Insert linebreak'})
			.setValue(this.plugin.settings.addSpace)
			.onChange(async (value) => {
				this.plugin.settings.addSpace = value;
				await this.plugin.saveSettings();
			}))
		.addDropdown(dropdown => dropdown
			.addOptions({'h1': 'Start at h1 header','h2':'Start at h2 header'})
			.setValue(this.plugin.settings.startHeader)
			.onChange(async (value) => {
				this.plugin.settings.startHeader = value;
				await this.plugin.saveSettings();
			}));

		//custom converter
		new Setting(containerEl)
			.setName('Custom converter')
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

		// replace methodas
		new Setting(containerEl)
			.setName('Replacement')
			.setDesc(
				`Replacement before outputting the connected sentence.
				Check if you want to use regular expression for search.
				`
			)
			.addButton(button =>
				button.setButtonText('+')
				.setDisabled(this.plugin.settings.currentReplace >= this.maxReplace)
				.onClick(async() => {
					if (this.plugin.settings.currentReplace < this.maxReplace) {
						this.plugin.settings.currentReplace++;
						await this.display();
						await this.plugin.saveSettings();
					}

				}))
			.addButton(button =>
				button.setButtonText('-')
				.setDisabled(this.plugin.settings.currentReplace <= this.minReplace)
				.onClick(async() => {
					if (this.plugin.settings.currentReplace > this.minReplace) {
						this.plugin.settings.currentReplace--;
						await this.display();
						await this.plugin.saveSettings();
					}
				}));

		// display up to current level
		for (let i = 1; i <= this.plugin.settings.currentReplace; i++) {
            this.addReplaceMethodsSetting(i);
		}

		// export settings
		new Setting(containerEl)
		.setName('Select export method')
		.addDropdown(dropdown => dropdown
			.addOptions({
				'Copy': 'Copy content to clipboard',
				'Cursor':'Append content after the active cursor',
				'Bottom': 'Append content after the active note',
				'Section': 'Replace section with content'
			})
			.setValue(this.plugin.settings.exportMethod)
			.onChange(async (value) => {
				this.plugin.settings.exportMethod = value;
				await this.plugin.saveSettings();
				toggleSectionNameInput(value); // toggle on change
			}));

		// Section name setting
		const sectionNameInput = new Setting(containerEl)
		.setName('Section name')
		.addText(text => text
			.setPlaceholder('Enter Section Name')
			.setValue(this.plugin.settings.sectionName)
			.onChange(async (value) => {
				this.plugin.settings.sectionName = value;
				await this.plugin.saveSettings();
			}));

		// toggle first
		toggleSectionNameInput(this.plugin.settings.exportMethod);
		// define toggle function
		function toggleSectionNameInput(value: string) {
			sectionNameInput.settingEl.style.display = value === 'Section' ? '' : 'none';
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

	addReplaceMethodsSetting(level: number): void {
        const containerEl = this.containerEl;

		new Setting(containerEl)
            .setName(`Replace method ${level}`)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings[`enableRegex${level}`])
				.onChange(async (value) => {
					this.plugin.settings[`enableRegex${level}`] = value;
					await this.plugin.saveSettings();
				}))
            .addText(text => text
                .setPlaceholder('Find')
                .setValue(this.plugin.settings[`beforeReplace${level}`])
                .onChange(async (value) => {
                    this.plugin.settings[`beforeReplace${level}`] = value;
                    await this.plugin.saveSettings();
                }))
            .addText(text => text
                .setPlaceholder('Replace')
                .setValue(this.plugin.settings[`afterReplace${level}`])
                .onChange(async (value) => {
                    this.plugin.settings[`afterReplace${level}`] = value;
                    await this.plugin.saveSettings();
                }));
	}
}
