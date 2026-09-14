// SPDX-FileCopyrightText: 2026 Thomas Steiner
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Offers the blog's search to agents visiting the page, through WebMCP.
 * https://github.com/webmachinelearning/webmcp
 *
 * Pagefind renders its search form at runtime rather than shipping it in the
 * markup, so there is no form in the templates to annotate with the
 * declarative API's `toolname` and friends. The search is therefore offered
 * imperatively, via `document.modelContext.registerTool()`.
 *
 * This is independent of `ask.mjs`: a browser can have WebMCP without a model
 * to drive it, or a model without WebMCP. Both read the same definitions from
 * `search-tools.mjs`.
 *
 * Callers are expected to have feature-detected `document.modelContext`.
 */

import { announce } from '/js/ai-status.mjs';
import { createSearchTools } from '/js/search-tools.mjs';

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
const asToolResult = async (run, args) => {
  try {
    return { content: [{ type: 'object', object: await run(args) }] };
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
};

/**
 * Registers the page's search tools with WebMCP.
 *
 * @param {object} pagefindUI The `PagefindUI` instance driving the page.
 */
const registerTools = async (pagefindUI) => {
  let registered = 0;
  for (const { name, description, inputSchema, run } of createSearchTools(
    pagefindUI
  )) {
    try {
      await document.modelContext.registerTool({
        name,
        description,
        inputSchema,
        execute: (args) => asToolResult(run, args),
      });
      registered++;
    } catch (err) {
      console.warn(`Could not register the WebMCP tool ${name}.`, err);
    }
  }
  // Tell the footer, but only about tools an agent can really call.
  announce('webmcp', registered > 0);
};

export { registerTools };
