// SPDX-FileCopyrightText: 2026 Thomas Steiner
// SPDX-License-Identifier: Apache-2.0

// Gives Pagefind's entry module a content-hashed copy
// (`/pagefind/pagefind.js` -> `/pagefind/pagefind.0123456789.js`), so it can
// be cached forever like the assets _11ty/hashAssets.js handles.
//
// Runs after Pagefind, which only writes pagefind.js once _11ty/hashAssets.js
// is done. So instead of rewriting references, this adds one entry to the
// import map hashAssets.js already put in every page. Both ways the site loads
// the module go through it: js/search-tools.mjs imports
// `/pagefind/pagefind.js`, and pagefind-ui.js imports `${bundlePath}pagefind.js`.
// Import maps apply to dynamic imports from classic scripts, too.
//
// pagefind.js normally finds its bundle by matching its own URL against
// `pagefind.js`, which the hashed name does not. The callers therefore pass
// `basePath: '/pagefind/'` explicitly; without it, Pagefind would fall back
// to the same default, but warn in the console.
//
// The other Pagefind files keep their names: the index shards and metadata
// already carry a hash, and pagefind-entry.json, pagefind-worker.js, and
// pagefind-ui.js must always be revalidated.

import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

// Same scheme as _11ty/hashAssets.js, which Caddy and the deploy script expect.
const SITE = '_site';
const HASH_LENGTH = 10;

const ENTRY_URL = '/pagefind/pagefind.js';
const entryPath = join(SITE, 'pagefind', 'pagefind.js');

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

// pagefind.js is never touched, so re-running yields the same hash.
const contents = await readFile(entryPath);
const hash = createHash('sha256')
  .update(contents)
  .digest('hex')
  .slice(0, HASH_LENGTH);
const hashedUrl = ENTRY_URL.replace(/\.js$/, `.${hash}.js`);
await writeFile(join(SITE, hashedUrl), contents);

// hashAssets.js writes the map right after <meta charset>, so the first match
// is it. Posts that show an import map in a code sample have it escaped.
const IMPORT_MAP = /<script type="importmap">([\s\S]*?)<\/script>/;
const pages = (await walk(SITE)).filter(
  (path) =>
    !path.startsWith(join(SITE, 'pagefind')) && extname(path) === '.html'
);
let mapped = 0;
for (const path of pages) {
  const text = await readFile(path, 'utf8');
  const match = text.match(IMPORT_MAP);
  if (!match) continue;
  const map = JSON.parse(match[1]);
  map.imports = { ...map.imports, [ENTRY_URL]: hashedUrl };
  const tag = `<script type="importmap">${JSON.stringify(map)}</script>`;
  const result = text.replace(IMPORT_MAP, () => tag);
  if (result !== text) await writeFile(path, result);
  mapped++;
}

// The home page has the search box. If its map lacks the entry, search would
// still work, but from the uncached original. Fail the build instead.
const home = await readFile(join(SITE, 'index.html'), 'utf8');
if (!home.includes(`"${ENTRY_URL}":"${hashedUrl}"`)) {
  throw new Error(
    `_site/index.html did not get ${hashedUrl} in its import map`
  );
}

console.log(
  `[hashPagefind] ${ENTRY_URL} -> ${hashedUrl} in ${mapped} import maps`
);
