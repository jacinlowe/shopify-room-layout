/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
    test: {
        setupFiles: ['./__test__/setup.ts'],
        environment: 'jsdom'
    },
});
