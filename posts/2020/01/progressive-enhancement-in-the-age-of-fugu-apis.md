---
layout: layouts/post.njk
title: "Progressive Enhancement In the Age of Fugu APIs"
author: "Thomas Steiner"
date: "2020-01-23T13:44:57"
permalink: 2020/01/23/progressive-enhancement-in-the-age-of-fugu-apis/index.html
tags:
  - Technical
---
Back in March 2003, [Nick Finck](http://nickfinck.com/) and
[Steven Champeon](https://twitter.com/schampeo) stunned the web design world
with the concept of
[progressive enhancement](http://hesketh.com/publications/inclusive_web_design_for_the_future/):

> Rather than hoping for graceful degradation, [progressive enhancement] builds documents
  for the least capable or differently capable devices first,
  then moves on to enhance those documents with separate logic for presentation,
  in ways that don't place an undue burden on baseline devices
  but which allow a richer experience for those users with modern graphical browser software.

While in *2003*, progressive enhancement was mostly about using *presentational* features
like at the time modern CSS properties, unobtrusive JavaScript for improved usability,
and even nowadays basic things like Scalable Vector Graphics;
I see progressive enhancement in *2020* as being about using new *functional* browser capabilities.

## Sometimes we agree to disagree

Feature support for core JavaScript language features by major browsers is great.
Kangax' [ECMAScript 2016+ compatibility table](https://kangax.github.io/compat-table/es2016plus/)
is almost all green, and browser vendors generally agree and are quick to implement.
In contrast, there is less agreement on what we colloquially call *Fugu 🐡* features.
In [Project Fugu](https://developers.google.com/web/updates/capabilities),
our objective is the following:

> Enable web apps to do anything native apps can,
  by exposing the capabilities of native platforms to the web platform,
  while maintaining user security, privacy, trust, and other core tenets of the web.

You can see all the capabilities we want to tackle in the context of the project
by having a look at our [Fugu API tracker](https://goo.gle/fugu-api-tracker).
I have also written about [Project Fugu at W3C TPAC 2019](/2019/09/21/project-fugu-at-w3c-tpac/).

To get an impression of the debate around these features
when it comes to the different browser vendors, I recommend reading the discussions
around the request for a
[WebKit position on Web NFC](https://lists.webkit.org/pipermail/webkit-dev/2020-January/031006.html)
or the request for a
[Mozilla position on screen Wake Lock](https://github.com/mozilla/standards-positions/issues/210)
(both discussions contain links to the particular specs in question).
In some cases, the result of these positioning threads might be a "we agree to disagree".
And that's fine.

## Progressive enhancement for Fugu features

As a result of this disagreement, some Fugu features
will probably never be implemented by all browser vendors.
But what does this mean for developers?
Now and then, in 2003 just like in 2020,
[feature detection](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/Feature_detection)
plays a central role.
Before using a *potentially future* new browser capability like, say, the
[Native File System API](https://web.dev/native-file-system/),
developers need to feature-detect the presence of the API.
For the Native File System API, it might look like this:

```js
if ('chooseFileSystemEntries' in window) {
  // Yay, the Native File System API is available! 💾
} else {
  // Nay, a legacy approach is required. 😔
}
```

In the worst case, there is no legacy approach (the `else` branch in the code snippet above).
Some Fugu features are so groundbreakingly new that there simply is no replacement.
The [Contact Picker API](https://web.dev/contact-picker/) (that allows users to select contacts
from their device's native contact manager) is such an example.

But in other cases, like with the Native File System API,
developers can fall back to
[`<a download>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-download)
for saving and
[`<input type="file">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file)
for opening files.
The experience will not be the same (while you can open a file, you cannot write back to it;
you will always create a new file that will land in your Downloads folder),
but it is the next best thing.

A suboptimal way to deal with this situation would be to force users to load both code paths,
the legacy approach and the new approach.
Luckily,
[dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports)
makes differential loading feasible and—as a
[stage 4 of the TC39 process](https://tc39.es/process-document/)
feature—has [great browser support](https://caniuse.com/#feat=es6-module-dynamic-import).

## Experimenting with `browser-nativefs`

I have been exploring this pattern of progressively enhancing a web application with Fugu features.
The other day, I came across an interesting project by
[Christopher Chedeau](https://blog.vjeux.com/), who also goes by
[@Vjeux](https://twitter.com/vjeux) on most places on the Internet.
Christopher [blogged](https://blog.vjeux.com/2020/uncategorized/reflections-on-excalidraw.html)
about a new app of his, [Excalidraw](https://excalidraw.com/), and how the project "exploded"
(in a positive sense).
Made curious from the blog post, I played with the app myself
and immediately thought that it could profit from the Native File System API.
I opened an initial [Pull Request](https://github.com/excalidraw/excalidraw/pull/388)
that was quickly merged and that implements the fallback scenario mentioned above,
but I was not really happy with the code duplication I had introduced.

![Excalidraw web app with open "file save" dialog.](/images/excalidraw.png)

As the logical next step, I created an experimental library
that supports the differential loading pattern via dynamic `import()`.
Introducing [`browser-nativefs`](https://github.com/tomayac/browser-nativefs),
an abstraction layer that exposes two functions, `fileOpen()` and `fileSave()`,
which under the hood either use the Native File System API or the `<a download>` and
`<input type="file">` legacy approach.
A Pull Request based on this library is now [merged](https://github.com/excalidraw/excalidraw/pull/510)
into Excalidraw, and so far it seems to work fine (only the dynamic `import()`
[breaks CodeSandbox](https://github.com/excalidraw/excalidraw/issues/512),
likely a [known issue](https://github.com/codesandbox/codesandbox-client/issues/1774)).
You can see the core API of the library below.

```js
import {
  fileOpenPromise,
  fileSavePromise,
} from 'https://unpkg.com/browser-nativefs';

(async () => {
  // This dynamically either loads the Native
  // File System API or the legacy module.
  const fileOpen = (await fileOpenPromise).default;
  const fileSave = (await fileSavePromise).default;

  // Open a file.
  const blob = await fileOpen({
    mimeTypes: ['image/*'],
  });
  // Open multiple files
  const blobs = await fileOpen({
    mimeTypes: ['image/*'],
    multiple: true,
  });
  // Save a file.
  await fileSave(blob, {
    fileName: 'Untitled.png',
  });
})();
```

## Polyfill or ponyfill or abstraction

Triggered by this project, I provided some feedback on the Native File System specification:

- [#146](https://github.com/WICG/native-file-system/issues/146) on the API shape and the naming.
- [#148](https://github.com/WICG/native-file-system/issues/148)
  on whether a `File` object should have an attribute
  that points to its associated
  [`FileSystemHandle`](https://wicg.github.io/native-file-system/#filesystemhandle).
- [#149](https://github.com/WICG/native-file-system/issues/149)
  on the ability to provide a name hint for a to-be-saved file.

There are several other [open issues](https://github.com/WICG/native-file-system/issues)
for the API, and its shape is not stable yet.
Some of the API's concepts like `FileSystemHandle` only make sense when used with the actual API,
but not with a legacy fallback,
so [polyfilling](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill)
or [ponyfilling](https://ponyfill.com/) (as pointed out by my colleague
[Jeff Posnick](https://jeffy.info/)) is—in my humble opinion—less of an option,
at least for the moment.

My current thinking goes more in the direction of positioning this library as an abstraction
like jQuery's [`$.ajax()`](https://api.jquery.com/jquery.ajax/) or
Axios' [`axios.get()`](https://api.jquery.com/jquery.ajax/),
which a significant amount of developers still prefer even over newer APIs like `fetch()`.
In a similar vein, Node.js offers a function
[`fsPromises.readFile()`](https://nodejs.org/api/fs.html#fs_fspromises_readfile_path_options)
that—apart from a [`FileHandle`](https://nodejs.org/api/fs.html#fs_class_filehandle)—also
just takes a filename `path` string, that is, it acts as an optional shortcut to
[`fsPromises.open()`](https://nodejs.org/api/fs.html#fs_fspromises_open_path_flags_mode),
which returns a [`FileHandle`](https://nodejs.org/api/fs.html#fs_class_filehandle)
that one can then use with
[filehandle.readFile()](https://nodejs.org/api/fs.html#fs_filehandle_readfile_options)
that finally returns a `Buffer` or a `string`, just like `fsPromises.readFile()`.

Thus, should the Native File System API then just have a `window.readFile()` method? Maybe.
But more recently the trend seems to be to rather expose generic tools like
[`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
that can be used to cancel many things, including
[`fetch()`](https://github.com/mdn/dom-examples/blob/2f15930c36a4eeb31eb6d9862c277f2dc9a829b2/abort-api/index.html#L72)
rather than more specific mechanisms.
When the lower-level primitives are there, developers can build abstractions on top,
and optionally never expose the primitives, just like the `fileOpen()` and `fileSave()` methods
in `browser-nativefs` that one *can* (but never has to) perfectly use
without ever touching a `FileSystemHandle`.

## Conclusion

Progressive enhancement in the age of Fugu APIs in my opinion is more alive than ever.
I have shown the concept at the example of the Native File System API,
but there are several other new API proposals where this idea (which by no means I claim as new)
could be applied.
For instance, the [Shape Detection API](https://web.dev/shape-detection/)
can fall back to JavaScript or Web Assembly libraries, as shown in the
[Perception Toolkit](https://github.com/GoogleChromeLabs/perception-toolkit/#overview).
Another example is the (screen) [Wake Lock API](https://web.dev/wakelock/)
that can fall back to playing an invisible video,
which is the way [NoSleep.js](https://github.com/richtr/NoSleep.js/) implements it.
As I wrote above, the experience probably will not be the same,
but the next best thing.
If you want, give [`browser-nativefs`](https://github.com/tomayac/browser-nativefs) a try.
