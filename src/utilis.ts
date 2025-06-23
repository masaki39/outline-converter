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