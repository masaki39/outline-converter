import { parseFrontmatter, calculateIndentLevels, filterIgnoredLines } from '../src/utilis';

describe('parseFrontmatter', () => {
	it('should parse frontmatter correctly', () => {
		const content = '---\ntitle: Test\n---\nContent here';
		const result = parseFrontmatter(content);
		expect(result.frontmatter).toBe('---\ntitle: Test\n---\n');
		expect(result.content).toBe('Content here');
	});

	it('should handle content without frontmatter', () => {
		const content = 'Just content';
		const result = parseFrontmatter(content);
		expect(result.frontmatter).toBe('');
		expect(result.content).toBe('Just content');
	});

	it('should handle incomplete frontmatter', () => {
		const content = '---\ntitle: Test\nNo closing delimiter';
		const result = parseFrontmatter(content);
		expect(result.frontmatter).toBe('');
		expect(result.content).toBe(content);
	});
});

describe('calculateIndentLevels', () => {
	it('should calculate indent levels for tab-indented lists', () => {
		const lines = [
			'- Level 1',
			'\t- Level 2',
			'\t\t- Level 3',
		];
		const result = calculateIndentLevels(lines, 0, 4);
		expect(result).toEqual([1, 2, 3]);
	});

	it('should calculate indent levels for space-indented lists', () => {
		const lines = [
			'- Level 1',
			'    - Level 2',
			'        - Level 3',
		];
		const result = calculateIndentLevels(lines, 0, 4);
		expect(result).toEqual([1, 2, 3]);
	});

	it('should ignore frontmatter lines', () => {
		const lines = [
			'---',
			'title: Test',
			'---',
			'- Level 1',
			'\t- Level 2',
		];
		const result = calculateIndentLevels(lines, 3, 4);
		expect(result).toEqual([0, 0, 0, 1, 2]);
	});

	it('should mark comment lines as 1', () => {
		const lines = [
			'- Level 1',
			'- // This is a comment',
			'\t- Level 2',
		];
		const result = calculateIndentLevels(lines, 0, 4);
		expect(result).toEqual([1, 1, 2]);
	});

	it('should mark indented comment lines as 2', () => {
		const lines = [
			'- Level 1',
			'\t- // This is an indented comment',
			'\t- Level 2',
		];
		const result = calculateIndentLevels(lines, 0, 4);
		expect(result).toEqual([1, 2, 2]);
	});

	it('should handle non-list lines', () => {
		const lines = [
			'- Level 1',
			'Not a list item',
			'\t- Level 2',
		];
		const result = calculateIndentLevels(lines, 0, 4);
		expect(result).toEqual([1, 0, 2]);
	});

	it('should handle empty lines', () => {
		const lines = [
			'- Level 1',
			'',
			'\t- Level 2',
		];
		const result = calculateIndentLevels(lines, 0, 4);
		expect(result).toEqual([1, 0, 2]);
	});
});

describe('filterIgnoredLines', () => {
	it('should filter out ignored lines', () => {
		const lines = ['Line 1', 'Line 2', 'Line 3', 'Line 4'];
		const indentLevels = [1, -1, 2, 1];
		const result = filterIgnoredLines(lines, indentLevels);
		expect(result.filteredLines).toEqual(['Line 1', 'Line 3', 'Line 4']);
		expect(result.filteredLevels).toEqual([1, 2, 1]);
	});

	it('should handle no ignored lines', () => {
		const lines = ['Line 1', 'Line 2'];
		const indentLevels = [1, 2];
		const result = filterIgnoredLines(lines, indentLevels);
		expect(result.filteredLines).toEqual(['Line 1', 'Line 2']);
		expect(result.filteredLevels).toEqual([1, 2]);
	});

	it('should handle all ignored lines', () => {
		const lines = ['Line 1', 'Line 2'];
		const indentLevels = [-1, -1];
		const result = filterIgnoredLines(lines, indentLevels);
		expect(result.filteredLines).toEqual([]);
		expect(result.filteredLevels).toEqual([]);
	});
});
