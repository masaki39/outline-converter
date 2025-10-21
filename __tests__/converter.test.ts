import { applyReplacements, transformLines, autoHeaderTransform } from '../src/converter';
import { OutlineConverterSettings, DEFAULT_SETTINGS } from '../src/settings';

describe('applyReplacements', () => {
	let settings: OutlineConverterSettings;

	beforeEach(() => {
		settings = { ...DEFAULT_SETTINGS };
	});

	it('should apply simple string replacement', () => {
		settings.beforeReplace1 = 'foo';
		settings.afterReplace1 = 'bar';
		settings.enableRegex1 = false;

		const result = applyReplacements('foo foo foo', settings);
		expect(result).toBe('bar bar bar');
	});

	it('should apply regex replacement', () => {
		settings.beforeReplace1 = '\\d+';
		settings.afterReplace1 = 'X';
		settings.enableRegex1 = true;

		const result = applyReplacements('Test 123 and 456', settings);
		expect(result).toBe('Test X and X');
	});

	it('should apply multiple replacements in order', () => {
		settings.beforeReplace1 = 'foo';
		settings.afterReplace1 = 'bar';
		settings.enableRegex1 = false;
		settings.beforeReplace2 = 'bar';
		settings.afterReplace2 = 'baz';
		settings.enableRegex2 = false;

		const result = applyReplacements('foo', settings);
		expect(result).toBe('baz');
	});

	it('should escape special regex characters in non-regex mode', () => {
		settings.beforeReplace1 = '$100';
		settings.afterReplace1 = '$200';
		settings.enableRegex1 = false;

		const result = applyReplacements('Price: $100', settings);
		expect(result).toBe('Price: $200');
	});

	it('should throw error on invalid regex', () => {
		settings.beforeReplace1 = '[invalid(regex';
		settings.afterReplace1 = 'replacement';
		settings.enableRegex1 = true;

		expect(() => applyReplacements('test', settings)).toThrow();
	});
});

describe('transformLines', () => {
	it('should transform lines with custom transformers', () => {
		const lines = ['- Item 1', '\t- Item 2', '\t\t- Item 3'];
		const indentLevels = [1, 2, 3];
		const transformers = [
			(line: string) => `L1: ${line}`,
			(line: string) => `L2: ${line}`,
			(line: string) => `L3: ${line}`,
		];

		const result = transformLines(lines, indentLevels, transformers);
		expect(result).toBe('L1: Item 1L2: Item 2L3: Item 3');
	});

	it('should skip lines with indent level 0', () => {
		const lines = ['Frontmatter', '- Item 1'];
		const indentLevels = [0, 1];
		const transformers = [(line: string) => `L1: ${line}`];

		const result = transformLines(lines, indentLevels, transformers);
		expect(result).toBe('L1: Item 1');
	});

	it('should handle empty result', () => {
		const lines = ['Frontmatter'];
		const indentLevels = [0];
		const transformers: Array<(line: string) => string> = [];

		const result = transformLines(lines, indentLevels, transformers);
		expect(result).toBe('');
	});
});

describe('autoHeaderTransform', () => {
	it('should create headers for items with children', () => {
		const lines = ['- Parent', '\t- Child'];
		const indentLevels = [1, 2];

		const result = autoHeaderTransform(lines, indentLevels, 'h1', '\n');
		expect(result).toContain('# Parent');
	});

	it('should start at h2 when specified', () => {
		const lines = ['- Parent', '\t- Child'];
		const indentLevels = [1, 2];

		const result = autoHeaderTransform(lines, indentLevels, 'h2', '\n');
		expect(result).toContain('## Parent');
	});

	it('should add spacing between items at same level', () => {
		const lines = ['- Item 1', '- Item 2'];
		const indentLevels = [1, 1];

		const result = autoHeaderTransform(lines, indentLevels, 'h1', ' | ');
		expect(result).toContain('Item 1 | Item 2');
	});

	it('should handle items with grandchildren', () => {
		const lines = ['- Parent', '\t- Child', '\t\t- Grandchild'];
		const indentLevels = [1, 2, 3];

		const result = autoHeaderTransform(lines, indentLevels, 'h1', '\n');
		// Parent has grandchildren, should be header
		expect(result).toContain('# Parent');
		// Child has children (grandchild), should be header
		expect(result).toContain('## Child');
	});

	it('should skip frontmatter lines', () => {
		const lines = ['---', 'title: Test', '---', '- Item'];
		const indentLevels = [0, 0, 0, 1];

		const result = autoHeaderTransform(lines, indentLevels, 'h1', '\n');
		expect(result).not.toContain('---');
		expect(result).toContain('Item');
	});

	it('should exclude frontmatter with lists from conversion', () => {
		const lines = [
			'---',
			'tags:',
			'  - tag1',
			'  - tag2',
			'---',
			'- Real Item'
		];
		const indentLevels = [0, 0, 0, 0, 0, 1];

		const result = autoHeaderTransform(lines, indentLevels, 'h1', '\n');
		expect(result).not.toContain('tag1');
		expect(result).not.toContain('tag2');
		expect(result).toContain('Real Item');
	});
});
