// SPDX-FileCopyrightText: 2026 Thomas Steiner
//
// SPDX-License-Identifier: Apache-2.0

/**
 * WebMCP support for the blog's Pagefind-powered search.
 * https://github.com/webmachinelearning/webmcp
 *
 * Pagefind renders its search form at runtime rather than shipping it in the
 * markup, so there is no form in the templates to annotate with the
 * declarative API's `toolname` and friends. The search is therefore offered
 * imperatively, via `document.modelContext.registerTool()`, which also means
 * the tool can query the Pagefind index directly and return the matching
 * posts as data instead of merely painting them on screen.
 *
 * Callers are expected to have feature-detected `document.modelContext`.
 */

/** The most results the tool will return. */
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
 * Results are handed back as data rather than prose. The caller is a language
 * model, and prose invites it to paraphrase a URL into something plausible but
 * wrong, whereas structured data is something to quote.
 *
 * The payload is attached as a live object instead of a JSON string. Agents
 * tend to serialize the whole result before handing it to a model, so a string
 * would arrive re-escaped as `{\"query\":\"…\"}`, costing bytes and making it
 * harder to read. Note `object` is not one of MCP's content types (those are
 * text, image, audio, resource_link and resource); it works because WebMCP
 * passes the value through untouched. `structuredContent` is the standardized
 * home for this and costs about the same, should compatibility matter more.
 *
 * There is deliberately only one copy of the payload: agents that serialize
 * the whole result pay for every byte, so a duplicate doubles the bill.
 */
const runSearch = async (query, limit) => {
  const trimmedQuery = query.trim();
  const { total, posts } = trimmedQuery
    ? await searchPosts(trimmedQuery, limit)
    : { total: 0, posts: [] };
  const payload = { query: trimmedQuery, total, results: posts };
  return { content: [{ type: 'object', object: payload }] };
};

/**
 * Exposes the search on this page as a WebMCP tool.
 *
 * @param {object} pagefindUI The `PagefindUI` instance driving the page.
 */
const registerSearchTool = async (pagefindUI) => {
  try {
    await document.modelContext.registerTool({
      name: 'search-blog-posts',
      description:
        "Search Thomas Steiner's blog, Blogccasion. Returns JSON with the " +
        'matching posts, each with its title, absolute URL, and an excerpt. ' +
        'Quote those URLs exactly as given rather than constructing one from ' +
        'the title. The results on the page are updated to match, so the ' +
        'reader sees what was searched for.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: QUERY_DESCRIPTION,
          },
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
      async execute({ query, limit = DEFAULT_RESULTS }) {
        // Reuse the existing client-side search UI so the reader can follow
        // along with what the agent looked up.
        pagefindUI.triggerSearch(query.trim());
        try {
          return await runSearch(query, Math.min(limit, MAX_RESULTS));
        } catch (err) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `The blog search is unavailable: ${err.message}`,
              },
            ],
          };
        }
      },
    });
  } catch (err) {
    console.warn('Could not register the WebMCP search tool.', err);
  }
};

export { registerSearchTool };
