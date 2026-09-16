// SPDX-FileCopyrightText: 2026 Thomas Steiner
// SPDX-License-Identifier: Apache-2.0

// Gives every file under _site/{static,fonts,css,js} a content-hashed copy
// (`main.css` -> `main.0123456789.css`) and points the site at the copies, so
// they can be cached forever while an edit still reaches everyone on the next
// page load. The unhashed originals stay published for anything that links to
// them from outside.
//
// Runs after Eleventy and the minifiers, before Pagefind:
//
//   1. static/ and fonts/: reference nothing, so they are hashed as they are.
//   2. CSS: its url()s are rewritten to the hashed static files, then hashed.
//   3. JS: its references to static files are rewritten, then hashed. Imports
//      are *not* rewritten. The modules import each other in a cycle
//      (script.mjs -> share.mjs -> script.mjs), so no order exists in which
//      each hash could include its dependencies' final names. An import map
//      in every page resolves `/js/script.mjs` to the hashed file instead, for
//      static imports, dynamic imports, and relative imports alike.
//   4. HTML and the web app manifest: references are rewritten, and the
//      import map goes in right after <meta charset>, ahead of every module.
//
// Hashes cover a file's contents after its own references were rewritten, so
// changing an icon changes the name of the CSS that uses it, too.

import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const SITE = '_site';
const HASH_LENGTH = 10;
const HASHED = new RegExp(`\\.[0-9a-f]{${HASH_LENGTH}}\\.[^./]+$`);

const walk = async (dir) => {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    })
  );
  return files.flat();
};

const urlOf = (path) => `/${relative(SITE, path).split('\\').join('/')}`;

// Re-running over an already processed _site must not hash the hashed copies.
const sources = async (...dirs) =>
  (await Promise.all(dirs.map((dir) => walk(join(SITE, dir)))))
    .flat()
    .filter((path) => !HASHED.test(path))
    .sort();

// original URL -> hashed URL
const renamed = new Map();

// Only whole root-relative URLs in quotes, parentheses, or after `=`, so a
// longer path that merely starts with a known one is left alone.
const rewriter = () => {
  if (!renamed.size) return (text) => text;
  const alternatives = [...renamed.keys()]
    .sort((a, b) => b.length - a.length)
    .map((url) => url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const pattern = new RegExp(
    `(?<=["'(=])(?:${alternatives})(?=["')?#\\s>])`,
    'g'
  );
  return (text) => text.replace(pattern, (url) => renamed.get(url));
};

const hashFile = async (path, rewrite) => {
  let contents = await readFile(path);
  if (rewrite) {
    const text = contents.toString('utf8');
    const rewritten = rewrite(text);
    if (rewritten !== text) {
      contents = Buffer.from(rewritten, 'utf8');
      // The original keeps working and benefits from the hashed references.
      await writeFile(path, contents);
    }
  }
  const hash = createHash('sha256')
    .update(contents)
    .digest('hex')
    .slice(0, HASH_LENGTH);
  const ext = extname(path);
  const hashedPath = `${path.slice(0, -ext.length || undefined)}.${hash}${ext}`;
  await writeFile(hashedPath, contents);
  renamed.set(urlOf(path), urlOf(hashedPath));
};

// 1. Leaf files.
for (const path of await sources('static', 'fonts')) {
  await hashFile(path);
}

// 2 and 3. Stylesheets, then scripts, each rewritten against the leaves only.
const leaves = rewriter();
const assets = await sources('css', 'js');
const isCss = (path) => extname(path) === '.css';
const isJs = (path) => ['.js', '.mjs'].includes(extname(path));
for (const path of assets.filter(isCss)) {
  await hashFile(path, leaves);
}
for (const path of assets.filter(isJs)) {
  await hashFile(path, leaves);
}
for (const path of assets.filter((path) => !isCss(path) && !isJs(path))) {
  await hashFile(path);
}

const importMap = JSON.stringify({
  imports: Object.fromEntries([...renamed].filter(([url]) => isJs(url))),
});
const importMapTag = `<script type="importmap">${importMap}</script>`;

// 4. Pages. Code samples in posts can quote these paths, so <pre> and <code>
// are left exactly as written.
const everything = rewriter();
const pages = (await walk(SITE)).filter(
  (path) =>
    !path.startsWith(join(SITE, 'pagefind')) &&
    ['.html', '.webmanifest'].includes(extname(path))
);
const CHARSET = /<meta charset="?utf-8"?>/i;
let mapped = 0;
const CODE = /(<(pre|code)\b[\s\S]*?<\/\2>)/gi;
for (const path of pages) {
  const text = await readFile(path, 'utf8');
  let result = text
    .split(CODE)
    .map((part, i) => {
      // split() with two capture groups yields [text, block, tagName, ...].
      if (i % 3 === 1) return part;
      if (i % 3 === 2) return '';
      return everything(part);
    })
    .join('');
  // Pages that do not come from the layout (a stray test.html under images/)
  // have no <meta charset> and load no modules; they only get the rewrite.
  if (extname(path) === '.html' && CHARSET.test(result)) {
    result = result.replace(CHARSET, (tag) => tag + importMapTag);
    mapped++;
  }
  if (result !== text) await writeFile(path, result);
}

// Without the map, hashed pages would load unhashed imports, and the modules
// that import each other would run twice. Fail the build instead.
const home = await readFile(join(SITE, 'index.html'), 'utf8');
if (!home.includes(importMapTag)) {
  throw new Error('_site/index.html did not get the import map');
}

console.log(
  `[hashAssets] hashed ${renamed.size} files, rewrote ${pages.length} pages, ${mapped} with the import map`
);
