---
layout: layouts/post.njk
title: 'Guest blog post on Cross-Origin Storage in Transformers.js'
author: 'Thomas Steiner'
date: '2026-06-24T12:24:03'
permalink: 2026/06/24/guest-blog-post-on-cross-origin-storage-in-transformersjs/index.html
tags:
  - Cross-Origin Storage
  - Transformers.js
---

I'm very excited to share a guest post I wrote for the Hugging Face 🤗 blog! The post is called 👉&nbsp;[Experimenting with the proposed Cross-Origin Storage API in Transformers.js](https://huggingface.co/blog/cross-origin-storage)&nbsp;👈! This proposed new browser API, `navigator.crossOriginStorage.requestFileHandle(hash)`, has the potential of revolutionizing the Web, a little bit at least. Learn more by reading the [Explainer for the Cross-Origin Storage (COS) API](https://github.com/WICG/cross-origin-storage).

And Transformers.js aren't alone with experimenting with this, they're joined by [WebLLM](https://webllm.mlc.ai/docs/user/advanced_usage.html#using-cross-origin-storage-cache) (docs), [wllama](https://github.com/ngxson/wllama/blob/master/src/storage/cos.ts) (code), [Flutter](https://github.com/flutter/flutter/blob/master/engine/src/flutter/lib/web_ui/flutter_js/src/instantiate_wasm.js) (code), and [Emscripten](https://emscripten.org/docs/compiling/CrossOriginStorage.html#crossoriginstorage) (docs).

In a nutshell, this is the usual flow of using the API:

```js
const hash = {
  algorithm: 'SHA-256',
  value: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
};

try {
  const handle = await navigator.crossOriginStorage.requestFileHandle(hash);
  // Cache hit! Get the file as a Blob and use it directly.
  const fileBlob = await handle.getFile();
} catch {
  // Cache miss. Download from network, then store for next time.
  const fileBlob = await fetch('https://cdn.jsdelivr.net/.../ort-wasm-simd-threaded.asyncify.wasm')
    .then(r => r.blob());
  const handle = await navigator.crossOriginStorage.requestFileHandle(
    hash,
    { create: true, origins: '*' },
  );
  const writableStream = await handle.createWritable();
  await writableStream.write(fileBlob);
  await writableStream.close();  
}
```

![The Cross-Origin Storage API logo: a stylized walking person, as typically encountered on crosswalk signs.](/images/cos.svg)
