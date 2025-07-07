---
layout: layouts/post.njk
title: 'Playing with AI inference in Firefox Web extensions'
author: 'Thomas Steiner'
date: '2025-02-07T17:15:43'
permalink: 2025/02/07/playing-with-ai-inference-in-firefox-web-extensions/index.html
tags:
  - Technical
---

Recently, in a blog post titled
[Running inference in web extensions](https://blog.mozilla.org/en/products/firefox/firefox-ai/running-inference-in-web-extensions/),
Mozilla announced a pretty interesting experiment on their blog:

> We've recently shipped a new
> [component](https://firefox-source-docs.mozilla.org/toolkit/components/ml/)
> inside of Firefox that leverages
> [Transformers.js](https://huggingface.co/docs/transformers.js/index) […] and
> the underlying [ONNX runtime engine](https://onnxruntime.ai/). This component
> lets you run any machine learning model that is compatible with
> Transformers.js in the browser, with no server-side calls beyond the initial
> download of the models. This means Firefox can run everything on your device
> and avoid sending your data to third parties.

They expose this component to Web extensions under the `browser.trial.ml`
namespace. Where it gets really juicy is at the detail how models are stored
(emphasis mine):

> Model files are stored using IndexedDB and **shared across origins**

Typically when you develop an app with Transformers.js, the model needs to be
cached for each
[origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) separately,
so if two apps on different origins end up using the same model, the model needs
to be downloaded and stored redundantly. (Together with
[Chris](https://christianliebel.com/) and
[François](https://github.com/beaufortfrancois), I have
[thought about this problem](https://github.com/tomayac/cross-origin-storage/),
too, but that's not the topic of this blog post.)

To get a feeling for the platform, I extracted their
[example extension](https://searchfox.org/mozilla-central/source/toolkit/components/ml/docs/extensions-api-example)
from the Firefox source tree and put it separately
[in a GitHub repository](https://github.com/tomayac/firefox-ml-extension), so
you can more easily test it on your own.

1. Make sure that the following flags are toggled to `true` on the special
   `about:config` page:

   ```bash
   browser.ml.enable
   extensions.ml.enabled
   ```

1. Check out the source code.

   ```bash
   git clone git@github.com:tomayac/firefox-ml-extension.git
   ```

1. Load the extension as a temporary extension on the **This Nightly** tab of
   the special `about:debugging` page. It's important to actually use
   [Firefox Nightly](https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly).

   ![Special about:debugging page in Firefox Nightly.](/images/testingaiinfer--eu7b4fay57d.png)

1. After loading the extension, you're brought to the welcome page, where you
   need to grant the ML permission. The permission reads _"Example extension
   requests additional permissions. It wants to: Download and run AI models on
   your device"_. In the `manifest.json`, it looks like this:

   ```json
   {
     "optional_permissions": ["trialML"]
   }
   ```

   ![Permission dialog that reads "Example extension requests additional permissions. It wants to: Download and run AI models on your device](/images/testingaiinfer--6y4beuzmiwp.png)

1. After granting permission, right-click any image on a page, for example,
   [Unsplash](https://unsplash.com/). In the context menu, select **✨ Generate
   Alt Text**.

   ![Context menu with the "✨ Generate Alt Text" option.](/images/testingaiinfer--p5tcfscpym.png)

1. If this was the first time, this triggers the download of the model. On the
   JavaScript code side, this is the relevant part:

   ```js
   // Initialize the event listener
   browser.trial.ml.onProgress.addListener((progressData) => {
     console.log(progressData);
   });

   // Create the inference engine. This may trigger model downloads.
   await browser.trial.ml.createEngine({
     modelHub: 'mozilla',
     taskName: 'image-to-text',
   });
   ```

   You can see the extension display download progress in the lower left corner.

   ![Model download progress as an injected overlay on the Unsplash homepage.](/images/testingaiinfer--70ltkwwvhze.png)

1. Once the model download is complete, the inference engine is ready to run.

   ```js
   // Call the engine.
   const res = await browser.trial.ml.runEngine({
     args: [imageUrl],
   });
   console.log(res[0].generated_text);
   ```

   It's not the most detailed description, but "A computer desk with a monitor,
   keyboard, and a plant" definitely isn't wrong.

   ![Injected overlay with an accurate image description on the Unsplash homepage.](/images/testingaiinfer--3z49xb3ae7f.png)

   If you click **Inspect** on the extension debugging page, you can play with
   the
   [WebExtensions AI APIs](https://firefox-source-docs.mozilla.org/toolkit/components/ml/extensions.html)
   directly.

   ![Special about:debugging page with the Inspect button highlighted.](/images/testingaiinfer--2z5827cdx7b.png)

1. The `browser.trial.ml` namespace exposes the following functions:
   - `createEngine()`: creates an inference engine.
   - `runEngine()`: runs an inference engine.
   - `onProgress()`: listener for engine events
   - `deleteCachedModels()`: delete model(s) files

   ![Firefox DevTools window shown inspecting the `browser.trial.ml` namespace.](/images/testingaiinfer--j43wjeiu9m.png)

   I played with various tasks, and initially, I had some trouble getting
   translation to run, so I hopped on the `firefox-ai` channel on the
   [Mozilla AI Discord](https://discord.gg/Jmmq9mGwy7), where
   [Tarek Ziade](https://fr.linkedin.com/in/tarekziade) from the Firefox team
   [helped me out](https://discord.com/channels/1089876418936180786/1329145280838500475/1336387543490494534)
   and also pointed me at `about:inference`, another cool special page in
   Firefox Nightly where you can manage the installed AI models. If you want to
   delete models from JavaScript, it seems like it's all or nothing, as the
   `deleteCachedModels()` function doesn't seem to take an argument. (It also
   threw a `DOMException` when I tried to run it on Firefox Nightly `137.0a1`.)

   ```js
   // Delete all AI models.
   await browser.trial.ml.deleteCachedModels();
   ```

   ![Inference manager on about:inference special page with overview of downloaded models.](/images/testingaiinfer--dowi2w6wu1m.png)

1. The `about:inference` page also lets you play directly with many AI tasks
   supported by Transformers.js and hence Firefox WebExtensions AI APIs.

   ![Inference manager on about:inference special page with options to test the available models.](/images/testingaiinfer--1bso1w4u01n.png)

Concluding, I think this is a very interesting way of working with AI inference
in the browser. The obvious downside is that you need to convince your users to
download an extension, but the obvious upside is that you possibly can save them
from having to download a model they may already have downloaded and stored on
their disk. When you experiment with AI models a bit, disk space can definitely
become a problem, especially on smaller SSDs, which led me to a
[fun random discovery](https://toot.cafe/@tomayac/113958051687160248) the other
day, when I was trying to free up some disk space for Gemini Nano…

As teased before, Chris, François, and I have some
[ideas](https://github.com/tomayac/cross-origin-storage/) around cross-origin
storage in general, but the Firefox WebExtensions AI APIs definitely solve the
problem for AI models. Be sure to read their
[documentation](https://firefox-source-docs.mozilla.org/toolkit/components/ml/extensions.html)
and play with their
[demo extension](https://github.com/tomayac/firefox-ml-extension/)! On the
Chrome team, we're experimenting with
[built-in AI APIs in Chrome](https://developer.chrome.com/docs/ai/built-in).
It's a very exciting space for sure! Special thanks again to
[Tarek Ziade](https://fr.linkedin.com/in/tarekziade) on the
[Mozilla AI Discord](https://discord.gg/Jmmq9mGwy7) for his help in getting me
started.
