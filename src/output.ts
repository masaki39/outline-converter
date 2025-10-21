import { App, Editor } from 'obsidian';

export class OutputHandler {
	app: App;

	constructor(app: App) {
		this.app = app;
	}

	// copy content
	copyContent(result: string): void {
		navigator.clipboard.writeText(result);
	}

	// append content to cursor
	appendCursor(editor: Editor, result: string): void {
		if (editor.getSelection()) {
			editor.replaceSelection(result);
		} else {
			editor.replaceRange(result, editor.getCursor());
		}
	}

	// append content to note bottom
	appendBottom(result: string): void {
		const activeFile = this.app.workspace.getActiveFile();
		if (activeFile) {
			this.app.vault.append(activeFile, '\n' + result);
		}
	}

	// function: output to the section
	async outputToSection(
		editor: Editor,
		sectionName: string,
		finalResult: string
	): Promise<void> {
		// get lines
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			return;
		}
		const fileContent = await this.app.vault.read(activeFile);
		const lines = fileContent.split(/\r?\n/);

		// define values
		let startLine = null;
		let endLine = null;
		let endCh = null;

		// determine the values above
		for (let index = 0; index < lines.length; index++) {
			const line = lines[index].trim(); // trim each line
			if (line === `# ${sectionName}`.trim()) {
				startLine = index + 1;
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
			editor.replaceRange(finalResult, { line: startLine, ch: 0 }, { line: endLine, ch: endCh });
			editor.setCursor(startLine, 0);
		} else {
			this.app.vault.append(activeFile, `\n# ${sectionName}\n` + finalResult);
		}
	}
}
