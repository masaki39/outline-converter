export function parseFrontmatter(fileContent: string): { frontmatter: string, content: string } {
    // 最初の文字が'---'で始まらない場合は早期リターン
    if (!fileContent.startsWith('---\n')) {
        return {
            frontmatter: '',
            content: fileContent
        };
    }

    // 2つ目の'---'を探す
    const secondDelimiterIndex = fileContent.indexOf('\n---\n', 4);
    if (secondDelimiterIndex === -1) {
        return {
            frontmatter: '',
            content: fileContent
        };
    }

    return {
        frontmatter: fileContent.slice(0, secondDelimiterIndex + 5), // ---\nまで含める
        content: fileContent.slice(secondDelimiterIndex + 5)         // 残りの部分
    };
}

/**
 * Calculate indent levels for each line
 * @param lines - Array of lines to process
 * @param frontmatterLength - Number of frontmatter lines to skip
 * @param tabSize - Tab size for calculating indent levels (default: 4)
 * @returns Array of indent levels (0 for frontmatter, 1+ for list items)
 */
export function calculateIndentLevels(
    lines: string[],
    frontmatterLength: number = 0,
    tabSize: number = 4
): number[] {
    const indentLevels: number[] = [];

    for (let i = 0; i < lines.length; i++) {
        // Set frontmatter lines to level 0
        if (i < frontmatterLength) {
            indentLevels.push(0);
            continue;
        }

        const line = lines[i];
        let level = 0;

        // Check for tab-indented list items
        const matchTabs = line.match(/^(\t*)- /);
        if (matchTabs) {
            level = matchTabs[1].length + 1;
            indentLevels.push(level);
            continue;
        }

        // Check for space-indented list items
        const matchSpaces = line.match(/^( *)- /);
        if (matchSpaces) {
            const leadingSpaces = matchSpaces[1].length;
            level = Math.floor(leadingSpaces / tabSize) + 1;
            indentLevels.push(level);
            continue;
        }

        // Not a list item
        indentLevels.push(0);
    }

    return indentLevels;
}

/**
 * Filter out ignored lines (lines with indent level -1)
 * @param lines - Array of lines
 * @param indentLevels - Array of indent levels
 * @returns Object containing filtered lines and their indent levels
 */
export function filterIgnoredLines(
    lines: string[],
    indentLevels: number[]
): { filteredLines: string[], filteredLevels: number[] } {
    const filteredLines: string[] = [];
    const filteredLevels: number[] = [];

    for (let i = 0; i < lines.length; i++) {
        if (indentLevels[i] !== -1) {
            filteredLines.push(lines[i]);
            filteredLevels.push(indentLevels[i]);
        }
    }

    return { filteredLines, filteredLevels };
}