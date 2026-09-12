import {
  isSafeUrl as z,
  createHtmlTokenStreamer as O,
} from './streaming-markdown-html/index.js';
import {
  markdownToHtml as et,
  renderStreamingHTML as nt,
} from './streaming-markdown-html/index.js';
function f(r, t) {
  const e = r.total > 0 ? r.total : 1,
    n = Math.min(Number.isFinite(r.loaded) ? r.loaded : 0, e);
  return {
    resource: t,
    loaded: n,
    total: e,
    percent: Math.round((n / e) * 100),
  };
}
function D({ onDownloadProgress: r, downloadProgress: t, monitor: e } = {}) {
  let n = !1;
  return {
    /** Called with the result of `availability()`. */
    reportAvailability(o) {
      ((n = o !== 'available'),
        t && ((t.hidden = !n), (t.value = 0), (t.max = 1)));
    },
    /** The `monitor` callback to hand to `LanguageModel.create()`. */
    monitor(o) {
      (o.addEventListener('downloadprogress', (s) => {
        const i = f(s, 'language-model'),
          { total: a, loaded: l } = i;
        (t &&
          (l < a
            ? ((t.hidden = !1), (t.max = a), (t.value = l))
            : n && ((t.hidden = !1), t.removeAttribute('value'))),
          r?.(i));
      }),
        e?.(o));
    },
    /** Called once the session exists. */
    reportReady() {
      t && ((t.hidden = !0), (t.value = 0), (t.max = 1));
    },
  };
}
function H(r) {
  return /(?:^#{1,6} |^[-*+] |\d+\. |\*\*|__|\[.+?\]\(|^> |^```)/m.test(r);
}
function I(r) {
  const t = [],
    e = /^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm;
  let n = 0,
    o;
  for (; (o = e.exec(r)) !== null;)
    (o.index > n &&
      t.push({
        type: 'prose',
        content: r.slice(n, o.index),
      }),
      t.push({ type: 'code', content: o[0] }),
      (n = o.index + o[0].length));
  return (n < r.length && t.push({ type: 'prose', content: r.slice(n) }), t);
}
class U {
  #t = /* @__PURE__ */ new Map();
  #n = null;
  #e;
  constructor(t = {}) {
    this.#e = t;
  }
  #a(t) {
    this.#e.onStatus?.(t);
  }
  async #s() {
    return this.#n
      ? this.#n
      : !('LanguageDetector' in globalThis) ||
          (await LanguageDetector.availability()) === 'unavailable'
        ? null
        : ((this.#n = await LanguageDetector.create({
            monitor: (t) =>
              t.addEventListener('downloadprogress', (e) =>
                this.#e.onDownloadProgress?.(f(e, 'language-detector'))
              ),
          })),
          this.#n);
  }
  /**
   * Top detected language, or `null` when the detector isn't confident.
   *
   * Below this confidence the caller falls back to `navigator.language`, which
   * beats acting on an uncertain detection.
   */
  async detectLanguage(t, e = 0.7) {
    const n = await this.#s();
    if (!n) return null;
    const o = await n.detect(t);
    return o.length > 0 && o[0].confidence >= e ? o[0].detectedLanguage : null;
  }
  async #o(t, e) {
    const n = `${t}:${e}`,
      o = this.#t.get(n);
    if (o) return o;
    if (!('Summarizer' in globalThis))
      throw new Error('The Summarizer API is needed to compact a session.');
    const s = {
      type: 'tldr',
      format: t,
      length: 'short',
      expectedInputLanguages: [e],
      // Covers the `context` string passed at summarize time.
      expectedContextLanguages: [e],
      outputLanguage: e,
    };
    let i = { ...s, preference: 'speed' },
      a = await Summarizer.availability(i);
    if (
      (a === 'unavailable' &&
        ((i = { ...s, preference: 'auto' }),
        (a = await Summarizer.availability(i))),
      a === 'unavailable')
    )
      throw new Error(
        `The Summarizer API is unavailable for "${e}" on this device.`
      );
    const l = await Summarizer.create({
      ...i,
      monitor: (c) =>
        c.addEventListener('downloadprogress', (u) =>
          this.#e.onDownloadProgress?.(f(u, 'summarizer'))
        ),
    });
    return (this.#t.set(n, l), l);
  }
  async #r(t, e, n) {
    const s = (
      await n.summarize(
        t.trim().replace(
          /\n{3,}/g,
          `

`
        ),
        {
          context: `This is a ${e} turn from a chat conversation. Preserve its key meaning as concisely as possible.`,
        }
      )
    ).trim();
    return s.length < t.length ? s : t;
  }
  /** Summarizes prose, passing fenced code through untouched. */
  async #i(t, e, n) {
    const o = I(t);
    if (o.length === 1 && o[0].type === 'prose')
      return this.#r(o[0].content, e, n);
    const s = [];
    for (const i of o)
      i.type === 'code'
        ? s.push(i.content.trim())
        : i.content.trim() && s.push(await this.#r(i.content.trim(), e, n));
    return s.join(`

`);
  }
  /**
   * Compacts a message list.
   *
   * Messages with the `system` role, and non-text content, pass through
   * verbatim: a system prompt is an instruction, not a transcript, and
   * summarizing it changes the model's behavior.
   *
   * @param {Array<{role: string, content: any}>} history
   * @returns {Promise<{messages: Array, languages: string[]}>}
   */
  async compact(t) {
    const e = [],
      n = /* @__PURE__ */ new Set();
    for (const [o, s] of t.entries()) {
      if (s.role === 'system' || typeof s.content != 'string') {
        e.push({ role: s.role, content: s.content });
        continue;
      }
      this.#a(`Compacting message ${o + 1} of ${t.length}…`);
      const a = await this.detectLanguage(s.content);
      a && n.add(a);
      const l = a ?? navigator.language,
        c = H(s.content) ? 'markdown' : 'plain-text',
        u = await this.#o(c, l);
      e.push({
        role: s.role,
        content: await this.#i(s.content, s.role, u),
      });
    }
    return {
      messages: e,
      languages: n.size > 0 ? [...n] : [navigator.language],
    };
  }
  /** Releases the cached Summarizer and LanguageDetector instances. */
  destroy() {
    for (const t of this.#t.values()) t.destroy();
    (this.#t.clear(), this.#n?.destroy(), (this.#n = null));
  }
}
function R() {
  return navigator.userActivation?.isActive ?? !0;
}
function k(r, { signal: t } = {}) {
  return new Promise((e, n) => {
    const o = new AbortController(),
      s = (i, a) => {
        (o.abort(), i(a));
      };
    if (t) {
      if (t.aborted) return s(n, t.reason);
      t.addEventListener('abort', () => s(n, t.reason), {
        signal: o.signal,
      });
    }
    r.addEventListener(
      'click',
      (i) => {
        i.isTrusted && s(e);
      },
      { signal: o.signal }
    );
  });
}
async function C({ activationButton: r, activationHint: t, signal: e }) {
  if (!r || R()) return !1;
  const n = [r, t].filter(Boolean);
  for (const o of n) o.hidden = !1;
  try {
    await k(r, { signal: e });
  } finally {
    for (const o of n) o.hidden = !0;
  }
  return !0;
}
function $() {
  return 'LanguageModel' in globalThis;
}
async function w(r, t) {
  const e = D(t);
  for (const s of [t.activationButton, t.activationHint]) s && (s.hidden = !0);
  const n = await LanguageModel.availability(r);
  (e.reportAvailability(n),
    n !== 'available' &&
      (await C({
        activationButton: t.activationButton,
        activationHint: t.activationHint,
        signal: r.signal,
      })));
  const o = await LanguageModel.create({
    ...r,
    monitor: e.monitor,
  });
  return (e.reportReady(), o);
}
function E(r, { output: t, sanitized: e, partialOutput: n } = {}) {
  const o = new DOMException(r, 'OperationError');
  return (Object.assign(o, { output: t, sanitized: e, partialOutput: n }), o);
}
function j() {
  return (
    typeof globalThis.Sanitizer == 'function' &&
    typeof Element.prototype.setHTML == 'function' &&
    typeof Element.prototype.setHTMLUnsafe == 'function'
  );
}
let v;
function P() {
  return ((v ??= document.implementation.createHTMLDocument('')), v);
}
function A() {
  if (!j())
    throw new TypeError(
      "This browser doesn't support the HTML Sanitizer API. Pass `sanitizer: false` to opt out of output sanitization, or load a Sanitizer API polyfill."
    );
}
function F(r, t, e) {
  e === void 0 || e === 'default'
    ? r.setHTML(t)
    : r.setHTML(t, { sanitizer: e });
}
function N(r) {
  let t = 0;
  for (const e of r.querySelectorAll('[href], [src]'))
    for (const n of ['href', 'src']) {
      const o = e.getAttribute(n);
      o !== null && !z(o) && (e.removeAttribute(n), t++);
    }
  return t;
}
function _(r, { sanitizer: t } = {}) {
  A();
  const e = P(),
    n = e.createElement('div');
  (F(n, r, t), N(n));
  const o = e.createElement('div');
  return (
    o.setHTMLUnsafe(r),
    {
      sanitized: n.innerHTML,
      removed: n.innerHTML !== o.innerHTML,
    }
  );
}
const p = (r) => r.replace(/[^\n]/g, ' ');
function W(r) {
  return r
    .replace(/^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\1[ \t]*$/gm, p)
    .replace(/^[ \t]*(?:`{3,}|~{3,})[^\n]*\n[\s\S]*$/m, p)
    .replace(/(`+)[^\n]*?\1/g, p)
    .replace(/`[^\n]*$/gm, p);
}
function B({ sanitizer: r = 'default', ignoreFencedCode: t = !0 } = {}) {
  const e = r !== !1;
  e && A();
  const n = (o) => {
    if (!e || o === '') return { removed: !1, sanitized: o };
    const s = t ? W(o) : o;
    return _(s, { sanitizer: r });
  };
  return {
    enabled: e,
    sanitizer: r,
    check: n,
    /**
     * Throws an `OperationError` if `text` contains unsafe markup.
     *
     * @param {string} text
     * @param {{partialOutput?: string}} [detail]
     */
    assertSafe(o, { partialOutput: s } = {}) {
      const { removed: i, sanitized: a } = n(o);
      if (i)
        throw E(
          'The model produced output containing markup that the Sanitizer API removed. Rendering was stopped.',
          { output: o, sanitized: a, partialOutput: s }
        );
      return o;
    },
  };
}
function x() {
  return 'LanguageModelToolCall' in globalThis;
}
function m(r) {
  return Array.isArray(r)
    ? r.filter((t) => t != null).map(m)
    : r && typeof r == 'object'
      ? Object.fromEntries(
          Object.entries(r)
            .filter(([, t]) => t != null)
            .map(([t, e]) => [t, m(e)])
        )
      : r;
}
function M(r) {
  return {
    declarations: r.map(({ name: e, description: n, inputSchema: o }) => ({
      name: e,
      description: n,
      inputSchema: o,
    })),
    byName: new Map(r.map((e) => [e.name, e])),
  };
}
function q({ expectedInputs: r, expectedOutputs: t }) {
  const e = (n, o) => {
    const s = new Set(n.map((i) => i.type));
    return [...n, ...o.filter((i) => !s.has(i)).map((i) => ({ type: i }))];
  };
  return {
    expectedInputs: e(r, ['tool-response', 'tool-call']),
    expectedOutputs: e(t, ['tool-call']),
  };
}
async function X(r, t, { seen: e, signal: n } = {}) {
  const o = (c) => ({
      type: 'tool-response',
      value: new LanguageModelToolError({
        callID: r.callID,
        name: r.name,
        errorMessage: c,
      }),
    }),
    s = t.get(r.name);
  if (!s) return o(`There is no tool named ${r.name}.`);
  const i = r.arguments ?? {},
    a = (s.inputSchema?.required ?? []).filter(
      (c) => i[c] == null || i[c] === ''
    );
  if (a.length) return o(`${r.name} was called without ${a.join(' and ')}.`);
  const l = `${r.name}(${JSON.stringify(i)})`;
  if (e?.has(l))
    return o(
      `${r.name} was already called with these arguments, and the result is in this conversation. Use it rather than calling again.`
    );
  e?.add(l);
  try {
    const c = await s.execute(i, { signal: n });
    return {
      type: 'tool-response',
      value: new LanguageModelToolSuccess({
        callID: r.callID,
        name: r.name,
        result: [{ type: 'object', value: m(c) }],
      }),
    };
  } catch (c) {
    return o(String(c));
  }
}
async function* g(r) {
  const t = r.getReader();
  try {
    for (;;) {
      const { value: e, done: n } = await t.read();
      if (n) return;
      yield e;
    }
  } finally {
    t.releaseLock();
  }
}
function b(r) {
  const t = new ReadableStream({
    async pull(e) {
      try {
        const { value: n, done: o } = await r.next();
        o ? e.close() : e.enqueue(n);
      } catch (n) {
        e.error(n);
      }
    },
    cancel(e) {
      r.return?.(e);
    },
  });
  return (
    Symbol.asyncIterator in t || (t[Symbol.asyncIterator] = () => g(t)),
    t
  );
}
function Y(r) {
  const t = /<[a-zA-Z!/][^>]*$/.exec(r);
  return t ? t.index : -1;
}
function G(r) {
  if (typeof r == 'string') return { text: r, calls: [] };
  const t = Array.isArray(r) ? r : [r];
  return {
    text: t
      .filter((e) => e.type === 'text')
      .map((e) => e.value)
      .join(''),
    calls: t.filter((e) => e.type === 'tool-call').map((e) => e.value),
  };
}
function J(r, t) {
  const e = new DOMException(
    `The model asked for tools ${r} times without answering. Raise \`maxToolRounds\`, or give it a tool that does more per call.`,
    'OperationError'
  );
  return (Object.assign(e, { toolRounds: r, toolCalls: t }), e);
}
function d(r) {
  return typeof r == 'string'
    ? [{ role: 'user', content: r }]
    : Array.isArray(r)
      ? r.map((t) => ({
          role: t.role ?? 'user',
          content: t.content,
        }))
      : [{ role: 'user', content: r }];
}
const K = /* @__PURE__ */ new Set([
    'sanitizer',
    'ignoreFencedCode',
    'onDownloadProgress',
    'downloadProgress',
    'activationButton',
    'activationHint',
    'tools',
    'maxToolRounds',
    'onToolCall',
    'onToolResponse',
    // Replaced by the wrapper's own monitor, which then calls this one.
    'monitor',
  ]),
  T = [{ type: 'text', languages: ['en'] }],
  S = 8;
async function Z(r, t) {
  if (!t) return r;
  (t.throwIfAborted(), r.catch(() => {}));
  const e = new AbortController();
  try {
    return await Promise.race([
      r,
      new Promise((n, o) => {
        t.addEventListener('abort', () => o(t.reason), {
          once: !0,
          signal: e.signal,
        });
      }),
    ]);
  } finally {
    e.abort();
  }
}
function L(r) {
  const t = {},
    e = {};
  for (const [n, o] of Object.entries(r)) K.has(n) ? (t[n] = o) : (e[n] = o);
  return (
    (e.expectedInputs ??= T),
    (e.expectedOutputs ??= T),
    t.tools?.length &&
      ((e.tools = M(t.tools).declarations), Object.assign(e, q(e))),
    { easy: t, createOptions: e }
  );
}
class y {
  /**
   * Same as `LanguageModel.availability()`. The wrapper's own options can be
   * passed straight through, so one object serves this and `create()`.
   *
   * @returns {Promise<'unavailable'|'downloadable'|'downloading'|'available'>}
   */
  static async availability(t = {}) {
    return !$() || (t.tools?.length && !x())
      ? 'unavailable'
      : LanguageModel.availability(L(t).createOptions);
  }
  /**
   * Creates a session.
   *
   * Everything `LanguageModel.create()` accepts is forwarded untouched. The
   * options below are the wrapper's own.
   *
   * @param {LanguageModelCreateOptions & EasyCreateOptions} [options]
   * @returns {Promise<EasyLanguageModel>}
   */
  static async create(t = {}) {
    if (t.tools?.length && !x())
      throw new TypeError(
        "This browser doesn't support tool calling. Enable chrome://flags/#prompt-api-tool-use, or create the session without `tools`. `availability()` reports this as `unavailable`."
      );
    const { easy: e, createOptions: n } = L(t),
      o = await w(n, e),
      { signal: s, ...i } = n;
    return new y(o, {
      createOptions: i,
      easy: e,
    });
  }
  // ── Instance ───────────────────────────────────────────────────────────────
  #t;
  #n;
  #e;
  #a;
  #s = null;
  // The conversation as the current session sees it: replaced by the summaries
  // on every compaction.
  #o = [];
  // Every message in its original form, never replaced. Used to rebuild the
  // session if a compaction fails after the old one is already gone.
  #r = [];
  #i = [];
  #l = null;
  /** Name to tool, for dispatching what the model asks for. */
  #d = /* @__PURE__ */ new Map();
  /** @internal Use `EasyLanguageModel.create()`. */
  constructor(t, { createOptions: e, easy: n }) {
    ((this.#t = t),
      (this.#n = e),
      (this.#e = n),
      (this.#a = B({
        sanitizer: n.sanitizer,
        ignoreFencedCode: n.ignoreFencedCode,
      })),
      n.tools?.length && (this.#d = M(n.tools).byName));
    for (const o of e.initialPrompts ?? [])
      (this.#o.push({ role: o.role, content: o.content }),
        this.#r.push({ role: o.role, content: o.content }));
  }
  // ── Pass-throughs ──────────────────────────────────────────────────────────
  get contextUsage() {
    return this.#t.contextUsage;
  }
  get contextWindow() {
    return this.#t.contextWindow;
  }
  get samplingMode() {
    return this.#t.samplingMode;
  }
  /** The conversation so far, as the current session sees it. */
  get history() {
    return this.#o.map((t) => ({ ...t }));
  }
  /**
   * @param {LanguageModelPrompt} input
   * @param {LanguageModelPromptOptions} [options]
   */
  measureContextUsage(t, e) {
    return this.#t.measureContextUsage(t, e);
  }
  /**
   * @param {LanguageModelPrompt} input
   * @param {LanguageModelAppendOptions} [options]
   */
  async append(t, e) {
    (await this.#t.append(t, e), this.#c(d(t)));
  }
  addEventListener(t, e, n) {
    (this.#i.push({ type: t, listener: e, options: n }),
      this.#t.addEventListener(t, e, n));
  }
  removeEventListener(t, e, n) {
    ((this.#i = this.#i.filter((o) => o.type !== t || o.listener !== e)),
      this.#t.removeEventListener(t, e, n));
  }
  get oncontextoverflow() {
    return this.#l;
  }
  set oncontextoverflow(t) {
    ((this.#l = t), (this.#t.oncontextoverflow = t));
  }
  destroy() {
    (this.#t.destroy(), this.#s?.destroy(), (this.#s = null));
  }
  /** @param {LanguageModelCloneOptions} [options] */
  async clone(t) {
    const e = new y(await this.#t.clone(t), {
      createOptions: this.#n,
      easy: this.#e,
    });
    return ((e.#o = this.history), (e.#r = this.#r.map((n) => ({ ...n }))), e);
  }
  // ── Prompting ──────────────────────────────────────────────────────────────
  /**
   * Like `LanguageModel.prompt()`, but the response is checked with the
   * Sanitizer API before you get it.
   *
   * @param {LanguageModelPrompt} input
   * @param {LanguageModelPromptOptions} [options] Passed through to the raw session.
   * @returns {Promise<string>}
   */
  async prompt(t, e) {
    const n = d(t);
    let o = t,
      s = 0;
    const i = /* @__PURE__ */ new Set();
    for (;;) {
      const { text: a, calls: l } = G(await this.#t.prompt(o, e));
      if (l.length === 0) {
        const { removed: c, sanitized: u } = this.#a.check(a);
        return (
          c && this.#y({ output: a, sanitized: u, partialOutput: '' }),
          this.#c([...n, { role: 'assistant', content: a }]),
          a
        );
      }
      if (this.#h(++s))
        throw this.#p({ calls: l, text: a, rounds: s, pending: n });
      o = await this.#u(l, {
        text: a,
        rounds: s,
        seen: i,
        pending: n,
        signal: e?.signal,
      });
    }
  }
  /**
   * Like `LanguageModel.promptStreaming()`, but every chunk is sanitized before
   * it's handed over.
   *
   * The check runs against everything received so far, not each chunk in
   * isolation, because a tag can straddle a chunk boundary. The moment the
   * sanitizer would remove something, the stream stops.
   *
   * @param {LanguageModelPrompt} input
   * @param {LanguageModelPromptOptions} [options]
   * @returns {ReadableStream<string>} Markdown chunks.
   */
  promptStreaming(t, e) {
    return b(this.#w(t, e));
  }
  async *#w(t, e) {
    const n = d(t);
    let o = t,
      s = 0;
    const i = /* @__PURE__ */ new Set();
    for (;;) {
      const a = [],
        l = yield* this.#v(o, e, a);
      if (a.length === 0) {
        this.#c([...n, { role: 'assistant', content: l }]);
        return;
      }
      if (this.#h(++s))
        throw this.#p({ calls: a, text: l, rounds: s, pending: n });
      o = await this.#u(a, {
        text: l,
        rounds: s,
        seen: i,
        pending: n,
        signal: e?.signal,
      });
    }
  }
  /**
   * Streams one model turn, yielding sanitized text and collecting the tool
   * calls into `calls`. Returns the turn's complete text.
   *
   * `promptStreaming()` yields a heterogeneous stream: text arrives as plain
   * strings, and each tool call as its own structured chunk.
   */
  async *#v(t, e, n) {
    let o = '',
      s = 0;
    for await (const i of g(this.#t.promptStreaming(t, e))) {
      if (typeof i != 'string') {
        i.type === 'tool-call' && n.push(i.value);
        continue;
      }
      o += i;
      const { removed: a, sanitized: l } = this.#a.check(o);
      if (a) {
        this.#y({
          output: o,
          sanitized: l,
          partialOutput: o.slice(0, s),
        });
        return;
      }
      const c = Y(o),
        u = c === -1 ? o.length : c;
      if (u > s) {
        const h = o.slice(s, u);
        ((s = u), yield h);
      }
    }
    return (s < o.length && (yield o.slice(s)), o);
  }
  /**
   * Like `prompt()`, but the response comes back as HTML instead of Markdown.
   *
   * The whole response in one string, so it can go straight into a container.
   * It is safe to assign: every tag came from the Markdown parser's fixed set
   * and all text was escaped by the DOM serializer, so nothing the model wrote
   * survives as markup. Using `setHTML()` costs nothing extra if you would
   * rather not have `innerHTML` in your code at all.
   *
   * ```js
   * output.setHTML(await session.promptHTML(prompt));
   * ```
   *
   * @param {LanguageModelPrompt} input
   * @param {LanguageModelPromptOptions} [options]
   * @returns {Promise<string>} The complete HTML.
   */
  async promptHTML(t, e) {
    let n = '';
    for await (const o of this.#f(t, e)) n += o;
    return n;
  }
  /**
   * Streams the response as HTML instead of Markdown.
   *
   * Chunks arrive at the granularity the Markdown parser works at — an opening
   * tag, a run of text, a closing tag — so output appears as fast as the model
   * produces it rather than a block at a time. A chunk is therefore not a
   * balanced fragment: `<p>` arrives before its text. Concatenating every chunk
   * yields the complete, well-formed HTML.
   *
   * Consuming the stream has no side effects. To put the response on screen,
   * pipe it into `renderStreamingHTML()`:
   *
   * ```js
   * await session
   *   .promptStreamingHTML(prompt)
   *   .pipeTo(renderStreamingHTML(output));
   * ```
   *
   * @param {LanguageModelPrompt} input
   * @param {LanguageModelPromptOptions} [options] Passed through to the raw session.
   * @returns {ReadableStream<string>} HTML chunks.
   */
  promptStreamingHTML(t, e) {
    return b(this.#f(t, e));
  }
  async *#f(t, e) {
    const n = d(t),
      o = [],
      s = O({
        onHtml: (c) => o.push(c),
      });
    let i = t,
      a = 0;
    const l = /* @__PURE__ */ new Set();
    for (;;) {
      const c = [];
      let u = '';
      for await (const h of g(this.#t.promptStreaming(i, e))) {
        if (typeof h != 'string') {
          h.type === 'tool-call' && c.push(h.value);
          continue;
        }
        for (u += h, s.write(h); o.length > 0;) yield o.shift();
      }
      if (c.length === 0) {
        for (s.end(); o.length > 0;) yield o.shift();
        this.#c([...n, { role: 'assistant', content: u }]);
        return;
      }
      if (this.#h(++a))
        throw this.#p({
          calls: c,
          text: u,
          rounds: a,
          pending: n,
        });
      i = await this.#u(c, {
        text: u,
        rounds: a,
        seen: l,
        pending: n,
        signal: e?.signal,
      });
    }
  }
  // ── Compacting ─────────────────────────────────────────────────────────────
  /**
   * Summarizes the conversation and restarts the session with the summaries as
   * `initialPrompts`, freeing context without losing the thread.
   *
   * The browser doesn't evict `initialPrompts` during overflow handling, so
   * what survives compaction stays anchored for the rest of the session. This
   * swaps the underlying session in place: event listeners registered through
   * this wrapper are re-attached, and the object stays usable throughout.
   *
   * @param {object} [options]
   * @param {(status: string) => void} [options.onStatus] Called once per
   *   message, since each is a separate Summarizer call and a long
   *   conversation takes a while.
   * @returns {Promise<{before: {contextUsage: number, contextWindow: number}, after: {contextUsage: number, contextWindow: number}, saved: number, reduction: number, percent: number, messages: number, languages: string[]}>}
   */
  async compact(t = {}) {
    this.#s ??= new U({
      onDownloadProgress: this.#e.onDownloadProgress,
      ...t,
    });
    const e = {
        contextUsage: this.#t.contextUsage,
        contextWindow: this.#t.contextWindow,
      },
      { messages: n, languages: o } = await this.#s.compact(this.#o);
    this.#t.destroy();
    try {
      ((this.#t = await this.#m(n, o)), (this.#o = n));
    } catch (l) {
      throw (
        (this.#t = await this.#m(this.#r, o)),
        (this.#o = this.#r.map((c) => ({ ...c }))),
        this.#g(),
        l
      );
    }
    this.#g();
    const s = {
        contextUsage: this.#t.contextUsage,
        contextWindow: this.#t.contextWindow,
      },
      i = e.contextUsage - s.contextUsage,
      a = e.contextUsage > 0 ? i / e.contextUsage : 0;
    return {
      before: e,
      after: s,
      saved: i,
      reduction: a,
      percent: Math.round(a * 100),
      messages: n.length,
      languages: o,
    };
  }
  #m(t, e) {
    const n = { ...this.#n, initialPrompts: t };
    return (
      !n.expectedInputs &&
        e?.length &&
        (n.expectedInputs = [{ type: 'text', languages: e }]),
      !n.expectedOutputs &&
        e?.length &&
        (n.expectedOutputs = [{ type: 'text', languages: e }]),
      w(n, this.#e)
    );
  }
  #g() {
    for (const { type: t, listener: e, options: n } of this.#i)
      this.#t.addEventListener(t, e, n);
    this.#l && (this.#t.oncontextoverflow = this.#l);
  }
  // ── Internals ──────────────────────────────────────────────────────────────
  /**
   * Runs the tools one round asked for, and records both halves of the round.
   *
   * Returns the next prompt input, or `null` when the loop has to stop. The
   * caller has already had its `rounds` incremented, so `rounds` here is the
   * number of rounds spent including this one.
   */
  async #u(t, { text: e, rounds: n, seen: o, pending: s, signal: i }) {
    const a = this.#e.maxToolRounds ?? S;
    s.push({
      role: 'assistant',
      content: [
        ...(e ? [{ type: 'text', value: e }] : []),
        ...t.map((c) => ({ type: 'tool-call', value: c })),
      ],
    });
    const l = await Z(
      Promise.all(
        t.map(async (c) => {
          this.#e.onToolCall?.({
            callID: c.callID,
            name: c.name,
            arguments: c.arguments,
          });
          const u = await X(c, this.#d, {
            seen: o,
            signal: i,
          });
          return (i?.aborted || this.#x(c, u), u);
        })
      ),
      i
    );
    return (
      n >= a &&
        l.push({
          type: 'text',
          value:
            'This is the last tool result you will receive. Answer from what you have now, and do not call any more tools.',
        }),
      s.push({ role: 'user', content: l }),
      [{ role: 'user', content: l }]
    );
  }
  /**
   * Hands one finished call to `onToolResponse`.
   *
   * A refusal the wrapper decided on its own, an invented tool, a missing
   * argument, or a call it has already answered, never runs `execute`, so this
   * is the only place an app can see it happen.
   */
  #x(t, e) {
    if (!this.#e.onToolResponse) return;
    const { errorMessage: n, result: o } = e.value;
    this.#e.onToolResponse({
      callID: t.callID,
      name: t.name,
      arguments: t.arguments,
      ok: n === void 0,
      result: o?.[0]?.value,
      errorMessage: n,
    });
  }
  /** Whether the loop may take another round after the one just counted. */
  #h(t) {
    return t > (this.#e.maxToolRounds ?? S);
  }
  /**
   * Gives up on a loop the model won't end, keeping the history honest.
   *
   * The rounds already spent are recorded before throwing, because the session
   * itself took those turns: dropping them here, the way an aborted turn is
   * dropped, would leave `history` describing a conversation the model isn't
   * having, and `compact()` reads `history`.
   */
  #p({ calls: t, text: e, rounds: n, pending: o }) {
    return (
      o.push({
        role: 'assistant',
        content: [
          ...(e ? [{ type: 'text', value: e }] : []),
          ...t.map((s) => ({ type: 'tool-call', value: s })),
        ],
      }),
      this.#c(o),
      J(n - 1, t)
    );
  }
  #c(t) {
    for (const e of t) (this.#o.push(e), this.#r.push({ ...e }));
  }
  #y(t) {
    throw E(
      'The model produced output containing markup that the Sanitizer API removed. Rendering was stopped.',
      t
    );
  }
}
export {
  y as EasyLanguageModel,
  et as markdownToHtml,
  nt as renderStreamingHTML,
};
//# sourceMappingURL=easy-language-model.js.map
