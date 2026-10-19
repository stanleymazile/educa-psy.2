import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const htmlFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file.endsWith('.html'));

const input = {};
for (const file of htmlFiles) {
  const name = file.replace(/\.html$/, '');
  input[name] = resolve(__dirname, file);
}

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input,
    },
  },
});
