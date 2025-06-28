import { App, Editor, Plugin, Notice } from "obsidian";
import { parseFrontmatter } from "./utilis";

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
        const lines = [...frontmatter.split(/\r?\n/).slice(0, -1), ...content.split(/\r?\n/)];
        const frontmatterLength = frontmatter.split(/\r?\n/).slice(0, -1).length;
        return { lines, frontmatterLength };
	}

        // calculate indent levels
    private calculateIndentLevels(lines: string[], frontmatterLength: number, tabSize: number = (this.app as any).vault.getConfig("tabSize") ?? 4): number[]{        
        let indentLevels: number[] = [];
    
        // Determine the index to start processing from (ignore frontmatter)
        for (let i = 0; i < lines.length; i++) {
            if (i < frontmatterLength) {
                indentLevels.push(0);  // Set front matter lines to level 0
                continue;
            }
        
            const line = lines[i];
            let level = 0;
            const matchTabs = line.match(/^(\t*)- /);
            const matchSpaces = line.match(/^( *)- /);
            if (matchTabs) {
                level = matchTabs[1].length + 1;
            } else if (matchSpaces) {
                const leadingSpaces = matchSpaces[1].length;
                level = Math.floor(leadingSpaces / tabSize) + 1;
            }
            indentLevels.push(level);
        }
    
        return indentLevels;
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

    // fold specific level
    async foldSpecificLevel(editor: Editor, level: number): Promise<void> {
        try {

            // unfold all
            editor.exec('unfoldAll');

            // get lines
            const result = await this.splitContent();
            if (result.lines.length === 0) {
                return;
            }
            
            // get indent levels list
            const indentLevels = this.calculateIndentLevels(result.lines, result.frontmatterLength);

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
                const returnCursorLine = Math.max(...cursorPositions.filter(pos => pos < currentLineNumber)); 
                returnCursorPosition = {
                    line: returnCursorLine,
                    ch: editor.getLine(returnCursorLine)?.length || 0
                };
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
            editor.scrollIntoView({ from: returnCursorPosition, to: returnCursorPosition }, true);

        } catch (error) {
            console.error('Error in foldSpecificLevel:', error);
            new Notice('Error occurred while folding');
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
