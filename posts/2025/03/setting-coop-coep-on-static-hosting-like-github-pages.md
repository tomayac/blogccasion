---
layout: layouts/post.njk
title: 'Setting the COOP and COEP headers on static hosting like GitHub Pages'
author: 'Thomas Steiner'
date: '2025-03-08T20:39:51'
permalink: 2025/03/08/setting-coop-coep-headers-on-static-hosting-like-github-pages/index.html
tags:
  - Technical
---

Remember the Cross-Origin-Embedder-Policy
([COEP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy))
and the Cross-Origin-Opener-Policy
([COOP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy))
headers for making your site
[cross-origin isolated](https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated)?
If not, here's my colleague
[Eiji Kitamura](https://www.linkedin.com/in/agektmr)'s article
[Making your website "cross-origin isolated" using COOP and COEP ](https://web.dev/articles/coop-coep).
To be effective, they need to be sent as in the example below.

```bash
cross-origin-embedder-policy: credentialless
cross-origin-opener-policy: same-origin
```

Cross-origin isolated documents operate with fewer restrictions when using the
following APIs:

[`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
can be created and sent via a
[`Window.postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
or a
[`MessagePort.postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/postMessage)
call.
[`Performance.now()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)
offers better precision.
[`Performance.measureUserAgentSpecificMemory()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measureUserAgentSpecificMemory)
can be called.

Typically, sending non-default HTTP headers like COOP and COEP means controlling
the server so you can configure it to send them. I recently learned that they
are also honored if set through a service worker 🤯! This means you can make
apps on static hosting like on GitHub Pages cross-origin isolated!

- Blog post by stefnotch:
  [Enabling COOP/COEP without touching the server](https://dev.to/stefnotch/enabling-coop-coep-without-touching-the-server-2d3n)
- Library by Guido Zuidhof:
  [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker)
- Demo:
  [Are we cross-origin isolated?](https://tomayac.github.io/blogccasion-demos/coi-serviceworker/)

One example where cross-origin isolating your site is needed is with
[SQLite Wasm](https://github.com/sqlite/sqlite-wasm/) when you want to use
persistent storage with the origin private file system virtual file system
called
[OPFS sqlite3_vfs](https://sqlite.org/wasm/doc/trunk/persistence.md#coop-coep).
I'm glad to have this coi-serviceworker trick up my sleeve now, and you do, too!
