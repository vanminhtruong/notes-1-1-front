import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const project = fileURLToPath(new URL('../', import.meta.url));
const root = join(project, 'dist');
const paths = ['/', '/index.html', '/manifest.webmanifest', '/offline-icon-192.png', '/offline-icon-512.png'];
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) { await visit(file); continue; }
    if (!/\.(?:js|css)$/.test(entry.name)) continue;
    paths.push('/' + relative(root, file).replaceAll('\\', '/'));
  }
}
await visit(join(root, 'assets'));
const assets = [...new Set(paths)];
const hash = createHash('sha256').update(assets.join('|')).digest('hex').slice(0, 14);
const template = await readFile(join(project, 'scripts/sw-template.js'), 'utf8');
const sw = template.replace('__CACHE__', JSON.stringify('plant-notes-shell-' + hash))
  .replace('__ASSETS__', JSON.stringify(assets));
await writeFile(join(root, 'sw.js'), sw);
console.log('[PWA] Generated service worker for', assets.length, 'static files');
