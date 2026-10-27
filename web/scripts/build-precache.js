// Generato a ogni build: l'impronta cambia quando cambia un qualsiasi asset della PWA.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function files(dir) {
  const entries = await readdir(path.join(web, dir), { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const name = `${dir}/${entry.name}`;
    return entry.isDirectory() ? files(name) : Promise.resolve([name]);
  }))).flat();
}
const assets = ['index.html', 'graph.json', 'favicon.svg', 'manifest.webmanifest',
  ...(await Promise.all(['css', 'js', 'modules', 'vendor', 'icons'].map(files))).flat()].sort();
const hash = createHash('sha256');
for (const name of [...assets, 'sw.js']) {
  hash.update(name); hash.update(await readFile(path.join(web, name)));
}
const version = hash.digest('hex').slice(0, 16);
const urls = ['./', ...assets.map((name) => `./${name}`)];
await writeFile(path.join(web, 'precache-manifest.js'),
  `// Generato da scripts/build-precache.js. Non modificare.\nself.PRECACHE_VERSION = ${JSON.stringify(version)};\nself.PRECACHE_URLS = ${JSON.stringify(urls)};\n`);
console.log(`Cache PWA ${version}: ${urls.length} risorse`);
