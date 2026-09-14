// SPDX-FileCopyrightText: 2026 Thomas Steiner
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Replaces the Pagefind search field with a question box, when the browser can
 * actually answer questions: the Prompt API present, its model already on the
 * device, and tool calling supported.
 *
 * The model is handed the same search tools `webmcp.mjs` offers to visiting
 * agents, but calls them directly rather than through WebMCP, so this works on
 * browsers that have a model and no WebMCP at all. Asking a question therefore
 * runs the search the field would have run, and Pagefind's own result list
 * still renders underneath.
 *
 * Everything here is additive. If any of it is missing or fails, the Pagefind
 * field is left exactly as it was.
 */

import { createSearchTools } from '/js/search-tools.mjs';

/**
 * The language model wrapper, fetched on first use. Keeping it out of this
 * module's imports matters twice over: the decision about which search control
 * to show is not held up by ~90 kB of parser, and a reader who never asks
 * anything never downloads it at all.
 */
let libraryPromise = null;
const getLibrary = () =>
  (libraryPromise ??= import('/js/easy-language-model.js'));

/**
 * Whether this browser can run a tool-calling session right now.
 *
 * `tool-call` is only a member of `LanguageModelMessageType` in builds that
 * support tool use, so an unsupported build rejects it the way it rejects any
 * unknown enum value. Requiring `available` rather than `downloadable` keeps
 * the search field in place instead of trading it for a multi-gigabyte
 * download the reader did not ask for.
 */
const canAnswer = async () => {
  try {
    const availability = await LanguageModel.availability({
      expectedInputs: [{ type: 'tool-call' }],
    });
    return availability === 'available';
  } catch {
    return false;
  }
};

const build = () => {
  const form = document.createElement('form');
  form.className = 'ask';

  const field = document.createElement('input');
  field.type = 'search';
  field.className = 'ask-field';
  field.name = 'question';
  field.autocomplete = 'off';
  field.placeholder = 'Ask a question about this blog…';
  field.setAttribute('aria-label', 'Ask a question about this blog');

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'ask-submit';
  submit.textContent = 'Ask';

  const status = document.createElement('p');
  status.className = 'ask-status';
  status.hidden = true;
  status.setAttribute('role', 'status');

  const log = document.createElement('div');
  log.className = 'ask-log';

  const row = document.createElement('div');
  row.className = 'ask-row';
  row.append(field, submit);
  form.append(row, status, log);
  return { form, field, submit, status, log };
};

/**
 * @param {object} pagefindUI The `PagefindUI` instance driving the page, used
 *   to keep its result list in step with what the model searched for.
 */
const enhanceSearch = async (pagefindUI) => {
  const search = document.querySelector('#search');
  const pagefindField = document.querySelector('.pagefind-ui__search-input');
  if (!search || !pagefindField) return;
  if (!(await canAnswer())) return;

  // The model calls these directly, so the result is a plain value rather than
  // anything WebMCP-shaped. JSON, because a model quotes data and paraphrases
  // prose, and a URL is worth quoting exactly.
  const tools = createSearchTools(pagefindUI).map(
    ({ name, description, inputSchema, run }) => ({
      name,
      description,
      inputSchema,
      execute: async (args) => JSON.stringify(await run(args)),
    })
  );

  const ui = build();
  search.prepend(ui.form);
  // Hides Pagefind's own field while leaving its result list visible.
  search.classList.add('ask-enabled');

  let answer = null; // set while a turn is running
  const say = (text) => {
    ui.status.hidden = false;
    ui.status.textContent = text;
  };

  let session;
  const getSession = async () => {
    // Created on the first question, so the Prompt API sees a user gesture.
    const { EasyLanguageModel } = await getLibrary();
    session ??= await EasyLanguageModel.create({
      tools,
      // The reader gets progress, not plumbing: a failing tool is the model's
      // problem to work around, and its wording is written for the model.
      onToolCall: () => say('Searching the blog…'),
      onToolResponse: ({ name, ok, errorMessage }) => {
        if (!ok) console.warn(`Ask: tool ${name} failed.`, errorMessage);
        say('Thinking…');
      },
    });
    return session;
  };

  // If the model turns out not to work after all, hand the reader back the
  // search field rather than leaving them with a box that cannot answer.
  const standDown = (message) => {
    search.classList.remove('ask-enabled');
    ui.form.remove();
    ui.status.hidden = true;
    console.warn('Ask: falling back to the search field.', message);
  };

  ui.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = ui.field.value.trim();
    if (!question || ui.submit.disabled) return;
    ui.field.value = '';
    ui.submit.disabled = ui.field.disabled = true;
    say('Thinking…');

    const entry = document.createElement('article');
    const asked = document.createElement('p');
    asked.className = 'ask-question';
    asked.textContent = question;
    answer = document.createElement('div');
    answer.className = 'ask-answer';
    entry.append(asked, answer);
    ui.log.prepend(entry);

    try {
      const model = await getSession();
      const { renderStreamingHTML } = await getLibrary();
      await model
        .promptStreamingHTML(question)
        .pipeTo(renderStreamingHTML(answer));
    } catch (err) {
      if (!session) {
        entry.remove();
        standDown(err);
        return;
      }
      const failed = document.createElement('p');
      failed.className = 'ask-failed';
      failed.textContent = `Sorry, that did not work: ${err?.message ?? err}`;
      answer.append(failed);
      console.warn('Ask: prompt failed.', err);
    } finally {
      answer = null;
      ui.status.hidden = true;
      ui.submit.disabled = ui.field.disabled = false;
    }
  });

  // Keep the field usable as a plain search: an empty question clears results.
  ui.field.addEventListener('search', () => {
    if (!ui.field.value.trim()) pagefindUI.triggerSearch('');
  });
};

export { enhanceSearch };
