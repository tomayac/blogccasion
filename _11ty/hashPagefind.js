// SPDX-FileCopyrightText: 2026 Thomas Steiner
// SPDX-License-Identifier: Apache-2.0

// Gives the Pagefind files the site loads content-hashed copies
// (`/pagefind/pagefind.js` -> `/pagefind/pagefind.0123456789.js`), so they can
// be cached forever like the assets _11ty/hashAssets.js handles. The index
// shards and metadata already carry a hash, so after this the only
// revalidated request search makes is the page itself.
//
// Runs after Pagefind, which only writes its files once _11ty/hashAssets.js is
// done. The files reference each other by fixed names, so each hashed copy
// points at the hashed copies of what it loads, and is hashed after that:
//
//   1. wasm.<lang>.pagefind: Pagefind builds its URL from the `wasm` field of
//      pagefind-entry.json, so the field gets the hash: `en` -> `en.0123456789`.
//   2. pagefind-entry.json: hashed after that field changed. It names the
//      hashed index metadata, so a new index changes its name, too.
//   3. pagefind-worker.js: does the fetching when workers are available, so
//      its `pagefind-entry.json` is rewritten.
//   4. pagefind.js: both `pagefind-entry.json` (for browsers without workers)
//      and `pagefind-worker.js` are rewritten.
//   5. pagefind-ui.js: references nothing that needs rewriting.
//
// pagefind.js is reached through the import map hashAssets.js already put in
// every page, which covers both ways the site loads it: js/search-tools.mjs
// imports `/pagefind/pagefind.js`, and pagefind-ui.js imports
// `${bundlePath}pagefind.js`. Import maps apply to dynamic imports from
// classic scripts, too. pagefind-ui.js is a classic script, so its `src` is
// rewritten in the pages.
//
// Pagefind normally finds its bundle by matching its own URL against
// `pagefind.js`, which the hashed name does not. The callers therefore pass
// `basePath: '/pagefind/'` explicitly; without it, Pagefind would fall back to
// the same default, but warn in the console. They also pass a constant
// `metaCacheTag`, because Pagefind otherwise appends `?ts=${Date.now()}` to
// the entry JSON's URL, and no copy of it would ever be reused.
//
// The rewrites match strings in Pagefind's generated code, which a Pagefind
// upgrade may change. Each must match exactly once, or the build fails.
//
// The unhashed originals stay published and untouched, and keep loading each
// other, for anything that links to them from outside.

import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

// Same scheme as _11ty/hashAssets.js, which Caddy and the deploy script expect.
const SITE = '_site';
const HASH_LENGTH = 10;
const PAGEFIND = join(SITE, 'pagefind');

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    })
  );
  return files.flat();
};

const hashOf = (contents) =>
  createHash('sha256').update(contents).digest('hex').slice(0, HASH_LENGTH);

/** Writes `contents` as `<stem>.<hash><extension>` and returns that name. */
const writeHashed = async (stem, extension, contents) => {
  const name = `${stem}.${hashOf(contents)}${extension}`;
  await writeFile(join(PAGEFIND, name), contents);
  return name;
};

/** Replaces the one occurrence of `from` in `file`'s `text`, or throws. */
const replaceOnce = (text, from, to, file) => {
  const parts = text.split(from);
  if (parts.length !== 2) {
    throw new Error(
      `Expected ${from} exactly once in ${file}, found it ` +
        `${parts.length - 1} times. Did a Pagefind upgrade change it?`
    );
  }
  return parts.join(to);
};

const read = (name) => readFile(join(PAGEFIND, name), 'utf8');

// 1. and 2. The WebAssembly modules, then the entry that names them.
const entry = JSON.parse(await read('pagefind-entry.json'));
for (const language of Object.values(entry.languages)) {
  if (!language.wasm) continue;
  const wasm = await readFile(join(PAGEFIND, `wasm.${language.wasm}.pagefind`));
  language.wasm = `${language.wasm}.${hashOf(wasm)}`;
  await writeFile(join(PAGEFIND, `wasm.${language.wasm}.pagefind`), wasm);
}
const entryName = await writeHashed(
  'pagefind-entry',
  '.json',
  JSON.stringify(entry)
);

// The template literals Pagefind builds these URLs with, closing backtick
// included, so nothing else that mentions the names can match.
const ENTRY_REF = 'pagefind-entry.json`';
const WORKER_REF = 'pagefind-worker.js`';

// 3. The worker.
const workerName = await writeHashed(
  'pagefind-worker',
  '.js',
  replaceOnce(
    await read('pagefind-worker.js'),
    ENTRY_REF,
    `${entryName}\``,
    'pagefind-worker.js'
  )
);

// 4. The entry module.
let pagefind = await read('pagefind.js');
pagefind = replaceOnce(pagefind, ENTRY_REF, `${entryName}\``, 'pagefind.js');
pagefind = replaceOnce(pagefind, WORKER_REF, `${workerName}\``, 'pagefind.js');
const pagefindName = await writeHashed('pagefind', '.js', pagefind);

// 5. The UI.
const uiName = await writeHashed(
  'pagefind-ui',
  '.js',
  await read('pagefind-ui.js')
);

const ENTRY_URL = '/pagefind/pagefind.js';
const hashedUrl = `/pagefind/${pagefindName}`;
// Matches the attribute alone, so the tag can carry others, like `defer`.
const UI_SRC = 'src="/pagefind/pagefind-ui.js"';
const hashedUiSrc = `src="/pagefind/${uiName}"`;

// hashAssets.js writes the map right after <meta charset>, so the first match
// is it. Posts that show an import map or a script tag in a code sample have
// them escaped.
const IMPORT_MAP = /<script type="importmap">([\s\S]*?)<\/script>/;
const pages = (await walk(SITE)).filter(
  (path) => !path.startsWith(PAGEFIND) && extname(path) === '.html'
);
let mapped = 0;
for (const path of pages) {
  const text = await readFile(path, 'utf8');
  const match = text.match(IMPORT_MAP);
  if (!match) continue;
  const map = JSON.parse(match[1]);
  map.imports = { ...map.imports, [ENTRY_URL]: hashedUrl };
  const tag = `<script type="importmap">${JSON.stringify(map)}</script>`;
  const result = text
    .replace(IMPORT_MAP, () => tag)
    .replaceAll(UI_SRC, hashedUiSrc);
  if (result !== text) await writeFile(path, result);
  mapped++;
}

// The home page has the search box. If it still loads an original, search
// would work, but from uncached files. Fail the build instead.
const home = await readFile(join(SITE, 'index.html'), 'utf8');
if (!home.includes(`"${ENTRY_URL}":"${hashedUrl}"`)) {
  throw new Error(
    `_site/index.html did not get ${hashedUrl} in its import map`
  );
}
if (!home.includes(hashedUiSrc)) {
  throw new Error(`_site/index.html does not load /pagefind/${uiName}`);
}

console.log(
  `[hashPagefind] ${ENTRY_URL} -> ${hashedUrl} in ${mapped} import maps, ` +
    `with ${workerName}, ${entryName}, and ${uiName}`
);
