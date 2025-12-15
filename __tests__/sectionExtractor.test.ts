import { SectionExtractor } from '../src/sectionExtractor';

jest.mock('obsidian');

class MockVault {
	content: string;
	read = jest.fn();

	constructor(content: string) {
		this.content = content;
		this.read.mockResolvedValue(content);
	}
}

class MockWorkspace {
	getActiveFile = jest.fn().mockReturnValue({});
}

const buildApp = (content: string) => {
	const vault = new MockVault(content);
	const workspace = new MockWorkspace();
	return { vault, workspace };
};

describe('SectionExtractor', () => {
	it('returns null when section not found', async () => {
		const app = buildApp('# A\ncontent');
		const extractor = new SectionExtractor(app as any);
		await expect(extractor.extractSectionContent('Missing')).resolves.toBeNull();
	});

	it('extracts content of the first matching section when multiple exist', async () => {
		const content = ['# A', 'one', '## B', 'two', '# A', 'three'].join('\n');
		const app = buildApp(content);
		const extractor = new SectionExtractor(app as any);

		const result = await extractor.extractSectionContent('A');
		expect(result).toBe('one\n## B\ntwo');
	});

	it('extracts until EOF when the section is last', async () => {
		const content = ['# A', 'one', '## B', 'two', 'three'].join('\n');
		const app = buildApp(content);
		const extractor = new SectionExtractor(app as any);

		const result = await extractor.extractSectionContent('B');
		expect(result).toBe('two\nthree');
	});

	it('trims leading and trailing empty lines inside the section', async () => {
		const content = ['# A', '', 'line', '', ''].join('\n');
		const app = buildApp(content);
		const extractor = new SectionExtractor(app as any);

		const result = await extractor.extractSectionContent('A');
		expect(result).toBe('line');
	});
});
