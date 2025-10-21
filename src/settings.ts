import { App, PluginSettingTab, Setting } from 'obsidian';
import OutlineConverter from '../main';

export type LevelIndex = 1 | 2 | 3 | 4 | 5;

export interface OutlineConverterSettings {
	exportMethod: string;
	sectionName: string;
	startHeader: string;
	addSpace: string;
	// Level 1-5 settings
	beforeText1: string;
	afterText1: string;
	ignoreText1: boolean;
	beforeText2: string;
	afterText2: string;
	ignoreText2: boolean;
	beforeText3: string;
	afterText3: string;
	ignoreText3: boolean;
	beforeText4: string;
	afterText4: string;
	ignoreText4: boolean;
	beforeText5: string;
	afterText5: string;
	ignoreText5: boolean;
	// Replacement 1-5 settings
	beforeReplace1: string;
	afterReplace1: string;
	enableRegex1: boolean;
	beforeReplace2: string;
	afterReplace2: string;
	enableRegex2: boolean;
	beforeReplace3: string;
	afterReplace3: string;
	enableRegex3: boolean;
	beforeReplace4: string;
	afterReplace4: string;
	enableRegex4: boolean;
	beforeReplace5: string;
	afterReplace5: string;
	enableRegex5: boolean;
}

export const DEFAULT_SETTINGS: OutlineConverterSettings = {
	exportMethod: 'Copy',
	sectionName: 'Output',
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

	constructor(app: App, plugin: OutlineConverter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// auto header
		containerEl.createEl('h2', { text: 'Auto-header converter' });
		containerEl.createEl('p', {
			text: 'Converts outline to text with headers. Items with children become headers.',
			cls: 'setting-item-description'
		});

		new Setting(containerEl)
		.setName('Content connection')
		.setDesc('How to connect same-level content.')
		.addDropdown(dropdown => dropdown
			.addOptions({'': 'Connect directly',' ':'Insert space', '\n':'Insert linebreak'})
			.setValue(this.plugin.settings.addSpace)
			.onChange(async (value) => {
				this.plugin.settings.addSpace = value;
				await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
		.setName('Header starting level')
		.setDesc('Start headers at h1 or h2.')
		.addDropdown(dropdown => dropdown
			.addOptions({'h1': 'Start at h1 header','h2':'Start at h2 header'})
			.setValue(this.plugin.settings.startHeader)
			.onChange(async (value) => {
				this.plugin.settings.startHeader = value;
				await this.plugin.saveSettings();
			}));

		//custom converter
		containerEl.createEl('h2', { text: 'Custom converter' });
		containerEl.createEl('p', {
			text: 'Customize conversion per indent level. Add text before/after or ignore content. Use \\n for linebreaks.',
			cls: 'setting-item-description'
		});

		// display all 5 levels
		for (let i = 1; i <= 5; i++) {
            this.addIndentLevelSetting(i);
		}

		// replace methods
		containerEl.createEl('h2', { text: 'Replacement' });
		containerEl.createEl('p', {
			text: 'Find & replace operations. Toggle checkbox for regex mode.',
			cls: 'setting-item-description'
		});

		// display all 5 replacement rules
		for (let i = 1; i <= 5; i++) {
            this.addReplaceMethodsSetting(i);
		}

		// export settings
		containerEl.createEl('h2', { text: 'Export method' });
		containerEl.createEl('p', {
			text: 'Output destination for converted text.',
			cls: 'setting-item-description'
		});

		new Setting(containerEl)
		.setName('Select export method')
		.setDesc('Output destination.')
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
		.setDesc('Section heading (without #) to replace. Created if not exists.')
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
		const levelIndex = level as LevelIndex;

		new Setting(containerEl)
            .setName(`Indentation level ${level}`)
			.setDesc('Toggle to ignore. Add text before/after.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings[`ignoreText${levelIndex}`])
				.onChange(async (value) => {
					this.plugin.settings[`ignoreText${levelIndex}`] = value;
					await this.plugin.saveSettings();
				}))
            .addText(text => text
                .setPlaceholder('Insert Before Text')
                .setValue(this.plugin.settings[`beforeText${levelIndex}`])
                .onChange(async (value) => {
                    this.plugin.settings[`beforeText${levelIndex}`] = value;
                    await this.plugin.saveSettings();
                }))
            .addText(text => text
                .setPlaceholder('Insert After Text')
                .setValue(this.plugin.settings[`afterText${levelIndex}`])
                .onChange(async (value) => {
                    this.plugin.settings[`afterText${levelIndex}`] = value;
                    await this.plugin.saveSettings();
                }));
	}

	addReplaceMethodsSetting(level: number): void {
        const containerEl = this.containerEl;
		const levelIndex = level as LevelIndex;

		new Setting(containerEl)
            .setName(`Replace method ${level}`)
			.setDesc('Toggle for regex. Enter find/replace text.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings[`enableRegex${levelIndex}`])
				.onChange(async (value) => {
					this.plugin.settings[`enableRegex${levelIndex}`] = value;
					await this.plugin.saveSettings();
				}))
            .addText(text => text
                .setPlaceholder('Find')
                .setValue(this.plugin.settings[`beforeReplace${levelIndex}`])
                .onChange(async (value) => {
                    this.plugin.settings[`beforeReplace${levelIndex}`] = value;
                    await this.plugin.saveSettings();
                }))
            .addText(text => text
                .setPlaceholder('Replace')
                .setValue(this.plugin.settings[`afterReplace${levelIndex}`])
                .onChange(async (value) => {
                    this.plugin.settings[`afterReplace${levelIndex}`] = value;
                    await this.plugin.saveSettings();
                }));
	}
}
