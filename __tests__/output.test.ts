import { OutputHandler } from '../src/output';
import { parseFrontmatter } from '../src/utilis';

jest.mock('obsidian');

class MockVault {
	content: string;
	read = jest.fn();
	append = jest.fn();

	constructor(content: string) {
		this.content = content;
		this.read.mockResolvedValue(content);
	}
}

class MockWorkspace {
	getActiveFile = jest.fn().mockReturnValue({});
}

class MockEditor {
	replaceRange = jest.fn();
	setCursor = jest.fn();
}

const buildApp = (content: string) => {
	const vault = new MockVault(content);
	const workspace = new MockWorkspace();
	return { vault, workspace };
};

describe('outputToSection', () => {
	it('replaces an existing section at any heading level and stops at next same-or-higher level', async () => {
		const content = [
			'---',
			'title: Test',
			'---',
			'# Intro',
			'Intro text',
			'## Target',
			'old',
			'### Child',
			'keep',
			'# End',
			'',
		].join('\n');

		const app = buildApp(content);
		const editor = new MockEditor();
		const handler = new OutputHandler(app as any);

		await handler.outputToSection(editor as any, 'Target', 'NEW');

		const { frontmatter, content: body } = parseFrontmatter(content);
		const frontmatterLines = frontmatter ? frontmatter.split(/\r?\n/) : [];
		const normalizedFrontmatterLines =
			frontmatterLines.length && frontmatterLines[frontmatterLines.length - 1] === ''
				? frontmatterLines.slice(0, -1)
				: frontmatterLines;
		const lines = [...normalizedFrontmatterLines, ...body.split(/\r?\n/)];

		expect(editor.replaceRange).toHaveBeenCalledWith(
			'NEW',
			{ line: 6, ch: 0 },
			{ line: 8, ch: lines[8].length }
		);
		expect(editor.setCursor).toHaveBeenCalledWith(6, 0);
		expect(app.vault.append).not.toHaveBeenCalled();
	});

	it('replaces a section when the next header is immediately after', async () => {
		const content = ['## Target', '# Next'].join('\n');
		const app = buildApp(content);
		const editor = new MockEditor();
		const handler = new OutputHandler(app as any);

		await handler.outputToSection(editor as any, 'Target', 'NEW');

		expect(editor.replaceRange).toHaveBeenCalledWith(
			'NEW',
			{ line: 1, ch: 0 },
			{ line: 1, ch: 0 }
		);
	});

	it('replaces until file end when no following header exists', async () => {
		const content = ['# Intro', 'text', '## Target', 'old line 1', 'old line 2'].join('\n');
		const app = buildApp(content);
		const editor = new MockEditor();
		const handler = new OutputHandler(app as any);

		await handler.outputToSection(editor as any, 'Target', 'NEW');

		expect(editor.replaceRange).toHaveBeenCalledWith(
			'NEW',
			{ line: 3, ch: 0 },
			{ line: 4, ch: 'old line 2'.length }
		);
	});

	it('inserts a new section after frontmatter when heading is missing', async () => {
		const content = ['---', 'title: Test', '---', 'Body line'].join('\n');

		const app = buildApp(content);
		const editor = new MockEditor();
		const handler = new OutputHandler(app as any);

		await handler.outputToSection(editor as any, 'New Section', 'NEW');

		expect(editor.replaceRange).toHaveBeenCalledWith(
			'# New Section\nNEW\n\n',
			{ line: 3, ch: 0 },
			{ line: 3, ch: 0 }
		);
		expect(editor.setCursor).toHaveBeenCalledWith(3, 0);
		expect(app.vault.append).not.toHaveBeenCalled();
	});
});
