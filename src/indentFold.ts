import { App, Editor, Plugin, Notice } from "obsidian";
import { parseFrontmatter, calculateIndentLevels } from "./utilis";

export class IndentFold {
	plugin: Plugin;
    app: App;

	constructor(plugin: Plugin) {
		this.plugin = plugin;
        this.app = plugin.app;
	}
   
	// transform content to lines and get frontmatter length
	private async splitContent(): Promise<{ lines: string[], frontmatterLength: number }> {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('No active file.');
            return { lines: [], frontmatterLength: 0 };
        }
        const fileContent = await this.app.vault.read(activeFile);
        const { frontmatter, content } = parseFrontmatter(fileContent);
        const frontmatterLines = frontmatter ? frontmatter.split(/\r?\n/) : [];
        const normalizedFrontmatterLines =
            frontmatterLines.length && frontmatterLines[frontmatterLines.length - 1] === ''
                ? frontmatterLines.slice(0, -1)
                : frontmatterLines;
        const lines = [...normalizedFrontmatterLines, ...content.split(/\r?\n/)];
        const frontmatterLength = normalizedFrontmatterLines.length;
        return { lines, frontmatterLength };
	}


    // get cursor positions
    private getCursorPositions(targetLevel: number, indentLevels: number[]) {
        const cursorPositions: number[] = [];
        for (let i = 0; i < indentLevels.length; i++) {
            if (indentLevels[i] === targetLevel && indentLevels[i+1] == targetLevel + 1) {
                cursorPositions.push(i);
            }
        }
        return cursorPositions;
    }

    // 

    /**
     * Fold all items at a specific indentation level
     * @param editor - The Obsidian editor instance
     * @param level - The indentation level to fold (1-5)
     */
    async foldSpecificLevel(editor: Editor, level: number): Promise<void> {
        try {
            // unfold all
            editor.exec('unfoldAll');

            // get lines
            const result = await this.splitContent();
            if (result.lines.length === 0) {
                return;
            }

            // get indent levels list using the shared utility function
            const tabSize = (this.app as any).vault.getConfig("tabSize") ?? 4;
            const indentLevels = calculateIndentLevels(result.lines, result.frontmatterLength, tabSize);

            // get cursor positions (line numbers)
            const cursorPositions = this.getCursorPositions(level, indentLevels);

            if (cursorPositions.length === 0) {
                new Notice(`No items found at level ${level}`);
                return;
            }

            // get current cursor and determine return cursor position
            const currentCursorPosition = editor.getCursor();
            const currentLineNumber = currentCursorPosition.line;
            const currentLineIndentLevel = indentLevels[currentLineNumber];
            let returnCursorPosition = currentCursorPosition;

            if (currentLineIndentLevel > level) {
                // get the nearest cursor position line number that is less than current line number
                const validPositions = cursorPositions.filter(pos => pos < currentLineNumber);
                if (validPositions.length > 0) {
                    const returnCursorLine = Math.max(...validPositions);
                    returnCursorPosition = {
                        line: returnCursorLine,
                        ch: editor.getLine(returnCursorLine)?.length || 0
                    };
                }
            }

            // set cursor positions
            const selections = cursorPositions.map(i => ({
                anchor: { line: i, ch: 0 },
                head: { line: i, ch: editor.getLine(i)?.length || 0 }
            }));
            editor.setSelections(selections);

            // fold the indentlevel
            (this.app as any).commands.executeCommandById('editor:fold-more');

            // set cursor to the nearest cursor position
            editor.setCursor(returnCursorPosition);
            requestAnimationFrame(() => {
                editor.scrollIntoView({ from: returnCursorPosition, to: returnCursorPosition }, true);
            });

        } catch (error) {
            console.error('Error in foldSpecificLevel:', error);
            new Notice(`Error occurred while folding: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async onload(): Promise<void> {

        for (let i = 1; i <= 5; i++) {
        this.plugin.addCommand({
            id: `fold-level${i}`,
            name: `Fold all of indentation level ${i}`,
            editorCallback: async (editor: Editor) => {
                    await this.foldSpecificLevel(editor, i);
                }
            });
        }
    }
}
