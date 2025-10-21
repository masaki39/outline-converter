// Mock implementation of Obsidian classes and functions
export class Notice {
	constructor(message: string) {
		// Mock implementation - do nothing
	}
}

export class Plugin {
	app: any;
	manifest: any;

	addCommand(command: any) {}
	addSettingTab(tab: any) {}
	loadData() { return Promise.resolve({}); }
	saveData(data: any) { return Promise.resolve(); }
	registerEvent(event: any) {}
	registerDomEvent(el: any, type: string, callback: any) {}
}

export class PluginSettingTab {
	constructor(app: any, plugin: any) {}
	display() {}
	hide() {}
}

export class Setting {
	constructor(containerEl: any) {}
	setName(name: string) { return this; }
	setDesc(desc: string) { return this; }
	addText(callback: any) { return this; }
	addToggle(callback: any) { return this; }
	addDropdown(callback: any) { return this; }
	addButton(callback: any) { return this; }
}

export class App {
	workspace: any;
	vault: any;
}

export class Editor {
	getCursor() { return { line: 0, ch: 0 }; }
	setCursor(pos: any) {}
	getSelection() { return ''; }
	replaceSelection(text: string) {}
	replaceRange(text: string, from: any, to?: any) {}
	getLine(line: number) { return ''; }
	lineCount() { return 0; }
	somethingSelected() { return false; }
	exec(command: string) {}
	setSelections(selections: any[]) {}
	scrollIntoView(range: any, center?: boolean) {}
}
