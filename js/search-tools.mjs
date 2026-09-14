// SPDX-FileCopyrightText: 2026 Thomas Steiner
//
// SPDX-License-Identifier: Apache-2.0

/**
 * The blog's search, described once so that both of the things that offer it
 * can share a definition: `webmcp.mjs` registers it for agents visiting the
 * page, `ask.mjs` hands it to the browser's own model. Neither knows about
 * the other, and either can be present without the other.
 *
 * `run()` returns plain data. Packaging it is the caller's business, because
 * WebMCP and the Prompt API want different shapes.
 */

/** The most results a search will return. */
const MAX_RESULTS = 25;

/**
 * How many results to return when the caller doesn't ask for a number. Kept
 * small on purpose: the caller may be a small on-device model, and every
 * result costs it context. `total` still reports the full match count.
 */
const DEFAULT_RESULTS = 5;

const QUERY_DESCRIPTION =
  'The words to search the blog for, for example "web components" or ' +
  '"trip report".';

/** The Pagefind search API, loaded and initialized on first use. */
let pagefindPromise = null;

const getPagefind = () => {
  // Pagefind generates this module at build time, so it only exists in the
  // built site, not while running `npm run watch`.
  pagefindPromise ??= import('/pagefind/pagefind.js')
    .then(async (pagefind) => {
      await pagefind.init();
      return pagefind;
    })
    .catch((err) => {
      // Let a later call try again rather than caching the failure forever.
      pagefindPromise = null;
      throw err;
    });
  return pagefindPromise;
};

/** Turns a Pagefind excerpt with its `<mark>` tags into plain text. */
const stripHighlighting = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.textContent.replace(/\s+/g, ' ').trim();
};

const searchPosts = async (query, limit) => {
  const pagefind = await getPagefind();
  const { results } = await pagefind.search(query);
  const posts = await Promise.all(
    results.slice(0, limit).map(async (result) => {
      const { url, excerpt, meta } = await result.data();
      return {
        title: meta?.title || url,
        url: new URL(url, location.href).href,
        excerpt: stripHighlighting(excerpt),
      };
    })
  );
  return { total: results.length, posts };
};

/**
 * @param {object} pagefindUI The `PagefindUI` instance driving the page, so a
 *   search run by a model also updates the result list the reader sees.
 * @returns {Array<{name: string, description: string, inputSchema: object,
 *   run: (args: object) => Promise<object>}>}
 */
const createSearchTools = (pagefindUI) => [
  {
    name: 'search-blog-posts',
    description:
      "Search Thomas Steiner's blog, Blogccasion. Returns the matching " +
      'posts, each with its title, absolute URL, and an excerpt. Quote those ' +
      'URLs exactly as given rather than constructing one from the title. ' +
      'The results on the page are updated to match, so the reader sees what ' +
      'was searched for.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: QUERY_DESCRIPTION },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: MAX_RESULTS,
          description:
            `How many posts to return at most, ${DEFAULT_RESULTS} by ` +
            'default.',
        },
      },
      required: ['query'],
    },
    async run({ query, limit = DEFAULT_RESULTS } = {}) {
      const trimmed = String(query ?? '').trim();
      // Reuse the existing client-side search UI so the reader can follow
      // along with what was looked up.
      pagefindUI.triggerSearch(trimmed);
      const { total, posts } = trimmed
        ? await searchPosts(trimmed, Math.min(limit, MAX_RESULTS))
        : { total: 0, posts: [] };
      return { query: trimmed, total, results: posts };
    },
  },
];

export { createSearchTools };
