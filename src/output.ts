import { App, Editor } from 'obsidian';
import { parseFrontmatter } from './utilis';

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
		const { frontmatter, content } = parseFrontmatter(fileContent);
		const frontmatterLines = frontmatter ? frontmatter.split(/\r?\n/) : [];
		const normalizedFrontmatterLines =
			frontmatterLines.length && frontmatterLines[frontmatterLines.length - 1] === ''
				? frontmatterLines.slice(0, -1)
				: frontmatterLines;
		const lines = [...normalizedFrontmatterLines, ...content.split(/\r?\n/)];

		// define values
		let startLine: number | null = null;
		let sectionLevel = 0;

		// find target heading (any level)
		for (let index = 0; index < lines.length; index++) {
			const match = lines[index].match(/^(#+)\s+(.*)$/);
			if (match && match[2].trim() === sectionName.trim()) {
				startLine = index + 1;
				sectionLevel = match[1].length;
				break;
			}
		}

		// output the result
		if (startLine !== null) {
			let nextHeaderIndex: number | null = null;
			for (let index = startLine; index < lines.length; index++) {
				const match = lines[index].match(/^(#+)\s+/);
				if (match && match[1].length <= sectionLevel) {
					nextHeaderIndex = index;
					break;
				}
			}

			const rangeStart = { line: startLine, ch: 0 };
			let rangeEnd: { line: number; ch: number };
			if (nextHeaderIndex === null) {
				const endLine = lines.length - 1;
				rangeEnd = { line: endLine, ch: lines[endLine]?.length ?? 0 };
			} else if (nextHeaderIndex <= startLine) {
				rangeEnd = rangeStart;
			} else {
				const endLine = nextHeaderIndex - 1;
				rangeEnd = { line: endLine, ch: lines[endLine]?.length ?? 0 };
			}

			editor.replaceRange(finalResult, rangeStart, rangeEnd);
			editor.setCursor(startLine, 0);
		} else {
			// append new section (heading + content) to the bottom of the note
			const endsWithNewline = /\r?\n$/.test(fileContent);
			const insertText = `${endsWithNewline ? '' : '\n'}\n# ${sectionName}\n${finalResult}\n`;
			await this.app.vault.append(activeFile, insertText);

			// place cursor at the new heading line
			const insertionLine = endsWithNewline ? lines.length - 1 : lines.length;
			editor.setCursor(insertionLine, 0);
		}
	}
}
