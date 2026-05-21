import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['__tests__/**/*.test.ts'],
	},
	resolve: {
		alias: {
			'obsidian': path.resolve(__dirname, './__mocks__/obsidian.ts'),
		},
	},
});
